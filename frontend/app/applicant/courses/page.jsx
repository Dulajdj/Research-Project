'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Book, Clock, Star, ArrowRight, ShieldCheck, Cpu, Database, Layout, Code } from 'lucide-react';

// --- EXPANDED HARDCODED SAMPLE COURSES ---
const SAMPLE_COURSES = [
  {
    id: 'sql-mastery',
    title: 'SQL for Data Analysis',
    description: 'Learn how to query databases and perform complex data transformations using SQL. Ideal for career paths in Data Science and Backend Dev.',
    lessons: 5,
    difficulty: 'Beginner',
    category: 'Database',
    icon: <Database size={20} className="text-purple-400" />
  },
  {
    id: 'python-pro',
    title: 'Python for Professionals',
    description: 'Master decorators, generators, and asynchronous programming in Python to build scalable backend systems and AI models.',
    lessons: 8,
    difficulty: 'Advanced',
    category: 'Programming',
    icon: <Code size={20} className="text-purple-400" />
  },
  {
    id: 'mern-stack',
    title: 'Full-Stack MERN Mastery',
    description: 'Build real-world SaaS applications using MongoDB, Express, React, and Node.js. Includes deployment and authentication.',
    lessons: 12,
    difficulty: 'Intermediate',
    category: 'Web Development',
    icon: <Layout size={20} className="text-purple-400" />
  },
  {
    id: 'gen-ai-apps',
    title: 'Generative AI Integration',
    description: 'Learn to integrate LLMs like Gemini and GPT into your web applications for intelligent features like chatbots and summarizers.',
    lessons: 6,
    difficulty: 'Intermediate',
    category: 'AI / ML',
    icon: <Cpu size={20} className="text-purple-400" />
  },
  {
    id: 'cyber-security',
    title: 'Defensive Coding & Security',
    description: 'Secure your Node.js and React applications against common vulnerabilities like XSS, SQL Injection, and CSRF.',
    lessons: 7,
    difficulty: 'Intermediate',
    category: 'Security',
    icon: <ShieldCheck size={20} className="text-purple-400" />
  }
];

export default function CoursesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 pt-24 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-bold mb-4">
            AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Academy</span>
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg">
            Internal courses curated specifically to help you bridge your skill gaps and land your next role.
          </p>
        </header>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SAMPLE_COURSES.map((course) => (
            <div 
              key={course.id} 
              className="group bg-slate-900/50 border border-white/5 p-6 rounded-3xl hover:border-purple-500/40 transition-all duration-300 flex flex-col h-full shadow-xl"
            >
              {/* Category Badge & Icon */}
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                  {course.category}
                </span>
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                   {course.icon}
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-300 transition-colors">
                {course.title}
              </h3>
              <p className="text-gray-400 text-sm mb-8 line-clamp-3 flex-grow leading-relaxed">
                {course.description}
              </p>

              {/* Meta Info Table-style */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-8 pt-4 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-purple-400" />
                  {course.lessons} Modules
                </div>
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="text-orange-400" />
                  {course.difficulty}
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => router.push(`/applicant/courses/${course.id}`)}
                className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-purple-600 hover:text-white transition-all shadow-lg hover:shadow-purple-500/25 active:scale-95"
              >
                View Roadmap <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}