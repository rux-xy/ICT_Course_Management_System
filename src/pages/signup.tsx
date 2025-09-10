import { motion } from "framer-motion";
import SignupForm from "../components/auth/SignupForm";

export default function Signup() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <SignupForm />
      </motion.div>
    </div>
  );
}
