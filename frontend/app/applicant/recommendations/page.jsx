'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link'; 
import { 
  BookOpen, ArrowLeft, GraduationCap, ArrowRight
} from 'lucide-react';

// Wrapper component to handle Suspense (Required for useSearchParams)
export default function RecommendationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading...</div>}>
      <RecommendationsContent />
    </Suspense>
  );
}

function RecommendationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get skills from URL (e.g., ?skills=react,python)
  const skillsString = searchParams.get('skills');
  
  // FIX: Added .filter(Boolean) to ensure no empty boxes appear if there's a trailing comma
  const skills = skillsString ? skillsString.split(',').filter(Boolean) : [];

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
        <div className="mb-10 text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Upskill to <span className="text-purple-400">Get Hired</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            We identified the following gaps in your profile. Complete these guided learning paths to master the required skills.
          </p>
        </div>

        {/* Skills Grid */}
        {skills.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-white/5">
            <p className="text-gray-400">No missing skills found in the request.</p>
            <button onClick={() => router.push('/applicant/jobs')} className="mt-4 text-purple-400 hover:underline">
              Go back to jobs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill) => {
              // FIX: Creates a clean URL slug (e.g., "Machine Learning" becomes "machine-learning")
              const skillSlug = skill.toLowerCase().trim().replace(/\s+/g, '-');

              return (
                // FIX: Used key={skill} instead of index for better React rendering performance
                <div 
                  key={skill} 
                  className="bg-slate-800/40 backdrop-blur-md border border-white/10 hover:border-purple-500/50 rounded-3xl p-6 md:p-8 shadow-xl transition-all hover:-translate-y-1 hover:shadow-purple-500/20 flex flex-col h-full"
                >
                  {/* Skill Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white capitalize">{skill}</h3>
                      <span className="text-xs font-medium px-2 py-1 bg-slate-700/50 text-purple-300 rounded-md mt-1 inline-block">
                        Required Skill
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-8 flex-grow">
                    Step-by-step guided learning path to master {skill}. Includes curated resources from YouTube, Udemy, and Coursera with progress tracking.
                  </p>

                  {/* Link to the new dynamic Roadmap page */}
                  <Link 
                    href={`/applicant/courses/${skillSlug}`}
                    className="group flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-purple-500/30"
                  >
                    Start Learning Path
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}