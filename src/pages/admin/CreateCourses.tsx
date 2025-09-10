// src/pages/admin/CreateCourse.tsx
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import CourseForm from "../../components/courses/CourseForm";

export default function CreateCourse() {
  const navigate = useNavigate();

  const handleCourseCreated = () => {
    navigate("/admin/courses");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Course
          </h1>
          <p className="text-gray-600 mt-2">
            Fill in the details to create a new ICT course
          </p>
        </div>

        <CourseForm onSubmit={handleCourseCreated} />
      </div>
    </div>
  );
}
