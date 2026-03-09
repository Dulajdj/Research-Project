"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for redirection
import {
  User,
  Building2,
  Mail,
  Lock,
  Brain,
  LogIn,
  UserPlus,
  Menu,
  X,
  Eye,
  EyeOff,
  Loader2, // Import Loader for loading state
} from "lucide-react";

export default function Login() {
  const router = useRouter(); // Initialize router
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [errors, setErrors] = useState({});
  
  const [loginForm, setLoginForm] = useState({
    role: "",
    email: "",
    password: "",
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate role (UI requires selection)
    if (!loginForm.role) {
      newErrors.role = "Please select your role";
    }

    // Validate email
    if (!loginForm.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(loginForm.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate password
    if (!loginForm.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true); // Start loading

    try {
      // Call the Login API
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // --- SUCCESS & REDIRECTION LOGIC ---
        
        // Optional: Store user info in localStorage for global access
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect based on the role returned from the DATABASE (data.user.role)
        // We prioritize the database role over the UI selection for accuracy
        if (data.user.role === "company") {
          router.push("/company/jobpost-dashbord");
        } else {
          router.push("/"); // Default page for applicants
        }
      } else {
        // Handle API errors (e.g., Invalid credentials)
        setErrors({ form: data.message || "Login failed" });
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Something went wrong. Please check your connection.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <nav className="fixed w-full bg-slate-900/80 backdrop-blur-lg z-50 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => (window.location.href = "/")}
            >
              <Brain className="w-8 h-8 text-purple-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Career Guide
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-300 hover:text-purple-400 transition">Home</a>
              <a href="/" className="text-gray-300 hover:text-purple-400 transition">Features</a>
              <a href="/about" className="text-gray-300 hover:text-purple-400 transition">About</a>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => (window.location.href = "/auth/login")}
                  className="flex items-center space-x-2 text-purple-400 font-semibold transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => (window.location.href = "/auth/signup")}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-800/95 backdrop-blur-lg">
            <div className="px-4 pt-2 pb-4 space-y-2">
              <a href="/" className="block text-gray-300 hover:text-purple-400 py-2">Home</a>
              <a href="/#features" className="block text-gray-300 hover:text-purple-400 py-2">Features</a>
              <a href="/about" className="block text-gray-300 hover:text-purple-400 py-2">About</a>
              <button
                onClick={() => (window.location.href = "/auth/login")}
                className="w-full flex items-center justify-center space-x-2 text-purple-400 font-semibold py-2 border border-purple-500 rounded-full mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>
              <button
                onClick={() => (window.location.href = "/auth/signup")}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 sm:p-12">
            {/* Login Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Welcome <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Back</span>
              </h1>
              <p className="text-gray-300 text-sm">
                Login to access your account
              </p>
            </div>

            {/* Login Form */}
            <div className="space-y-5">
              
              {/* Role Selection */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">Select Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLoginForm((prev) => ({ ...prev, role: "applicant" }))}
                    className={`relative overflow-hidden rounded-xl p-4 border transition-all duration-300 ${
                      loginForm.role === "applicant"
                        ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-purple-500"
                        : "bg-slate-900/60 border-white/10 hover:border-purple-500/50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <User className="w-6 h-6 text-purple-400" />
                      <span className="text-sm font-medium text-white">Applicant</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginForm((prev) => ({ ...prev, role: "company" }))}
                    className={`relative overflow-hidden rounded-xl p-4 border transition-all duration-300 ${
                      loginForm.role === "company"
                        ? "bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border-cyan-500"
                        : "bg-slate-900/60 border-white/10 hover:border-cyan-500/50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="w-6 h-6 text-cyan-400" />
                      <span className="text-sm font-medium text-white">Company</span>
                    </div>
                  </button>
                </div>
                {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className={`w-full rounded-2xl bg-slate-900/60 border ${
                      errors.email ? "border-red-500" : "border-white/10"
                    } pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                      loginForm.role === "company" ? "focus:ring-cyan-500/60" : "focus:ring-purple-500/60"
                    }`}
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={loginForm.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className={`w-full rounded-2xl bg-slate-900/60 border ${
                      errors.password ? "border-red-500" : "border-white/10"
                    } pl-12 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                      loginForm.role === "company" ? "focus:ring-cyan-500/60" : "focus:ring-purple-500/60"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <a
                  href="#"
                  className={`text-sm transition ${
                    loginForm.role === "company"
                      ? "text-cyan-400 hover:text-cyan-300"
                      : "text-purple-400 hover:text-purple-300"
                  }`}
                >
                  Forgot Password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-semibold text-white shadow-lg transition disabled:opacity-70 disabled:cursor-not-allowed ${
                  loginForm.role === "company"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-cyan-700/20 hover:shadow-cyan-600/30"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 shadow-purple-700/20 hover:shadow-purple-600/30"
                }`}
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isLoading ? "Logging in..." : "Login"}
              </button>

              {/* Sign Up Link */}
              <div className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <a
                  href="/auth/signup"
                  className={`font-semibold transition ${
                    loginForm.role === "company"
                      ? "text-cyan-400 hover:text-cyan-300"
                      : "text-purple-400 hover:text-purple-300"
                  }`}
                >
                  Sign Up
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="w-6 h-6 text-purple-400" />
                <span className="text-lg font-bold text-white">AI Career Guide</span>
              </div>
              <p className="text-gray-400 text-sm">Empowering careers with AI technology tailored for the Sri Lankan job market.</p>
            </div>
            {/* ... Other footer links remain the same ... */}
            <div>
              <h4 className="text-white font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/resume-builder" className="hover:text-purple-400 transition">Resume Builder</a></li>
                <li><a href="/interview-practice" className="hover:text-purple-400 transition">Interview Practice</a></li>
                <li><a href="/career-guidance" className="hover:text-purple-400 transition">Career Guidance</a></li>
                <li><a href="/InterviewDashboard" className="hover:text-purple-400 transition">Job Matching</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/about" className="hover:text-purple-400 transition">About Us</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Contact</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-purple-400 transition">LinkedIn</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Facebook</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Twitter</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 AI Career Guidance System. All rights reserved. Made for Sri Lankan Job Market.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}