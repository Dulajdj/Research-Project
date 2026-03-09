'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  BookOpen, ExternalLink, ArrowLeft, PlayCircle, GraduationCap, MonitorPlay, Sparkles
} from 'lucide-react';

// Wrapper component to handle Suspense (Required for useSearchParams in Next.js)
export default function RecommendationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading AI Recommendations...</div>}>
      <RecommendationsContent />
    </Suspense>
  );
}

function RecommendationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get skills and experience from URL query parameters
  const skillsString = searchParams.get('skills');
  const skills = skillsString ? skillsString.split(',') : [];
  const yearsExp = searchParams.get('exp') || '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans">
      
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()} 
              className="p-2 rounded-full hover:bg-white/10 transition text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-purple-400" />
              Learning Path Recommendation
            </h1>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10">
        
        {/* Intro Banner */}
        <div className="mb-10 text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Upskill to <span className="text-purple-400">Get Hired</span>
          </h2>

          {/* AI Insight Badge */}
          <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/40 px-5 py-2 rounded-full shadow-lg shadow-purple-500/10">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-200">
              AI Insight: {yearsExp} Years of Detected Experience
            </span>
          </div>

          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            We found {skills.length} key skill gaps. These curated resources will help you bridge the gap and improve your hiring potential.
          </p>
        </div>

        {/* Skills Grid */}
        {skills.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-white/5">
            <p className="text-gray-400 font-medium text-lg">Your profile is a perfect match!</p>
            <button onClick={() => router.push('/applicant/jobs')} className="mt-4 text-purple-400 hover:underline transition">
              Explore more jobs
            </button>
          </div>
        ) : (
          <div className="grid gap-10">
            {skills.map((skill, index) => (
              <div 
                key={index} 
                className="bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl transition hover:border-white/20"
              >
                {/* Skill Header */}
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white capitalize">{skill}</h3>
                    <p className="text-sm text-gray-400">Master {skill} with these top-rated resources</p>
                  </div>
                </div>

                {/* Course Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Udemy */}
                  <a 
                    href={`https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="group bg-slate-900/50 border border-white/5 hover:border-purple-500/50 rounded-2xl p-5 transition-all hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-purple-600/20 p-2 rounded-lg text-purple-400">
                        <MonitorPlay className="w-5 h-5" />
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition" />
                    </div>
                    <h4 className="font-semibold text-white mb-1 group-hover:text-purple-300 transition">Udemy Track</h4>
                    <p className="text-xs text-gray-400">Certification-focused professional courses.</p>
                  </a>

                  {/* Coursera */}
                  <a 
                    href={`https://www.coursera.org/search?query=${encodeURIComponent(skill)}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="group bg-slate-900/50 border border-white/5 hover:border-blue-500/50 rounded-2xl p-5 transition-all hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-blue-600/20 p-2 rounded-lg text-blue-400">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition" />
                    </div>
                    <h4 className="font-semibold text-white mb-1 group-hover:text-blue-300 transition">Coursera Specialization</h4>
                    <p className="text-xs text-gray-400">University-grade curriculum and skills.</p>
                  </a>

                  {/* YouTube */}
                  <a 
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(skill)}+tutorial+full+course`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="group bg-slate-900/50 border border-white/5 hover:border-red-500/50 rounded-2xl p-5 transition-all hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-red-600/20 p-2 rounded-lg text-red-400">
                        <PlayCircle className="w-5 h-5" />
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-red-400 transition" />
                    </div>
                    <h4 className="font-semibold text-white mb-1 group-hover:text-red-300 transition">Free Tutorials</h4>
                    <p className="text-xs text-gray-400">Community-led video guides and crash courses.</p>
                  </a>

                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}