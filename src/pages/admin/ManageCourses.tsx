// src/pages/admin/ManageCourses.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { courseService } from "../../services/courseService";
import type { Course } from "../../types/course";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../components/layout/Navbar";
import CourseCard from "../../components/courses/CourseCard";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Plus, Search } from "lucide-react";

export default function ManageCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentUser } = useAuth();

  useEffect(() => {
    loadCourses();
  }, [currentUser]);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm]);

  const loadCourses = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const adminCourses = await courseService.getCoursesByInstructor(
        currentUser.uid
      );
      setCourses(adminCourses);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Courses</h1>
            <p className="text-gray-600 mt-2">
              Create, edit, and manage your courses
            </p>
          </div>

          <Link to="/admin/courses/create">
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Add New Course
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search your courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </Card>

        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              {courses.length}
            </div>
            <div className="text-gray-600">Total Courses</div>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {courses.filter((c) => c.isActive).length}
            </div>
            <div className="text-gray-600">Active Courses</div>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-purple-600">
              {courses.reduce(
                (sum, course) => sum + course.enrolledStudents.length,
                0
              )}
            </div>
            <div className="text-gray-600">Total Enrollments</div>
          </Card>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredCourses.length} of {courses.length} courses
          </p>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                showAdminActions
                onCourseUpdate={loadCourses}
              />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <Card className="p-8 text-center">
            <Plus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No courses yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first course to get started
            </p>
            <Link to="/admin/courses/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </Link>
          </Card>
        ) : (
          <Card className="p-8 text-center">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No courses found
            </h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </Card>
        )}
      </div>
    </div>
  );
}
