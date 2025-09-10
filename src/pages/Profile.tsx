import Navbar from "../components/layout/Navbar";
import ProfileForm from "../components/profile/ProfileForm";

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and preferences
          </p>
        </div>

        <ProfileForm />
      </div>
    </div>
  );
}
