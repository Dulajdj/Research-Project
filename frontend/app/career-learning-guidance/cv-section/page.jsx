"use client";

import React, { useState } from "react";
import { Upload, Brain, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function SkillAnalysisPage() {
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [skillsFound, setSkillsFound] = useState([]);
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [courseRecommendations, setCourseRecommendations] = useState([]);
  const [learningGuide, setLearningGuide] = useState("");

  const handleResumeUpload = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const analyzeSkills = async () => {
    if (!resumeFile) {
      alert("Please upload a resume file first.");
      return;
    }

    setLoading(true);

    // Placeholder: Replace with backend API
    setTimeout(() => {
      setSkillsFound(["python", "javascript", "sql"]);
      setRequiredSkills(["python", "sql", "machine learning", "power bi"]);
      setMissingSkills(["machine learning", "power bi"]);
      setCourseRecommendations([
        { skill: "machine learning", course: "Machine Learning Bootcamp (Udemy)" },
        { skill: "power bi", course: "Microsoft Power BI Beginner Course" }
      ]);
      setLearningGuide(
        "Start by reviewing Python basics, then move into Machine Learning fundamentals. After that, complete the Power BI course to strengthen your data visualization skills."
      );
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-6 py-10 text-white">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="flex justify-center mb-4">
          <Brain className="w-12 h-12 text-purple-400" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Skill Gap Analyzer
        </h1>
        <p className="text-gray-300 mt-3 text-lg">
          Upload your CV and let AI analyze your skills instantly.
        </p>
      </div>

      {/* Upload Box */}
      <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-purple-500/40 border-dashed rounded-2xl cursor-pointer hover:bg-white/10 transition">
          <Upload className="w-10 h-10 text-purple-400 mb-2" />
          <span className="text-gray-300">Click to upload your CV (PDF/Text)</span>
          <input type="file" accept="application/pdf,text/plain" className="hidden" onChange={handleResumeUpload} />
        </label>

        {resumeFile && (
          <p className="mt-3 text-center text-green-400 font-semibold">
            Uploaded: {resumeFile.name}
          </p>
        )}

        <button
          onClick={analyzeSkills}
          className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-xl font-semibold hover:scale-105 transition flex items-center justify-center"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Find Missing Skills"}
        </button>
      </div>

      {/* Results */}
      {!loading && skillsFound.length > 0 && (
        <div className="max-w-4xl mx-auto mt-12 space-y-10">
          {/* Skills Found */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" /> Skills in CV
            </h2>
            <div className="flex flex-wrap gap-2">
              {skillsFound.map((skill, i) => (
                <span key={i} className="px-4 py-1 bg-purple-600/40 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Required Skills */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-purple-300 mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {requiredSkills.map((skill, i) => (
                <span key={i} className="px-4 py-1 bg-cyan-600/40 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-yellow-400" /> Missing Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill, i) => (
                <span key={i} className="px-4 py-1 bg-red-600/40 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Course Recommendations */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-purple-300 mb-4">Recommended Courses</h2>
            <ul className="space-y-2">
              {courseRecommendations.map((item, i) => (
                <li key={i} className="text-gray-300">
                  <span className="font-semibold text-purple-300">{item.skill}:</span> {item.course}
                </li>
              ))}
            </ul>
          </div>

          {/* Learning Guide */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-purple-300 mb-4">Learning Guide</h2>
            <p className="text-gray-300 leading-relaxed">{learningGuide}</p>
          </div>
        </div>
      )}
    </div>
  );
}