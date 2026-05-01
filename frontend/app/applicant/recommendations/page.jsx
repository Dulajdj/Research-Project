'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  BookOpen, ArrowLeft, GraduationCap, MonitorPlay, Sparkles, ChevronRight
} from 'lucide-react';

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
  
  const skillsString = searchParams.get('skills');
  const skills = skillsString ? skillsString.split(',') : [];
  const yearsExp = searchParams.get('exp') || '0';

  // --- UPDATED: INTERNAL NAVIGATION LOGIC ---
  const handleViewInternalCourse = (skillName) => {
    // Instead of external sites, we navigate to our internal courses page
    // We pass the skill as a query so the Courses page can highlight or filter it
    router.push(`/applicant/courses?highlight=${encodeURIComponent(skillName)}`);
  };

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
          <button 
            onClick={() => router.push('/applicant/courses')}
            className="text-sm font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition"
          >
            Browse All Courses
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10">
        
        <div className="mb-10 text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Upskill to <span className="text-purple-400">Get Hired</span>
          </h2>

          <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/40 px-5 py-2 rounded-full shadow-lg shadow-purple-500/10">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-200">
              AI Insight: {yearsExp} Years of Detected Experience
            </span>
          </div>

          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            We found {skills.length} key skill gaps. Use our internal academy to bridge these gaps and qualify for more roles.
          </p>
        </div>

        {skills.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-white/5">
            <p className="text-gray-400 font-medium text-lg">Your profile is a perfect match!</p>
            <button onClick={() => router.push('/applicant/jobs')} className="mt-4 text-purple-400 hover:underline transition">
              Explore more jobs
            </button>
          </div>
        ) : (
          <div className="grid gap-8">
            {skills.map((skill, index) => (
              <div 
                key={index} 
                className="bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl transition hover:border-purple-500/30 group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-600/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                      <MonitorPlay className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white capitalize">{skill}</h3>
                      <p className="text-sm text-gray-400 max-w-md">
                        We have prepared a custom internal roadmap to help you master {skill} and improve your technical score.
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleViewInternalCourse(skill)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
                  >
                    View Internal Course <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}