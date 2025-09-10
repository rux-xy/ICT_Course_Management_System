// src/components/courses/CourseCard.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import type { Course } from "../../types/course";
import { useAuth } from "../../contexts/AuthContext";
import { courseService } from "../../services/courseService";
import { Button } from "../ui/Button";
import {
  Calendar,
  Users,
  Clock,
  Edit,
  Trash2,
  BookOpen,
  Play,
} from "lucide-react";

interface CourseCardProps {
  course: Course;
  showAdminActions?: boolean;
  onCourseUpdate?: () => void;
}

export default function CourseCard({
  course,
  showAdminActions = false,
  onCourseUpdate,
}: CourseCardProps) {
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const { currentUser, userProfile } = useAuth();

  const isEnrolled =
    currentUser && course.enrolledStudents.includes(currentUser.uid);
  const isFull = course.enrolledStudents.length >= course.maxStudents;
  const isAdmin = userProfile?.role === "admin";

  const handleEnroll = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      await courseService.enrollStudent(course.id, currentUser.uid);
      setEnrolled(true);
      onCourseUpdate?.();
    } catch (error) {
      console.error("Failed to enroll:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      await courseService.unenrollStudent(course.id, currentUser.uid);
      setEnrolled(false);
      onCourseUpdate?.();
    } catch (error) {
      console.error("Failed to unenroll:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      setLoading(true);
      await courseService.deleteCourse(course.id);
      onCourseUpdate?.();
    } catch (error) {
      console.error("Failed to delete course:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Course Image */}
      <div className="relative h-48 bg-gray-200">
        {course.imageUrl ? (
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-gray-400" />
          </div>
        )}

        {/* Level Badge */}
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              course.level === "Beginner"
                ? "bg-green-100 text-green-800"
                : course.level === "Intermediate"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {course.level}
          </span>
        </div>

        {/* Video Icon */}
        {course.videoUrl && (
          <div className="absolute top-4 right-4">
            <div className="bg-black bg-opacity-50 rounded-full p-2">
              <Play className="h-5 w-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
            {course.title}
          </h3>
          <div className="text-lg font-bold text-blue-600">${course.price}</div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {course.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>Instructor: {course.instructor}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>Duration: {course.duration}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {formatDate(course.startDate)} - {formatDate(course.endDate)}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>
              {course.enrolledStudents.length}/{course.maxStudents} students
            </span>
          </div>
        </div>

        {/* Course Materials */}
        {course.materials.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Materials:
            </h4>
            <div className="flex flex-wrap gap-1">
              {course.materials.slice(0, 3).map((material, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                >
                  {material}
                </span>
              ))}
              {course.materials.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  +{course.materials.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {showAdminActions && isAdmin ? (
            <div className="flex gap-2">
              <Link to={`/admin/courses/${course.id}/edit`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          ) : (
            <>
              <Link to={`/courses/${course.id}`}>
                <Button variant="outline" size="sm" className="w-full mb-2">
                  View Details
                </Button>
              </Link>

              {currentUser &&
                (isEnrolled || enrolled ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleUnenroll}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Processing..." : "Unenroll"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleEnroll}
                    disabled={loading || isFull}
                    size="sm"
                    className="w-full"
                  >
                    {loading
                      ? "Enrolling..."
                      : isFull
                      ? "Course Full"
                      : "Enroll Now"}
                  </Button>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
