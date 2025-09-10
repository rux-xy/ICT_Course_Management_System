// src/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { courseService } from "../services/courseService";
import type { Course, Enrollment } from "../types/course";
import { Card } from "../components/ui/Card";
import CourseCard from "../components/courses/CourseCard";
import Navbar from "../components/layout/Navbar";
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Plus,
  Calendar,
} from "lucide-react";

export default function Dashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const { currentUser, userProfile } = useAuth();
  const isAdmin = userProfile?.role === "admin";

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      if (isAdmin) {
        // Admin: Load all courses created by them
        const adminCourses = await courseService.getCoursesByInstructor(
          currentUser.uid
        );
        setCourses(adminCourses);
      } else {
        // Student: Load enrolled courses
        const userEnrollments = await courseService.getStudentEnrollments(
          currentUser.uid
        );
        setEnrollments(userEnrollments);

        // Get course details for enrolled courses
        const coursePromises = userEnrollments.map((enrollment) =>
          courseService.getCourseById(enrollment.courseId)
        );
        const enrolledCoursesData = await Promise.all(coursePromises);
        setEnrolledCourses(
          enrolledCoursesData.filter((course) => course !== null) as Course[]
        );
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    if (isAdmin) {
      const totalStudents = courses.reduce(
        (sum, course) => sum + course.enrolledStudents.length,
        0
      );
      const activeCourses = courses.filter((course) => course.isActive).length;

      return {
        totalCourses: courses.length,
        totalStudents,
        activeCourses,
        avgEnrollment:
          courses.length > 0 ? Math.round(totalStudents / courses.length) : 0,
      };
    } else {
      const completedCourses = enrollments.filter(
        (enrollment) => enrollment.completed
      ).length;
      const totalProgress = enrollments.reduce(
        (sum, enrollment) => sum + enrollment.progress,
        0
      );
      const avgProgress =
        enrollments.length > 0
          ? Math.round(totalProgress / enrollments.length)
          : 0;

      return {
        enrolledCourses: enrollments.length,
        completedCourses,
        avgProgress,
        activeLearning: enrollments.length - completedCourses,
      };
    }
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userProfile?.displayName || currentUser?.email}
          </h1>
          <p className="text-gray-600 mt-2">
            {isAdmin
              ? "Manage your courses and track student progress"
              : "Continue your learning journey"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isAdmin ? (
            <>
              <Card className="p-6">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Courses
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalCourses}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Students
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalStudents}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Active Courses
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.activeCourses}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Avg. Enrollment
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.avgEnrollment}
                    </p>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <>
              <Card className="p-6">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Enrolled Courses
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.enrolledCourses}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Completed
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.completedCourses}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Avg. Progress
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.avgProgress}%
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Active Learning
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.activeLearning}
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>

          <div className="flex flex-wrap gap-4">
            {isAdmin ? (
              <>
                <Link to="/admin/courses/create">
                  <div className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Course
                  </div>
                </Link>
                <Link to="/admin/courses">
                  <div className="flex items-center bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Manage Courses
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link to="/courses">
                  <div className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Browse Courses
                  </div>
                </Link>
                <Link to="/profile">
                  <div className="flex items-center bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                    <Users className="h-5 w-5 mr-2" />
                    Update Profile
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Courses Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isAdmin ? "Your Courses" : "My Enrolled Courses"}
            </h2>
            <Link
              to={isAdmin ? "/admin/courses" : "/courses"}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </Link>
          </div>

          {isAdmin ? (
            courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.slice(0, 6).map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    showAdminActions
                    onCourseUpdate={loadDashboardData}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No courses yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first course to get started
                </p>
                <Link to="/admin/courses/create">
                  <div className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Course
                  </div>
                </Link>
              </Card>
            )
          ) : enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.slice(0, 6).map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onCourseUpdate={loadDashboardData}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No enrolled courses
              </h3>
              <p className="text-gray-600 mb-4">
                Browse available courses and start learning
              </p>
              <Link to="/courses">
                <div className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Courses
                </div>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
