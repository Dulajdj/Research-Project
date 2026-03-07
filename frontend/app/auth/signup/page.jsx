"use client";

import React, { useState } from "react";
import {
  User,
  Building2,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  UserCircle,
  Briefcase,
  MapPin,
  FileText,
  Brain,
  LogIn,
  UserPlus,
  Menu,
  X,
  Lock,
  Eye,
  EyeOff,
  Loader2, // Added Loader Icon
} from "lucide-react";

export default function SignUp() {
  const [step, setStep] = useState("role");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // --- NEW: Loading State ---
  const [isLoading, setIsLoading] = useState(false); 
  const [errors, setErrors] = useState({});

  const [applicantForm, setApplicantForm] = useState({
    fullName: "",
    nameWithInitials: "",
    birthday: "",
    gender: "",
    contactNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    industry: "",
    registrationNumber: "",
    branchLocation: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });

  const sriLankanDistricts = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle",
    "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle",
    "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
    "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
    "Trincomalee", "Vavuniya",
  ];

  // --- Validation Functions ---
  const validateAge = (birthday) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 16;
    }
    return age >= 16;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateSriLankanPhone = (phone) => {
    const phoneRegex = /^(?:\+94|0)(?:7[0-9]|[1-9][0-9])\d{7}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleApplicantChange = (e) => {
    const { name, value } = e.target;
    setApplicantForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleGoBack = () => {
    setStep("role");
    setErrors({});
  };

  // --- UPDATED: Handle Applicant Submit ---
  const handleApplicantSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate birthday
    if (!applicantForm.birthday) newErrors.birthday = "Birthday is required";
    else if (!validateAge(applicantForm.birthday)) newErrors.birthday = "You must be at least 16 years old";

    // Validate email
    if (!applicantForm.email) newErrors.email = "Email is required";
    else if (!validateEmail(applicantForm.email)) newErrors.email = "Please enter a valid email address";

    // Validate contact number
    if (!applicantForm.contactNumber) newErrors.contactNumber = "Contact number is required";
    else if (!validateSriLankanPhone(applicantForm.contactNumber)) newErrors.contactNumber = "Please enter a valid Sri Lankan phone number";

    // Validate password
    if (!applicantForm.password) newErrors.password = "Password is required";
    else if (!validatePassword(applicantForm.password)) newErrors.password = "Password must be at least 8 characters long";

    // Validate confirm password
    if (!applicantForm.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (applicantForm.password !== applicantForm.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // --- Backend Integration ---
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'applicant', // Explicitly setting the role
          ...applicantForm
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Account created successfully! Redirecting to Login...");
        window.location.href = "/auth/login";
      } else {
        alert(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- UPDATED: Handle Company Submit ---
  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate email
    if (!companyForm.email) newErrors.email = "Email is required";
    else if (!validateEmail(companyForm.email)) newErrors.email = "Please enter a valid email address";

    // Validate contact number
    if (!companyForm.contactNumber) newErrors.contactNumber = "Contact number is required";
    else if (!validateSriLankanPhone(companyForm.contactNumber)) newErrors.contactNumber = "Please enter a valid Sri Lankan phone number";

    // Validate password
    if (!companyForm.password) newErrors.password = "Password is required";
    else if (!validatePassword(companyForm.password)) newErrors.password = "Password must be at least 8 characters long";

    // Validate confirm password
    if (!companyForm.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (companyForm.password !== companyForm.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // --- Backend Integration ---
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'company', // Explicitly setting the role
          ...companyForm
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Company registered successfully! Redirecting to Login...");
        window.location.href = "/auth/login";
      } else {
        alert(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please check your connection.");
    } finally {
      setIsLoading(false);
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
                  className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition"
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
                className="w-full flex items-center justify-center space-x-2 text-gray-300 hover:text-purple-400 py-2 border border-gray-600 rounded-full mt-2"
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
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Role Selection */}
          {step === "role" && (
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 sm:p-12">
              <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                  Choose Your{" "}
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    Role
                  </span>
                </h1>
                <p className="text-gray-300">
                  Select how you want to join our platform
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Applicant Button */}
                <button
                  onClick={() => setStep("applicant")}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 p-8 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Applicant
                    </h3>
                    <p className="text-sm text-gray-300">
                      Looking for your dream job
                    </p>
                  </div>
                </button>

                {/* Company Button */}
                <button
                  onClick={() => setStep("company")}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 p-8 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Company
                    </h3>
                    <p className="text-sm text-gray-300">
                      Hiring talented individuals
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Applicant Sign Up Form */}
          {step === "applicant" && (
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 sm:p-12">
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Go Back</span>
                </button>
                <div className="flex items-center gap-2 text-purple-300">
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">Applicant</span>
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Create Your{" "}
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Account
                  </span>
                </h2>
                <p className="text-gray-300 text-sm">
                  Fill in your details to get started
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Full Name</label>
                  <div className="relative">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={applicantForm.fullName}
                      onChange={handleApplicantChange}
                      placeholder="John Doe"
                      required
                      className="w-full rounded-2xl bg-slate-900/60 border border-white/10 pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Name with Initials</label>
                  <div className="relative">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="nameWithInitials"
                      value={applicantForm.nameWithInitials}
                      onChange={handleApplicantChange}
                      placeholder="J.D. Doe"
                      required
                      className="w-full rounded-2xl bg-slate-900/60 border border-white/10 pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Birthday</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="birthday"
                      value={applicantForm.birthday}
                      onChange={handleApplicantChange}
                      required
                      className={`w-full rounded-2xl bg-slate-900/60 border ${
                        errors.birthday ? "border-red-500" : "border-white/10"
                      } pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60`}
                    />
                  </div>
                  {errors.birthday && <p className="text-red-400 text-xs mt-1">{errors.birthday}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={applicantForm.gender}
                    onChange={handleApplicantChange}
                    required
                    className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/60 bg-slate-900"
                  >
                    <option value="" className="text-gray-500">Select Gender</option>
                    <option value="male" className="text-black">Male</option>
                    <option value="female" className="text-black">Female</option>
                    <option value="other" className="text-black">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="contactNumber"
                      value={applicantForm.contactNumber}
                      onChange={handleApplicantChange}
                      placeholder="+94 77 123 4567"
                      required
                      className={`w-full rounded-2xl bg-slate-900/60 border ${
                        errors.contactNumber ? "border-red-500" : "border-white/10"
                      } pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60`}
                    />
                  </div>
                  {errors.contactNumber && <p className="text-red-400 text-xs mt-1">{errors.contactNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={applicantForm.email}
                      onChange={handleApplicantChange}
                      placeholder="you@example.com"
                      required
                      className={`w-full rounded-2xl bg-slate-900/60 border ${
                        errors.email ? "border-red-500" : "border-white/10"
                      } pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60`}
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Create Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={applicantForm.password}
                      onChange={handleApplicantChange}
                      placeholder="••••••••"
                      required
                      className={`w-full rounded-2xl bg-slate-900/60 border ${
                        errors.password ? "border-red-500" : "border-white/10"
                      } pl-12 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60`}
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

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={applicantForm.confirmPassword}
                      onChange={handleApplicantChange}
                      placeholder="••••••••"
                      required
                      className={`w-full rounded-2xl bg-slate-900/60 border ${
                        errors.confirmPassword ? "border-red-500" : "border-white/10"
                      } pl-12 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>

                <button
                  onClick={handleApplicantSubmit}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-purple-700/20 hover:shadow-purple-600/30 transition mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {isLoading ? "Creating Account..." : "Submit"}
                </button>
              </div>
            </div>
          )}

          {/* Company Sign Up Form */}
          {step === "company" && (
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 sm:p-12">
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Go Back</span>
                </button>
                <div className="flex items-center gap-2 text-cyan-300">
                  <Building2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Company</span>
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Register Your{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Company
                  </span>
                </h2>
                <p className="text-gray-300 text-sm">
                  Fill in your company details
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="companyName"
                      value={companyForm.companyName}
                      onChange={handleCompanyChange}
                      placeholder="Tech Corp Ltd."
                      required
                      className="w-full rounded-2xl bg-slate-900/60 border border-white/10 pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Industry</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="industry"
                      value={companyForm.industry}
                      onChange={handleCompanyChange}
                      required
                      className="w-full rounded-2xl bg-slate-900/60 border border-white/10 pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/60 appearance-none bg-slate-900"
                    >
                      <option value="" className="text-gray-500">Select Industry</option>
                      <option value="IT" className="text-black">IT</option>
                      <option value="Engineering" className="text-black">Engineering</option>
                      <option value="Business" className="text-black">Business</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Business Registration Number</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="registrationNumber"
                      value={companyForm.registrationNumber}
                      onChange={handleCompanyChange}
                      placeholder="PV 12345"
                      required
                      className="w-full rounded-2xl bg-slate-900/60 border border-white/10 pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Branch Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="branchLocation"
                      value={companyForm.branchLocation}
                      onChange={handleCompanyChange}
                      required
                      className="w-full rounded-2xl bg-slate-900/60 border border-white/10 pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/60 appearance-none bg-slate-900"
                    >
                      <option value="" className="text-gray-500">Select District</option>
                      {sriLankanDistricts.map((district) => (
                        <option key={district} value={district} className="text-black">
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={companyForm.email}
                      onChange={handleCompanyChange}
                      placeholder="company@example.com"
                      required
                      className={`w-full rounded-2xl bg-slate-900/60 border ${
                        errors.email ? "border-red-500" : "border-white/10"
                      } pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60`}
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="contactNumber"
                      value={companyForm.contactNumber}
                      onChange={handleCompanyChange}
                      placeholder="+94 11 234 5678"
                      required
                      className={`w-full rounded-2xl bg-slate-900/60 border ${
                        errors.contactNumber ? "border-red-500" : "border-white/10"
                      } pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60`}
                    />
                  </div>
                  {errors.contactNumber && <p className="text-red-400 text-xs mt-1">{errors.contactNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Create Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={companyForm.password}
                      onChange={handleCompanyChange}
                      placeholder="••••••••"
                      required
                      className={`w-full rounded-2xl bg-slate-900/60 border ${
                        errors.password ? "border-red-500" : "border-white/10"
                      } pl-12 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60`}
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

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={companyForm.confirmPassword}
                      onChange={handleCompanyChange}
                      placeholder="••••••••"
                      required
                      className={`w-full rounded-2xl bg-slate-900/60 border ${
                        errors.confirmPassword ? "border-red-500" : "border-white/10"
                      } pl-12 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>

                <button
                  onClick={handleCompanySubmit}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-cyan-700/20 hover:shadow-cyan-600/30 transition mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {isLoading ? "Creating Account..." : "Submit"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer - Same as About Us */}
      <footer className="bg-slate-900/50 border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="w-6 h-6 text-purple-400" />
                <span className="text-lg font-bold text-white">
                  AI Career Guide
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering careers with AI technology tailored for the Sri
                Lankan job market.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a
                    href="/resume-builder"
                    className="hover:text-purple-400 transition"
                  >
                    Resume Builder
                  </a>
                </li>
                <li>
                  <a
                    href="/interview-practice"
                    className="hover:text-purple-400 transition"
                  >
                    Interview Practice
                  </a>
                </li>
                <li>
                  <a
                    href="/career-guidance"
                    className="hover:text-purple-400 transition"
                  >
                    Career Guidance
                  </a>
                </li>
                <li>
                  <a
                    href="/InterviewDashboard"
                    className="hover:text-purple-400 transition"
                  >
                    Job Matching
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/about" className="hover:text-purple-400 transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-purple-400 transition">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-400">
            <p>
              © 2025 AI Career Guidance System. All rights reserved. Made for
              Sri Lankan Job Market.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}