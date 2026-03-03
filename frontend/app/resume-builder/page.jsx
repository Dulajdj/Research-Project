'use client';

import React, { useState } from 'react';
import { ArrowLeft, FileText, PenTool, CheckCircle, Brain, Sparkles, Download, Save, Eye } from 'lucide-react';
import Link from 'next/link';

export default function ResumeBuilderMain() {
  const [activeTab, setActiveTab] = useState('resume');

  const features = [
    {
      id: 'resume',
      title: 'Resume Builder',
      description: 'Create professional CVs with AI assistance',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      features: ['Smart templates', 'AI suggestions', 'PDF export', 'ATS optimization']
    },
    {
      id: 'cover-letter',
      title: 'Cover Letter Generator',
      description: 'Generate personalized cover letters',
      icon: PenTool,
      color: 'from-purple-500 to-pink-500',
      features: ['Job-specific content', 'AI writing', 'Multiple formats', 'Customization']
    },
    {
      id: 'checker',
      title: 'Resume Checker',
      description: 'Analyze and improve your resume',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      features: ['ATS scoring', 'Grammar check', 'Keyword optimization', 'Improvement tips']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Top bar */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-slate-900/60 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-purple-300 hover:text-purple-200 transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm">Back to Home</span>
          </Link>
          <div className="text-xs text-gray-400">AI-Powered Career Tools</div>
        </div>
      </div>

      <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 rounded-full px-4 py-1.5 mb-4">
              <Brain className="w-4 h-4 text-yellow-300" />
              <span className="text-sm text-purple-200">AI-Powered Career Tools</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Resume & Career <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Personalization</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
              Build professional resumes, generate cover letters, and optimize your career documents with AI assistance.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer"
                onClick={() => setActiveTab(feature.id)}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 mb-6">
                  {feature.description}
                </p>

                <div className="space-y-2 mb-6">
                  {feature.features.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className={`w-1.5 h-1.5 bg-gradient-to-r ${feature.color} rounded-full`}></div>
                      <span className="text-sm text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center text-purple-400 font-semibold group-hover:translate-x-2 transition-transform">
                  Get Started
                  <ArrowLeft className="w-5 h-5 ml-1 rotate-180" />
                </div>
              </div>
            ))}
          </div>

          {/* Active Tab Content */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            {activeTab === 'resume' && (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Resume Builder</h2>
                <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                  Create professional resumes with our AI-powered builder. Choose from templates, 
                  get smart suggestions, and export to PDF.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
  href="/resume-builder/create"
  onClick={() => {
    localStorage.removeItem("resumeFormData");
    localStorage.removeItem("selectedTemplate");
  }}
  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/50 transition transform hover:scale-105"
>
  <Sparkles className="w-5 h-5 inline mr-2" />
  Create New Resume
</Link>

                  <Link 
          href="/resume-builder/saved"
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105 flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          My Saved Resumes
        </Link>
                </div>
              </div>
            )}

            {activeTab === 'cover-letter' && (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <PenTool className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Cover Letter Generator</h2>
                <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                  Generate personalized cover letters tailored to specific job applications. 
                  Our AI creates compelling content that matches your resume and the job requirements.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/resume-builder/cover-letter/create"
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/50 transition transform hover:scale-105"
                  >
                    <Sparkles className="w-5 h-5 inline mr-2" />
                    Generate Cover Letter
                  </Link>
                  <Link 
                    href="/resume-builder/cover-letter/saved"
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105 flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Saved Cover letters
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'checker' && (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Resume Checker</h2>
                <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                  Analyze your resume for ATS compatibility, grammar issues, and optimization opportunities. 
                  Get detailed feedback and improvement suggestions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/resume-builder/checker"
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-green-500/50 transition transform hover:scale-105"
                  >
                    <CheckCircle className="w-5 h-5 inline mr-2" />
                    Check My Resume
                  </Link>
                 
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">1000+</div>
              <div className="text-sm text-gray-400">Resumes Created</div>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">95%</div>
              <div className="text-sm text-gray-400">ATS Score</div>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">50+</div>
              <div className="text-sm text-gray-400">Templates</div>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-sm text-gray-400">AI Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
