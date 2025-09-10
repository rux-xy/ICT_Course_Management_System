// src/components/courses/CourseForm.tsx
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { courseService } from "../../services/courseService";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import type { Course } from "../../types/course";
import { Upload, X } from "lucide-react";

const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  instructor: z.string().min(2, "Instructor name is required"),
  duration: z.string().min(1, "Duration is required"),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  category: z.string().min(2, "Category is required"),
  price: z.preprocess(
    (val) => Number(val),
    z.number().min(0, "Price is required")
  ),
  maxStudents: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Max students is required")
  ),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  materials: z.string(),
});

type CourseFormProps = {
  course?: Course;
  onSubmit?: () => void;
};

type CourseFormData = z.infer<typeof courseSchema>;

export default function CourseForm({ course, onSubmit }: CourseFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    course?.imageUrl || ""
  );

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema) as any, // <- temporary cast to satisfy TS
    defaultValues: course
      ? {
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          duration: course.duration,
          level: course.level,
          category: course.category,
          price: course.price,
          maxStudents: course.maxStudents,
          startDate: course.startDate.toISOString().split("T")[0],
          endDate: course.endDate.toISOString().split("T")[0],
          materials: course.materials.join(", "),
        }
      : {
          price: 0,
          maxStudents: 1,
        },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const submitForm = async (data: CourseFormData) => {
    if (!currentUser) return;

    try {
      setError("");
      setLoading(true);

      let courseId: string;

      if (course) {
        // Update existing course
        await courseService.updateCourse(course.id, data);
        courseId = course.id;
      } else {
        // Create new course
        courseId = await courseService.createCourse(data, currentUser.uid);
      }

      // Upload image if provided
      if (imageFile) {
        await courseService.uploadCourseImage(courseId, imageFile);
      }

      // Upload video if provided
      if (videoFile) {
        await courseService.uploadCourseVideo(courseId, videoFile);
      }

      if (onSubmit) {
        onSubmit();
      } else {
        navigate("/admin/courses");
      }
    } catch (err: any) {
      setError(
        err.message || `Failed to ${course ? "update" : "create"} course`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {course ? "Edit Course" : "Create New Course"}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Course Title"
            placeholder="Enter course title"
            {...register("title")}
            error={errors.title?.message}
          />

          <Input
            label="Instructor"
            placeholder="Instructor name"
            {...register("instructor")}
            error={errors.instructor?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter course description"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Duration"
            placeholder="e.g., 8 weeks"
            {...register("duration")}
            error={errors.duration?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Level
            </label>
            <select
              {...register("level")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            {errors.level && (
              <p className="text-red-500 text-sm mt-1">
                {errors.level.message}
              </p>
            )}
          </div>

          <Input
            label="Category"
            placeholder="e.g., Web Development"
            {...register("category")}
            error={errors.category?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Price ($)"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            {...register("price")}
            error={errors.price?.message}
          />

          <Input
            label="Max Students"
            type="number"
            min="1"
            placeholder="30"
            {...register("maxStudents")}
            error={errors.maxStudents?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Start Date"
            type="date"
            {...register("startDate")}
            error={errors.startDate?.message}
          />

          <Input
            label="End Date"
            type="date"
            {...register("endDate")}
            error={errors.endDate?.message}
          />
        </div>

        <div>
          <Input
            label="Course Materials (comma separated)"
            placeholder="Textbook, Lab Manual, Online Resources"
            {...register("materials")}
            error={errors.materials?.message}
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Course Image
          </label>

          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Course preview"
                className="w-32 h-32 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => imageInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500"
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Click to upload course image
              </p>
            </div>
          )}

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Video Upload */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Course Video
          </label>

          {videoFile ? (
            <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
              <span className="text-sm text-gray-700">{videoFile.name}</span>
              <button
                type="button"
                onClick={removeVideo}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => videoInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500"
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Click to upload course video
              </p>
            </div>
          )}

          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="hidden"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/courses")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : course ? "Update Course" : "Create Course"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
