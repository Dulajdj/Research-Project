'use client';

import React, { useState, useRef } from 'react';
import CompanySidebar from '../../components/ui/CompanySidebar';
import { Loader2, UploadCloud, FileText, X } from 'lucide-react';

// --- NEW: Sri Lankan Districts / Cities Array ---
const SRI_LANKAN_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Dambulla", 
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", 
  "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala", 
  "Mullaitivu", "Negombo", "Nuwara Eliya", "Polonnaruwa", "Puttalam", 
  "Ratnapura", "Trincomalee", "Vavuniya"
];

export default function AddNewJobPost() {
  // Using a single state object for cleaner form management
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    companyWebsite: '',
    jobDescription: '',
    requiredQualifications: '',
    requiredSkills: '',
    experienceLevel: '',
    employmentType: '',
    workLocation: '', // Updated to store the District
    salaryRange: '',
    workingHours: '',
    closingDate: '',
  });

  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Handle Text Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle File Inputs
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const dataToSend = new FormData();
    // Append all text fields
    Object.entries(formData).forEach(([key, value]) => {
      dataToSend.append(key, value);
    });
    // Append file if exists
    if (file) dataToSend.append('file', file);

    try {
      const res = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        body: dataToSend,
      });

      if (res.ok) {
        alert('Job Posted Successfully!');
        // Reset Form
        setFormData({
          jobTitle: '',
          companyName: '',
          companyWebsite: '',
          jobDescription: '',
          requiredQualifications: '',
          requiredSkills: '',
          experienceLevel: '',
          employmentType: '',
          workLocation: '',
          salaryRange: '',
          workingHours: '',
          closingDate: '',
        });
        setFile(null);
      } else {
        const err = await res.json();
        alert(`Failed: ${err.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while connecting to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex">
      <CompanySidebar />

      <main className="flex-1 p-6 md:p-10 flex justify-center items-start">
        <form
          onSubmit={handleSubmit}
          className="bg-slate-800/60 backdrop-blur-lg border border-white/10 p-8 md:p-10 rounded-3xl w-full max-w-4xl shadow-2xl space-y-8"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Create New Job Post
            </h1>
            <p className="text-gray-400 mt-2">Fill in the details to find the best candidates.</p>
          </div>

          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Job Title *</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                required
                className="w-full p-3 rounded-xl bg-slate-900/50 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
                className="w-full p-3 rounded-xl bg-slate-900/50 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                placeholder="e.g. Tech Solutions Inc."
              />
            </div>
          </div>

          {/* Section 2: Job Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Experience Level *</label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleInputChange}
                required
                className="w-full p-3 rounded-xl bg-slate-900/50 border border-white/10 focus:border-purple-500 outline-none text-gray-300"
              >
                <option value="">Select Level</option>
                <option value="Internship">Internship</option>
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Employment Type *</label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleInputChange}
                required
                className="w-full p-3 rounded-xl bg-slate-900/50 border border-white/10 focus:border-purple-500 outline-none text-gray-300"
              >
                <option value="">Select Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            {/* --- UPDATED: Work Location now uses Districts --- */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Work Location (District) *</label>
              <select
                name="workLocation"
                value={formData.workLocation}
                onChange={handleInputChange}
                required
                className="w-full p-3 rounded-xl bg-slate-900/50 border border-white/10 focus:border-purple-500 outline-none text-gray-300"
              >
                <option value="">Select District</option>
                <option value="Remote">Remote (Anywhere)</option>
                {/* Dynamically rendering the districts array */}
                {SRI_LANKAN_DISTRICTS.sort().map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Compensation & Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Salary Range</label>
              <input
                type="text"
                name="salaryRange"
                value={formData.salaryRange}
                onChange={handleInputChange}
                className="w-full p-3 rounded-xl bg-slate-900/50 border border-white/10 focus:border-purple-500 outline-none transition"
                placeholder="e.g. $60,000 - $80,000 / year"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Working Hours / Schedule</label>
              <input
                type="text"
                name="workingHours"
                value={formData.workingHours}
                onChange={handleInputChange}
                className="w-full p-3 rounded-xl bg-slate-900/50 border border-white/10 focus:border-purple-500 outline-none transition"
                placeholder="e.g. Mon-Fri, 9AM - 5PM"
              />
            </div>
          </div>

          {/* Section 4: Descriptions */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Job Description *</label>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full p-3 rounded-xl bg-slate-900/50 border border-white/10 focus:border-purple-500 outline-none transition"
                placeholder="Describe the role responsibilities..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Required Skills *</label>
                <textarea
                  name="requiredSkills"
                  value={formData.requiredSkills}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-900/50 border border-white/10 focus:border-purple-500 outline-none transition"
                  placeholder="e.g. React, Node.js, AWS (Comma separated)"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Qualifications *</label>
                <textarea
                  name="requiredQualifications"
                  value={formData.requiredQualifications}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-900/50 border border-white/10 focus:border-purple-500 outline-none transition"
                  placeholder="e.g. Bachelor's in CS, 3+ years experience"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Dates & File */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Closing Date</label>
              <input
                type="date"
                name="closingDate"
                value={formData.closingDate}
                onChange={handleInputChange}
                className="w-full p-3 rounded-xl bg-slate-900/50 border border-white/10 focus:border-purple-500 outline-none transition text-gray-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Upload Job Description (PDF/Image)</label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current.click()}
                className={`relative w-full p-6 rounded-xl border-2 border-dashed ${
                  dragOver ? 'border-purple-400 bg-purple-500/10' : 'border-white/20 bg-slate-900/30'
                } cursor-pointer text-center transition hover:border-purple-400 hover:bg-slate-800`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {file ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="w-8 h-8 text-purple-400" />
                    <p className="text-sm text-gray-300 font-medium truncate max-w-[200px]">{file.name}</p>
                    <button 
                      type="button" 
                      onClick={removeFile}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded-full mt-1"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                    <UploadCloud className="w-8 h-8" />
                    <p className="text-sm">Drag & drop or <span className="text-purple-400">browse</span></p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" /> Posting Job...
                </>
              ) : (
                "Submit Job Post"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}