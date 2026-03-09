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

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const interviewOptions = [
    "Structured",
    "Unstructured",
    "Panel",
    "One-on-One",
    "Competency-Based",
    "Phone/Video Screening",
    "Group Interview"
  ];

  // ── Validation rules ──────────────────────────────────────────────────────
  const validate = (data) => {
    const errs = {};

    if (!data.jobRole.trim()) {
      errs.jobRole = "Job position is required.";
    } else if (data.jobRole.trim().length < 3) {
      errs.jobRole = "Job position must be at least 3 characters.";
    } else if (data.jobRole.trim().length > 100) {
      errs.jobRole = "Job position must be under 100 characters.";
    }

    // jobDescription is optional — only validate length if something is typed
    if (data.jobDescription.trim().length > 0 && data.jobDescription.trim().length < 10) {
      errs.jobDescription = "Description must be at least 5 characters if provided.";
    } else if (data.jobDescription.trim().length > 2000) {
      errs.jobDescription = "Description must be under 2000 characters.";
    }

    if (!data.experienceLevel) {
      errs.experienceLevel = "Please select an experience level.";
    }

    const qc = Number(data.questionCount);
    if (!data.questionCount && data.questionCount !== 0) {
      errs.questionCount = "Question count is required.";
    } else if (!Number.isInteger(qc) || qc < 1) {
      errs.questionCount = "Minimum 1 question required.";
    }

    if (data.interviewTypes.length === 0) {
      errs.interviewTypes = "Please select at least one interview type.";
    }

    return errs;
  };

  // ── Validate single field on blur ─────────────────────────────────────────
  const validateField = (name, value) => {
    const errs = validate({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: errs[name] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) validateField(name, value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleCheckbox = (type) => {
    const updated = formData.interviewTypes.includes(type)
      ? formData.interviewTypes.filter((t) => t !== type)
      : [...formData.interviewTypes, type];

    setFormData((prev) => ({ ...prev, interviewTypes: updated }));
    setTouched((prev) => ({ ...prev, interviewTypes: true }));
    const errs = validate({ ...formData, interviewTypes: updated });
    setErrors((prev) => ({ ...prev, interviewTypes: errs.interviewTypes }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      jobRole: true,
      jobDescription: true,
      experienceLevel: true,
      questionCount: true,
      interviewTypes: true
    });

    const errs = validate(formData);
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      toast.error("Please fix the errors before submitting.");
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
      toast.error("Generation failed. Please try again.");
    }
    setLoading(false);
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const inputClass = (field) =>
    `w-full mt-2 p-3 bg-white/10 border text-white rounded-lg focus:outline-none focus:ring-2 transition ${
      errors[field] && touched[field]
        ? "border-red-400 focus:ring-red-400"
        : "border-white/20 focus:ring-purple-400"
    }`;

  const ErrorMsg = ({ field }) =>
    errors[field] && touched[field] ? (
      <p className="mt-1 text-red-400 text-xs flex items-center gap-1">
        ⚠ {errors[field]}
      </p>
    ) : null;

  const charCount = (value, max) => {
    const len = value.trim().length;
    const near = len > max * 0.85;
    return (
      <span className={`text-xs ${near ? "text-yellow-400" : "text-white/30"}`}>
        {len}/{max}
      </span>
    );
  };

  // Progress: 4 required fields (jobDescription excluded)
  const filledCount = [
    formData.jobRole.trim(),
    formData.experienceLevel,
    formData.questionCount,
    formData.interviewTypes.length > 0
  ].filter(Boolean).length;

  const isComplete =
    formData.jobRole.trim() &&
    formData.experienceLevel &&
    formData.questionCount &&
    formData.interviewTypes.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-3xl">

        <h2 className="text-3xl font-bold text-white text-center mb-2">
          Create New Interview
        </h2>
        <p className="text-center text-white/50 text-sm mb-8">
          Fields marked <span className="text-red-400">*</span> are required
        </p>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-white/40 mb-1">
            <span>Form completion</span>
            <span>{filledCount} / 4</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full transition-all duration-500"
              style={{ width: `${(filledCount / 4) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

          {/* Job Role */}
          <div>
            <div className="flex justify-between items-center">
              <label className="text-white font-medium">
                Job Position <span className="text-red-400">*</span>
              </label>
              {charCount(formData.jobRole, 100)}
            </div>
            <input
              type="text"
              name="jobRole"
              placeholder="e.g. Full Stack Developer"
              value={formData.jobRole}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("jobRole")}
              maxLength={100}
            />
            <ErrorMsg field="jobRole" />
          </div>

          {/* Job Description — OPTIONAL */}
          <div>
            <div className="flex justify-between items-center">
              <label className="text-white font-medium">
                Job Description
                <span className="text-white/40 text-xs font-normal ml-2">(optional)</span>
              </label>
              {charCount(formData.jobDescription, 2000)}
            </div>
            <textarea
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="4"
              maxLength={2000}
              className={inputClass("jobDescription")}
            />
            <ErrorMsg field="jobDescription" />
          </div>

          {/* Experience Level */}
          <div>
            <label className="text-white font-medium">
              Experience Level <span className="text-red-400">*</span>
            </label>
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full mt-2 p-3 border text-white rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.experienceLevel && touched.experienceLevel
                  ? "border-red-400 focus:ring-red-400"
                  : "border-white/20 focus:ring-purple-400"
              }`}
              style={{ backgroundColor: "#6b21a8" }}
            >
              <option value="" style={{ backgroundColor: "#6b21a8", color: "white" }}>Select Level</option>
              <option value="Intern" style={{ backgroundColor: "#6b21a8", color: "white" }}>Intern</option>
              <option value="Junior" style={{ backgroundColor: "#6b21a8", color: "white" }}>Junior</option>
              <option value="Mid-Level" style={{ backgroundColor: "#6b21a8", color: "white" }}>Mid-Level</option>
              <option value="Senior" style={{ backgroundColor: "#6b21a8", color: "white" }}>Senior</option>
            </select>
            <ErrorMsg field="experienceLevel" />
          </div>

          {/* Question Count */}
          <div>
            <label className="text-white font-medium">
              Number of Questions <span className="text-red-400">*</span>
              <span className="text-white/40 text-xs font-normal ml-2">(1 – 20)</span>
            </label>
            <input
              type="number"
              name="questionCount"
              min="1"
              max="20"
              value={formData.questionCount}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("questionCount")}
            />
            <ErrorMsg field="questionCount" />
          </div>

          {/* Interview Types */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-white font-medium">
                Interview Types <span className="text-red-400">*</span>
              </p>
              {formData.interviewTypes.length > 0 && (
                <span className="text-xs text-purple-300">
                  {formData.interviewTypes.length} selected
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {interviewOptions.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => handleCheckbox(type)}
                  className={`px-4 py-2 rounded-full border transition-all duration-200 text-sm ${
                    formData.interviewTypes.includes(type)
                      ? "bg-purple-500 text-white border-purple-400 shadow-lg scale-105"
                      : errors.interviewTypes && touched.interviewTypes
                      ? "bg-white/10 text-white border-red-400/50 hover:bg-white/20"
                      : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  }`}
                >
                  {formData.interviewTypes.includes(type) && (
                    <span className="mr-1">✓</span>
                  )}
                  {type}
                </button>
              ))}
            </div>
            <ErrorMsg field="interviewTypes" />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-6 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 ${
              isComplete && !loading
                ? "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 hover:scale-[1.02]"
                : "bg-white/20 cursor-not-allowed opacity-60"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Generating Interview...
              </span>
            ) : (
              "Generate Interview →"
            )}
          </button>

        </form>
      </div>
    </div>
  );
}