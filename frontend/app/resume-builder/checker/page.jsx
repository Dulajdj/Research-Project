'use client';

import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, AlertTriangle, TrendingUp, Target, FileText, Upload, Sparkles, Loader2, Download, Eye } from 'lucide-react';
import Link from 'next/link';

// backend base URL; override with NEXT_PUBLIC_API_URL when available
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ResumeChecker() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  
  // Data States
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // Results State
  const [analysisResults, setAnalysisResults] = useState({
    atsScore: 0,
    grammarScore: 0,
    keywordMatch: 0,
    suggestions: [],
    strengths: [],
    improvements: []
  });

const analyzeResume = async () => {
  if (isAnalyzing) return;

  // require either uploaded file or some manual text
  if (!uploadedFile && resumeText.trim().length === 0) {
    alert("Please upload a resume file or paste your resume text before analyzing.");
    return;
  }

  setIsAnalyzing(true);

  try {
    const formData = new FormData();
    if (uploadedFile) formData.append("file", uploadedFile);
    if (resumeText.trim()) formData.append("resumeText", resumeText);
    if (jobDescription.trim()) formData.append("jobDescription", jobDescription);

    const response = await fetch(`${API_BASE}/api/check-resume`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("API ERROR:", text);
      throw new Error("Resume analysis failed");
    }

    const data = await response.json();
    setAnalysisResults(data);
    setActiveTab('results');

  } catch (error) {
    console.error(error);
    alert(error.message);
  } finally {
    setIsAnalyzing(false);
  }
};

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      // For Preview purpose only (PDFs won't show full text here, but will work in backend)
      if (file.type === "text/plain") {
          const reader = new FileReader();
          reader.onload = (e) => setResumeText(e.target.result);
          reader.readAsText(file);
      } else {
          setResumeText(`File Attached: ${file.name} (Ready for Analysis)`);
      }
    }
  };

  // Helper functions for UI colors
  const scoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const scoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Top bar */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-slate-900/60 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/resume-builder" className="inline-flex items-center text-purple-300 hover:text-purple-200 transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm">Back to Resume Builder</span>
          </Link>
          <div className="text-xs text-gray-400">AI-Powered Resume Analysis</div>
        </div>
      </div>

      <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Resume <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Checker</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              Analyze and optimize your resume for ATS compatibility and job applications
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-1">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-6 py-3 rounded-xl transition ${
                  activeTab === 'upload' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Upload Resume
              </button>
              <button
                onClick={() => setActiveTab('results')}
                disabled={analysisResults.atsScore === 0}
                className={`px-6 py-3 rounded-xl transition ${
                  activeTab === 'results' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                Analysis Results
              </button>
              <button
                onClick={() => setActiveTab('guide')}
                className={`px-6 py-3 rounded-xl transition ${
                  activeTab === 'guide' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                ATS Guide
              </button>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'upload' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Your Resume
                  </h3>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center relative hover:border-purple-500/50 transition-colors">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-300 mb-4">{uploadedFile ? uploadedFile.name : "Upload your resume file"}</p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="resume-upload"
                      />
                      <label
                        htmlFor="resume-upload"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-2xl hover:shadow-lg transition cursor-pointer inline-block pointer-events-none"
                      >
                        {uploadedFile ? "Change File" : "Choose File"}
                      </label>
                      <p className="text-xs text-gray-400 mt-2">Supports PDF, DOCX, TXT</p>
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      <p>Or paste your resume text below:</p>
                    </div>
                    
                    <textarea
                      value={resumeText}
                      onChange={(e) => {
                          setResumeText(e.target.value);
                          setUploadedFile(null); // Clear file if typing manually
                      }}
                      className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 h-40 resize-none"
                      placeholder="Paste your resume text here..."
                    />
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Job Description (Optional)
                  </h3>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 h-32 resize-none"
                    placeholder="Paste the job description here for better accuracy..."
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Adding a job description helps us provide more targeted suggestions and keyword optimization.
                  </p>
                </div>
              </div>

              {/* Analysis Features */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 h-fit">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Analysis Features
                </h3>
                <div className="space-y-4">
                  <button
                    onClick={analyzeResume}
                    disabled={isAnalyzing || (!resumeText && !uploadedFile)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-2xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 inline mr-2" />
                        Analyze Resume
                      </>
                    )}
                  </button>
                  
                  <div className="space-y-3">
                    <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        ATS Compatibility
                      </h4>
                      <p className="text-sm text-gray-300">Check how well your resume passes through Applicant Tracking Systems</p>
                    </div>
                    
                    <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        Keyword Optimization
                      </h4>
                      <p className="text-sm text-gray-300">Analyze keyword usage and suggest improvements</p>
                    </div>
                    
                    <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4 text-purple-400" />
                            Match Score
                        </h4>
                        <p className="text-sm text-gray-300">Get a score based on real Gemini AI analysis</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Score Overview */}
              <div className="grid md:grid-cols-4 gap-6">
                <div className={`${scoreBgColor(analysisResults.atsScore)} border rounded-2xl p-6 text-center`}>
                  <div className={`text-3xl font-bold ${scoreColor(analysisResults.atsScore)} mb-2`}>
                    {analysisResults.atsScore}%
                  </div>
                  <div className="text-sm text-gray-300">ATS Score</div>
                </div>
                <div className={`${scoreBgColor(analysisResults.grammarScore)} border rounded-2xl p-6 text-center`}>
                  <div className={`text-3xl font-bold ${scoreColor(analysisResults.grammarScore)} mb-2`}>
                    {analysisResults.grammarScore}%
                  </div>
                  <div className="text-sm text-gray-300">Grammar Score</div>
                </div>
                <div className={`${scoreBgColor(analysisResults.keywordMatch)} border rounded-2xl p-6 text-center`}>
                  <div className={`text-3xl font-bold ${scoreColor(analysisResults.keywordMatch)} mb-2`}>
                    {analysisResults.keywordMatch}%
                  </div>
                  <div className="text-sm text-gray-300">Keyword Match</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {analysisResults.atsScore >= 90 ? 'A+' : analysisResults.atsScore >= 80 ? 'A' : analysisResults.atsScore >= 70 ? 'B' : 'C'}
                  </div>
                  <div className="text-sm text-gray-300">Overall Grade</div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Strengths */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Strengths
                  </h3>
                  <div className="space-y-3">
                    {analysisResults.strengths.length > 0 ? (
                        analysisResults.strengths.map((strength, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{strength}</span>
                        </div>
                        ))
                    ) : (
                        <p className="text-gray-500 italic">No specific strengths detected.</p>
                    )}
                  </div>
                </div>

                {/* Improvements */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    Improvements
                  </h3>
                  <div className="space-y-3">
                     {analysisResults.improvements.length > 0 ? (
                        analysisResults.improvements.map((improvement, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <TrendingUp className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{improvement}</span>
                        </div>
                        ))
                     ) : (
                        <p className="text-gray-500 italic">No specific improvements needed.</p>
                     )}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  AI Suggestions
                </h3>
                <div className="space-y-3">
                  {analysisResults.suggestions.length > 0 ? (
                    analysisResults.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-3">
                        <Sparkles className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{suggestion}</span>
                        </div>
                    ))
                  ) : (
                     <p className="text-gray-500 italic">No suggestions available.</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <button 
                    onClick={() => setActiveTab('upload')}
                    className="bg-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-2xl border border-white/20 hover:bg-white/20 transition text-center"
                 >
                    Check Another Resume
                 </button>
                <Link 
                  href="/resume-builder/create"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl hover:shadow-lg transition text-center"
                >
                  <Eye className="w-5 h-5 inline mr-2" />
                  Create New Resume 
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">ATS Optimization Guide</h2>
                <p className="text-gray-300">Learn how to optimize your resume for Applicant Tracking Systems</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">✅ Do's</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">Use standard section headings</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">Include relevant keywords</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">Use simple, clean formatting</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">❌ Don'ts</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">Use images or graphics</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">Include headers/footers</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">Use unusual fonts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}