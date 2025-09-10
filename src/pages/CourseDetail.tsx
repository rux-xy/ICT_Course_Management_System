// src/pages/CourseDetail.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { courseService } from "../services/courseService";
import type { Course } from "../types/course";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/layout/Navbar";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import {
  Calendar,
  Users,
  Clock,
  DollarSign,
  BookOpen,
  Play,
  ArrowLeft,
  Award,
  Download,
  FileText,
  Image,
  Video,
} from "lucide-react";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadCourse();
    }
  }, [id]);

  const loadCourse = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const courseData = await courseService.getCourseById(id);
      setCourse(courseData);
    } catch (error) {
      console.error("Error loading course:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!currentUser || !course) return;

    try {
      setEnrolling(true);
      await courseService.enrollStudent(course.id, currentUser.uid);
      loadCourse(); // Reload to update enrollment status
    } catch (error) {
      console.error("Failed to enroll:", error);
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!currentUser || !course) return;

    if (!window.confirm("Are you sure you want to unenroll from this course?"))
      return;

    try {
      setEnrolling(true);
      await courseService.unenrollStudent(course.id, currentUser.uid);
      loadCourse(); // Reload to update enrollment status
    } catch (error) {
      console.error("Failed to unenroll:", error);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Course Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The course you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate("/courses")}>
              Back to Courses
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const isEnrolled =
    currentUser && course.enrolledStudents.includes(currentUser.uid);
  const isFull = course.enrolledStudents.length >= course.maxStudents;
  const isAdmin = userProfile?.role === "admin";
  const isOwner = currentUser?.uid === course.createdBy;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              {/* Course Image */}
              {course.imageUrl ? (
                <div className="relative">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                  {course.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black bg-opacity-50 rounded-full p-4 cursor-pointer hover:bg-opacity-70 transition-all">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-t-lg">
                  <div className="text-center">
                    <Image className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No course image</p>
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      course.level === "Beginner"
                        ? "bg-green-100 text-green-800"
                        : course.level === "Intermediate"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {course.level}
                  </span>

                  <div className="text-2xl font-bold text-blue-600">
                    ${course.price}
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {course.title}
                </h1>

                {/* Admin Actions */}
                {(isAdmin || isOwner) && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-3">
                      Admin Actions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/admin/courses/${course.id}/edit`)
                        }
                      >
                        Edit Course
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/admin/courses")}
                      >
                        Manage Courses
                      </Button>
                    </div>
                  </div>
                )}

                {/* Course Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Users className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Instructor</p>
                    <p className="font-semibold">{course.instructor}</p>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Clock className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold">{course.duration}</p>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Calendar className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-semibold">
                      {course.startDate.toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Award className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-semibold">{course.category}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Description
                  </h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {course.description}
                  </p>
                </div>

                {/* Course Materials */}
                {course.materials.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      <FileText className="inline h-5 w-5 mr-2" />
                      Course Materials
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {course.materials.map((material, index) => (
                        <div
                          key={index}
                          className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200"
                        >
                          <FileText className="h-4 w-4 text-blue-600 mr-3" />
                          <span className="text-blue-800 font-medium">
                            {material}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Course Media */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Course Media
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Course Image */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Image className="h-5 w-5 text-gray-600 mr-2" />
                        <span className="font-medium">Course Image</span>
                      </div>
                      {course.imageUrl ? (
                        <div className="text-green-600 text-sm">
                          ✓ Image uploaded
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">
                          No image uploaded
                        </div>
                      )}
                    </div>

                    {/* Course Video */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Video className="h-5 w-5 text-gray-600 mr-2" />
                        <span className="font-medium">Course Video</span>
                      </div>
                      {course.videoUrl ? (
                        <div className="text-green-600 text-sm">
                          ✓ Video uploaded
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">
                          No video uploaded
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Course Video Player */}
                {course.videoUrl && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      <Play className="inline h-5 w-5 mr-2" />
                      Course Preview
                    </h2>
                    <div className="bg-black rounded-lg overflow-hidden">
                      <video
                        controls
                        className="w-full h-64 md:h-96"
                        poster={course.imageUrl}
                      >
                        <source src={course.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ${course.price}
                  </div>
                  <div className="text-sm text-gray-600">
                    {course.enrolledStudents.length}/{course.maxStudents}{" "}
                    enrolled
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          (course.enrolledStudents.length /
                            course.maxStudents) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {currentUser && !isOwner && (
                  <div className="space-y-4 mb-6">
                    {isEnrolled ? (
                      <div>
                        <div className="bg-green-100 text-green-800 text-center py-3 rounded-lg mb-4 font-semibold">
                          ✓ You are enrolled
                        </div>
                        <Button
                          variant="secondary"
                          onClick={handleUnenroll}
                          disabled={enrolling}
                          className="w-full"
                        >
                          {enrolling ? "Processing..." : "Unenroll"}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={handleEnroll}
                        disabled={enrolling || isFull}
                        className="w-full"
                        size="lg"
                      >
                        {enrolling
                          ? "Enrolling..."
                          : isFull
                          ? "Course Full"
                          : "Enroll Now"}
                      </Button>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900">Course Details</h3>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-semibold">
                      {course.startDate.toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">End Date:</span>
                    <span className="font-semibold">
                      {course.endDate.toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-semibold">{course.level}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-semibold">{course.category}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-semibold">
                      {course.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
