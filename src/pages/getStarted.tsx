// src/pages/GetStarted.tsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function GetStarted() {
  return (
    <div className="relative min-h-screen overflow-y-auto smooth-scroll">
      {/* Background Image with more subtle animation */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden"
        initial={{ opacity: 0.2 }}
        animate={{ opacity: 0.25 }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
      >
        <img
          src="/ICTbg.jpg"
          alt="ICT Illustration"
          className="w-full h-full object-cover"
          style={{ transform: "scale(1.05)" }} // Slight zoom to prevent edges showing
        />
      </motion.div>

      {/* Hero Section */}
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen text-center px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Welcome to ICT Course Management System
        </motion.h1>
        <motion.p
          className="mb-6 text-lg text-gray-700 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Manage your ICT courses with ease 🚀
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1"
          >
            Get Started
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll Section */}
      <div className="py-20 px-6 bg-white/80 backdrop-blur-sm">
        <motion.h2
          className="text-2xl font-bold text-center mb-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          Why Choose Us?
        </motion.h2>
        <motion.p
          className="max-w-2xl mx-auto text-center text-gray-700 leading-relaxed text-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          Our platform helps you register, track, and manage ICT courses
          efficiently. Whether you're a student or admin, we've built tools
          designed for your success.
        </motion.p>
      </div>

      {/* Additional content to demonstrate smooth scrolling */}
      <div className="py-16 px-6 bg-gradient-to-b from-white to-blue-50">
        <motion.div
          className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          {[
            {
              title: "Easy Registration",
              desc: "Simple and intuitive course registration process.",
            },
            {
              title: "Progress Tracking",
              desc: "Monitor your learning journey with detailed analytics.",
            },
            {
              title: "Resource Access",
              desc: "All your learning materials in one place.",
            },
            {
              title: "Admin Tools",
              desc: "Powerful tools for course administrators.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="p-6 bg-white rounded-xl shadow-md"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <h3 className="font-bold text-lg mb-2 text-blue-600">
                {item.title}
              </h3>
              <p className="text-gray-700">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Final CTA section */}
      <div className="py-20 px-6 text-center bg-blue-600 text-white">
        <motion.h2
          className="text-3xl font-bold mb-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Ready to Get Started?
        </motion.h2>
        <motion.p
          className="max-w-2xl mx-auto mb-8 text-lg"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Join thousands of students and administrators already using our
          platform.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Link
            to="/login"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl shadow-lg font-bold hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1"
          >
            Start Now
          </Link>
        </motion.div>
      </div>

      {/* Add global styles for smooth scrolling */}
      <style>
        {`
          .smooth-scroll {
            scroll-behavior: smooth;
          }
          
          /* Improve rendering performance */
          .backdrop-blur-sm {
            -webkit-backdrop-filter: blur(4px);
            backdrop-filter: blur(4px);
          }
          
          /* Ensure animations are smooth */
          * {
            box-sizing: border-box;
          }
        `}
      </style>
    </div>
  );
}
