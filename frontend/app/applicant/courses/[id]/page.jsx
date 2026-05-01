'use client';

import React, { use } from 'react'; // 1. Import 'use' from React
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Lock, Play, FileText } from 'lucide-react';


const ROADMAP_DATA = {
  'sql-mastery': [
    { title: 'Intro to Relational Databases', type: 'Video', status: 'completed' },
    { title: 'SELECT Statements & Filters', type: 'Practical', status: 'current' },
    { title: 'Joins and Aggregations', type: 'Video', status: 'locked' },
    { title: 'Database Optimization', type: 'Quiz', status: 'locked' }
  ],
  'python-pro': [
    { title: 'Advanced Decorators', type: 'Video', status: 'current' },
    { title: 'Asynchronous Programming', type: 'Practical', status: 'locked' }
  ],
  'mern-stack': [
    { title: 'MongoDB Schema Design', type: 'Video', status: 'current' },
    { title: 'Express Middleware', type: 'Practical', status: 'locked' }
  ]
};

export default function CourseRoadmap({ params }) {
  const router = useRouter();
  
  // 2. Unwrap the params Promise using React.use()
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.id;

  // 3. Get modules (with a safe fallback if ID doesn't match)
  const modules = ROADMAP_DATA[courseId] || ROADMAP_DATA['sql-mastery'];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 pt-24">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => router.push('/applicant/courses')} 
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft size={18} /> Back to Courses
        </button>

        <h1 className="text-4xl font-bold mb-4 capitalize">
          {courseId.replace('-', ' ')} Roadmap
        </h1>
        <p className="text-purple-400 font-medium mb-12">Internal AI-Guided Learning Path</p>

        <div className="space-y-4">
          {modules.map((module, index) => (
            <div 
              key={index}
              className={`p-6 rounded-2xl border flex items-center justify-between transition ${
                module.status === 'completed' ? 'bg-green-500/5 border-green-500/20' :
                module.status === 'current' ? 'bg-purple-500/10 border-purple-500/50 scale-[1.02]' :
                'bg-slate-900 border-white/5 opacity-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  module.status === 'completed' ? 'bg-green-500 text-white' :
                  module.status === 'current' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-gray-500'
                }`}>
                  {module.status === 'completed' ? <CheckCircle2 size={20} /> : index + 1}
                </div>
                <div>
                  <h4 className="font-bold">{module.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <FileText size={12} /> {module.type}
                  </div>
                </div>
              </div>

              {module.status === 'locked' ? (
                <Lock size={20} className="text-gray-600" />
              ) : (
                <button className={`p-2 rounded-full ${module.status === 'completed' ? 'text-green-500' : 'bg-white text-black'}`}>
                  {module.status === 'completed' ? 'Reviewed' : <Play size={16} className="fill-current" />}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}