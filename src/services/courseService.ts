// src/services/courseService.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../lib/firebase";
import type { Course, CourseFormData, Enrollment } from "../types/course";

export class CourseService {
  private coursesCollection = collection(db, "courses");
  private enrollmentsCollection = collection(db, "enrollments");

  async getAllCourses(): Promise<Course[]> {
    const querySnapshot = await getDocs(
      query(this.coursesCollection, orderBy("createdAt", "desc"))
    );
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate.toDate(),
          endDate: doc.data().endDate.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        } as Course)
    );
  }

  async getCourseById(id: string): Promise<Course | null> {
    const docRef = doc(this.coursesCollection, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        startDate: data.startDate.toDate(),
        endDate: data.endDate.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Course;
    }

    return null;
  }

  async createCourse(
    courseData: CourseFormData,
    createdBy: string
  ): Promise<string> {
    const course = {
      ...courseData,
      price: Number(courseData.price),
      maxStudents: Number(courseData.maxStudents),
      startDate: Timestamp.fromDate(new Date(courseData.startDate)),
      endDate: Timestamp.fromDate(new Date(courseData.endDate)),
      materials: courseData.materials
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m),
      enrolledStudents: [],
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy,
    };

    const docRef = await addDoc(this.coursesCollection, course);
    return docRef.id;
  }

  async updateCourse(
    id: string,
    courseData: Partial<CourseFormData>
  ): Promise<void> {
    const docRef = doc(this.coursesCollection, id);
    const updateData: any = {
      ...courseData,
      updatedAt: Timestamp.now(),
    };

    if (courseData.price) updateData.price = Number(courseData.price);
    if (courseData.maxStudents)
      updateData.maxStudents = Number(courseData.maxStudents);
    if (courseData.startDate)
      updateData.startDate = Timestamp.fromDate(new Date(courseData.startDate));
    if (courseData.endDate)
      updateData.endDate = Timestamp.fromDate(new Date(courseData.endDate));
    if (courseData.materials) {
      updateData.materials = courseData.materials
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m);
    }

    await updateDoc(docRef, updateData);
  }

  async deleteCourse(id: string): Promise<void> {
    // Delete course image if exists
    const course = await this.getCourseById(id);
    if (course?.imageUrl) {
      try {
        const imageRef = ref(storage, `courses/${id}/image`);
        await deleteObject(imageRef);
      } catch (error) {
        console.error("Error deleting course image:", error);
      }
    }

    // Delete course video if exists
    if (course?.videoUrl) {
      try {
        const videoRef = ref(storage, `courses/${id}/video`);
        await deleteObject(videoRef);
      } catch (error) {
        console.error("Error deleting course video:", error);
      }
    }

    // Delete all enrollments for this course
    const enrollmentsQuery = query(
      this.enrollmentsCollection,
      where("courseId", "==", id)
    );
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
    const deletePromises = enrollmentsSnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );
    await Promise.all(deletePromises);

    // Delete the course
    await deleteDoc(doc(this.coursesCollection, id));
  }

  async uploadCourseImage(courseId: string, imageFile: File): Promise<string> {
    const imageRef = ref(storage, `courses/${courseId}/image`);
    await uploadBytes(imageRef, imageFile);
    const downloadURL = await getDownloadURL(imageRef);

    // Update course with image URL
    await updateDoc(doc(this.coursesCollection, courseId), {
      imageUrl: downloadURL,
      updatedAt: Timestamp.now(),
    });

    return downloadURL;
  }

  async uploadCourseVideo(courseId: string, videoFile: File): Promise<string> {
    const videoRef = ref(storage, `courses/${courseId}/video`);
    await uploadBytes(videoRef, videoFile);
    const downloadURL = await getDownloadURL(videoRef);

    // Update course with video URL
    await updateDoc(doc(this.coursesCollection, courseId), {
      videoUrl: downloadURL,
      updatedAt: Timestamp.now(),
    });

    return downloadURL;
  }

  async enrollStudent(courseId: string, userId: string): Promise<void> {
    // Add student to course
    await updateDoc(doc(this.coursesCollection, courseId), {
      enrolledStudents: arrayUnion(userId),
      updatedAt: Timestamp.now(),
    });

    // Create enrollment record
    await addDoc(this.enrollmentsCollection, {
      userId,
      courseId,
      enrolledAt: Timestamp.now(),
      progress: 0,
      completed: false,
    });
  }

  async unenrollStudent(courseId: string, userId: string): Promise<void> {
    // Remove student from course
    await updateDoc(doc(this.coursesCollection, courseId), {
      enrolledStudents: arrayRemove(userId),
      updatedAt: Timestamp.now(),
    });

    // Delete enrollment record
    const enrollmentQuery = query(
      this.enrollmentsCollection,
      where("courseId", "==", courseId),
      where("userId", "==", userId)
    );
    const enrollmentSnapshot = await getDocs(enrollmentQuery);
    enrollmentSnapshot.docs.forEach((doc) => deleteDoc(doc.ref));
  }

  async getStudentEnrollments(userId: string): Promise<Enrollment[]> {
    const enrollmentsQuery = query(
      this.enrollmentsCollection,
      where("userId", "==", userId),
      orderBy("enrolledAt", "desc")
    );
    const querySnapshot = await getDocs(enrollmentsQuery);

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          enrolledAt: doc.data().enrolledAt.toDate(),
        } as Enrollment)
    );
  }

  async getCoursesByInstructor(instructorId: string): Promise<Course[]> {
    const coursesQuery = query(
      this.coursesCollection,
      where("createdBy", "==", instructorId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(coursesQuery);

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate.toDate(),
          endDate: doc.data().endDate.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        } as Course)
    );
  }
}

export const courseService = new CourseService();
