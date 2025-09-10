// src/components/layout/Navbar.tsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/Button";
import {
  BookOpen,
  User,
  LogOut,
  Menu,
  X,
  Plus,
  Settings,
  Home,
  GraduationCap,
  Users,
  ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCoursesDropdownOpen, setIsCoursesDropdownOpen] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const isAdmin = userProfile?.role === "admin";

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const NavLink = ({
    to,
    children,
    className = "",
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActivePath(to)
          ? "bg-blue-100 text-blue-700"
          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
      } ${className}`}
      onClick={() => setIsMenuOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-800">
                ICT Course Manager
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink to="/dashboard">
              <Home className="h-4 w-4 mr-1 inline" />
              Dashboard
            </NavLink>

            {/* Courses Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCoursesDropdownOpen(!isCoursesDropdownOpen)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActivePath("/courses")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Courses</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {/* Dropdown Menu */}
              {isCoursesDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div
                    className="py-1"
                    onClick={() => setIsCoursesDropdownOpen(false)}
                  >
                    <Link
                      to="/courses"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <GraduationCap className="h-4 w-4 mr-3" />
                      Browse All Courses
                    </Link>

                    {isAdmin && (
                      <>
                        <hr className="my-1" />
                        <div className="px-4 py-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Admin Actions
                          </p>
                        </div>
                        <Link
                          to="/admin/courses"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Manage Courses
                        </Link>
                        <Link
                          to="/admin/courses/create"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Plus className="h-4 w-4 mr-3" />
                          Create New Course
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions for Admin */}
            {isAdmin && (
              <Link to="/admin/courses/create">
                <Button variant="primary" size="sm" className="ml-2">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Course
                </Button>
              </Link>
            )}

            {/* User Profile Section */}
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
              <div className="text-sm">
                <div className="font-medium text-gray-700">
                  {userProfile?.displayName || "User"}
                </div>
                <div className="text-xs text-gray-500">
                  {isAdmin ? "Administrator" : "Student"}
                </div>
              </div>
            </div>

            <Link to="/profile">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Profile
              </Button>
            </Link>

            <Button variant="secondary" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* User Info */}
            <div className="flex items-center space-x-3 px-3 py-3 border-b border-gray-200">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <div className="font-medium text-gray-900">
                  {userProfile?.displayName || "User"}
                </div>
                <div className="text-sm text-gray-500">
                  {isAdmin ? "Administrator" : "Student"}
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <NavLink to="/dashboard" className="block">
              <Home className="h-4 w-4 mr-2 inline" />
              Dashboard
            </NavLink>

            <NavLink to="/courses" className="block">
              <BookOpen className="h-4 w-4 mr-2 inline" />
              Browse Courses
            </NavLink>

            {isAdmin && (
              <>
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin Menu
                  </p>
                </div>
                <NavLink to="/admin/courses" className="block">
                  <Settings className="h-4 w-4 mr-2 inline" />
                  Manage Courses
                </NavLink>
                <NavLink to="/admin/courses/create" className="block">
                  <Plus className="h-4 w-4 mr-2 inline" />
                  Create Course
                </NavLink>
              </>
            )}

            <NavLink to="/profile" className="block">
              <User className="h-4 w-4 mr-2 inline" />
              Profile Settings
            </NavLink>

            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
            >
              <LogOut className="h-4 w-4 mr-2 inline" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {isCoursesDropdownOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsCoursesDropdownOpen(false)}
        />
      )}
    </nav>
  );
}
