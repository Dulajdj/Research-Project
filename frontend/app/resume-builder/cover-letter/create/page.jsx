"use client";

import { useState } from "react";
import { Loader2, Sparkles, User, Building, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { generateCoverLetter } from "../../../../actions/cover-letter";

export default function CoverLetterCreatePage() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
    },
    jobInfo: {
      companyName: "",
      jobTitle: "",
      hiringManager: "",
      jobDescription: "",
    },
  });

  // Input handlers
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [name]: value }
    }));
  };

  const handleJobChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      jobInfo: { ...prev.jobInfo, [name]: value }
    }));
  };

  const handleGenerate = async () => {
    if (!formData.personalInfo.fullName.trim()) return alert("Full Name required!");
    if (!formData.jobInfo.companyName.trim()) return alert("Company Name required!");
    if (!formData.jobInfo.jobTitle.trim()) return alert("Job Title required!");
    if (formData.jobInfo.jobDescription.trim().length < 20)
      return alert("Job Description too short!");

    setGenerating(true);

    try {
      const data = await generateCoverLetter(formData);
      if (data && data.id) {
        router.push(`/resume-builder/cover-letter/edit/${data.id}`);
      }
    } catch (err) {
      console.error("Generation failed:", err);
      alert("Generation failed. " + (err.message || ""));
    } finally {
      setGenerating(false);
    }
  };

  // Styles for Dark Theme Inputs
  const inputClass = "w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all";
  const labelClass = "block text-sm font-medium text-purple-200 mb-2 ml-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8 flex items-center justify-center">
      
      <div className="max-w-4xl w-full">
        
        {/* Title Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Generate Your Cover Letter
          </h1>
          <p className="text-gray-300 text-lg">
            Fill in the details below and let AI write the perfect letter for you.
          </p>
        </div>

        {/* Glassmorphism Form Container */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
          
          {/* Section 1: Personal Details */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
              <User className="text-purple-400" /> Your Details
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.personalInfo.fullName}
                  onChange={handlePersonalChange}
                  placeholder="e.g. John Doe"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.personalInfo.email}
                  onChange={handlePersonalChange}
                  placeholder="john@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.personalInfo.phone}
                  onChange={handlePersonalChange}
                  placeholder="+94 7X XXX XXXX"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Address (Optional)</label>
                <input
                  type="text"
                  name="address"
                  value={formData.personalInfo.address}
                  onChange={handlePersonalChange}
                  placeholder="City, Country"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Job Details */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
              <Building className="text-pink-400" /> Target Job
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={labelClass}>Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.jobInfo.companyName}
                  onChange={handleJobChange}
                  placeholder="e.g. Google"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobInfo.jobTitle}
                  onChange={handleJobChange}
                  placeholder="e.g. Software Engineer"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mb-6">
               <label className={labelClass}>Hiring Manager (Optional)</label>
               <input
                  type="text"
                  name="hiringManager"
                  value={formData.jobInfo.hiringManager}
                  onChange={handleJobChange}
                  placeholder="e.g. Mr. Smith"
                  className={inputClass}
                />
            </div>

            <div>
              <label className={labelClass}>Job Description (Paste here)</label>
              <textarea
                name="jobDescription"
                value={formData.jobInfo.jobDescription}
                onChange={handleJobChange}
                placeholder="Paste the job listing requirements here..."
                rows={6}
                className={`${inputClass} resize-none font-mono text-sm`}
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Generating Magic...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 mr-2" />
                  Generate Cover Letter
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}