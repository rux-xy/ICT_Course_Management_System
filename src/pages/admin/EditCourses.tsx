// src/pages/admin/EditCourse.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { courseService } from "../../services/courseService";
import type { Course } from "../../types/course";
import Navbar from "../../components/layout/Navbar";
import CourseForm from "../../components/courses/CourseForm";
import { Card } from "../../components/ui/Card";

export default function EditCourse() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
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

  const handleCourseUpdated = () => {
    navigate("/admin/courses");
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
            <button
              onClick={() => navigate("/admin/courses")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Courses
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
          <p className="text-gray-600 mt-2">
            Update course details and settings
          </p>
        </div>

        <CourseForm course={course} onSubmit={handleCourseUpdated} />
      </div>
    </div>
  );
}
