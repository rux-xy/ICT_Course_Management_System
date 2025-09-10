// src/types/course.ts
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  price: number;
  imageUrl?: string;
  videoUrl?: string;
  materials: string[];
  enrolledStudents: string[];
  maxStudents: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CourseFormData {
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  price: number;
  maxStudents: number;
  startDate: string;
  endDate: string;
  materials: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  progress: number;
  completed: boolean;
}
