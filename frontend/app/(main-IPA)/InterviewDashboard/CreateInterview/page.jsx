"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CreateInterview() {

  const router = useRouter();

  const [formData, setFormData] = useState({
  jobRole: "",
  experienceLevel: "",
  jobDescription: "",
  questionCount: 5,
  interviewTypes: []
});

  const [loading, setLoading] = useState(false);

  const interviewOptions = [
    "Technical",
    "Behavioral",
    "HR",
    "Case Study",
    "System Design"
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckbox = (type) => {
    setFormData((prev) => ({
      ...prev,
      interviewTypes: prev.interviewTypes.includes(type)
        ? prev.interviewTypes.filter((t) => t !== type)
        : [...prev.interviewTypes, type]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.interviewTypes.length === 0) {
      toast.error("Please select at least one interview type");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/interview/generate",
        formData
      );

      toast.success("Interview Generated Successfully!");

      
     router.push(`/InterviewDashboard/Results/${res.data._id}`);

    } catch (error) {
      console.log(error);
      toast.error("Generation failed");
    }

    setLoading(false);
  };

 return (
  <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-6">
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-3xl">

      <h2 className="text-3xl font-bold text-white text-center mb-8">
        Create New Interview
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Job Role */}
        <div>
          <label className="text-white font-medium">Job Position</label>
          <input
            type="text"
            name="jobRole"
            placeholder="e.g. Full Stack Developer"
            value={formData.jobRole}
            onChange={handleChange}
            className="w-full mt-2 p-3 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>

        {/* Job Description */}
        <div>
          <label className="text-white font-medium">Job Description</label>
          <textarea
            name="jobDescription"
            placeholder="Enter job details..."
            value={formData.jobDescription}
            onChange={handleChange}
            rows="4"
            className="w-full mt-2 p-3 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>
        
        <div>
  <label className="text-white font-medium">
    Experience Level
  </label>

  <select
    name="experienceLevel"
    value={formData.experienceLevel}
    onChange={handleChange}
    required
    className="w-full mt-2 p-3 bg-white/10 border border-white/20 text-white rounded-lg"
  >

    <option value="">Select Level</option>
    <option value="Intern">Intern</option>
    <option value="Junior">Junior</option>
    <option value="Mid-Level">Mid-Level</option>
    <option value="Senior">Senior</option>

        </select>
       </div>

        {/* Question Count */}
        <div>
          <label className="text-white font-medium">Number of Questions</label>
          <input
            type="number"
            name="questionCount"
            min="1"
            max="20"
            value={formData.questionCount}
            onChange={handleChange}
            className="w-full mt-2 p-3 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>

        {/* Interview Types */}
        <div>
          <p className="text-white font-medium mb-3">
            Interview Types
          </p>

          <div className="flex flex-wrap gap-3">
            {interviewOptions.map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => handleCheckbox(type)}
                className={`px-4 py-2 rounded-full border transition-all duration-200
                  ${formData.interviewTypes.includes(type)
                    ? "bg-purple-500 text-white border-purple-400 shadow-lg"
                    : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300"
        >
          {loading ? "Generating..." : "Generate Interview"}
        </button>

      </form>
    </div>
  </div>
);
}