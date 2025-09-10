// src/components/profile/ProfileForm.tsx
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../lib/firebase";
import { User, Upload, X, Camera } from "lucide-react";

const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser, userProfile, updateUserProfile } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: userProfile?.displayName || "",
      email: currentUser?.email || "",
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

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadProfileImage = async () => {
    if (!imageFile || !currentUser) return null;

    setUploadingImage(true);
    try {
      const imageRef = ref(storage, `users/${currentUser.uid}/profile`);
      console.log("");
      await uploadBytes(imageRef, imageFile);
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setError("");
      setSuccess("");
      setLoading(true);

      let photoURL = currentUser?.photoURL;

      // Upload new profile image if selected
      if (imageFile) {
        photoURL = await uploadProfileImage();
      }

      // Update user profile
      await updateUserProfile({
        displayName: data.displayName,
        photoURL: photoURL || undefined,
      });

      setSuccess("Profile updated successfully!");
      setImageFile(null);
      setImagePreview("");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const currentPhotoURL = imagePreview || currentUser?.photoURL;

  return (
    <Card className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Profile Settings</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Profile Image Section */}
      <div className="text-center mb-8">
        <div className="relative inline-block">
          {currentPhotoURL ? (
            <img
              src={currentPhotoURL}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
              <User className="h-16 w-16 text-gray-400" />
            </div>
          )}

          {/* Camera Icon Overlay */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-1" />
            Change Photo
          </Button>

          {imagePreview && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={removeImage}
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          {...register("displayName")}
          error={errors.displayName?.message}
        />

        <Input
          label="Email Address"
          type="email"
          disabled
          className="bg-gray-50"
          {...register("email")}
          error={errors.email?.message}
        />

        <div className="text-sm text-gray-600 space-y-2">
          <div>
            <strong>Account Type:</strong>{" "}
            {userProfile?.role === "admin" ? "Administrator" : "Student"}
          </div>
          <div>
            <strong>Member Since:</strong>{" "}
            {userProfile?.createdAt
              ? new Date(userProfile.createdAt).toLocaleDateString()
              : "Unknown"}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={loading || uploadingImage} size="lg">
            {loading || uploadingImage ? "Updating..." : "Update Profile"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
