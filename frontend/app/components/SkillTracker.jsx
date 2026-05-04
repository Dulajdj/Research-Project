'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Lock, Play, FileText, Trophy } from 'lucide-react';

// Hardcoded specific roadmaps
const ROADMAP_DATA = {
  'sql-mastery': [
    { id: 1, title: 'Intro to Relational Databases', type: 'Video', url: 'https://youtube.com', completed: true },
    { id: 2, title: 'SELECT Statements & Filters', type: 'Practical', url: 'https://udemy.com', completed: false },
    { id: 3, title: 'Joins and Aggregations', type: 'Video', url: 'https://coursera.com', completed: false },
    { id: 4, title: 'Database Optimization', type: 'Quiz', url: '#', completed: false }
  ],
  'python-pro': [
    { id: 1, title: 'Advanced Decorators', type: 'Video', url: '#', completed: false },
    { id: 2, title: 'Asynchronous Programming', type: 'Practical', url: '#', completed: false }
  ],
  'mern-stack': [
    { id: 1, title: 'MongoDB Schema Design', type: 'Video', url: '#', completed: false },
    { id: 2, title: 'Express Middleware', type: 'Practical', url: '#', completed: false }
  ]
};

export default function SkillTracker({ skill }) {
  const router = useRouter();
  const formattedSkillName = skill ? skill.replace(/-/g, ' ') : 'Unknown Skill';
  
  // UPDATE 1: Dynamic Fallback Generator. 
  // If the skill isn't in ROADMAP_DATA, it auto-generates a working roadmap specifically for that skill!
  const initialData = ROADMAP_DATA[skill] || [
    { id: 1, title: `Introduction to ${formattedSkillName}`, type: 'Video', url: `https://www.youtube.com/results?search_query=learn+${skill}`, completed: false },
    { id: 2, title: `Core Concepts & Practice`, type: 'Practical', url: `https://www.udemy.com/courses/search/?q=${skill}`, completed: false },
    { id: 3, title: `Advanced ${formattedSkillName} Techniques`, type: 'Project', url: `https://www.coursera.org/search?query=${skill}`, completed: false }
  ];

  const [steps, setSteps] = useState(initialData);

  // Calculate Progress Percentage
  const completedCount = steps.filter(step => step.completed).length;
  const progressPercentage = Math.round((completedCount / steps.length) * 100);

  // UPDATE 2: Cleaner Functional Logic for 'current' and 'locked' statuses
  const firstUncompletedIndex = steps.findIndex(step => !step.completed);
  
  const displaySteps = steps.map((step, index) => {
    if (step.completed) return { ...step, status: 'completed' };
    if (index === firstUncompletedIndex) return { ...step, status: 'current' };
    return { ...step, status: 'locked' };
  });

  // Handle clicking the action button
  const toggleStep = async (stepId, currentStatus) => {
    // UI Update
    const updatedSteps = steps.map(step => 
      step.id === stepId ? { ...step, completed: !currentStatus } : step
    );
    setSteps(updatedSteps);

    // Backend Update (Optional - Uncomment when your backend is running)
    /*
    try {
      await fetch('http://localhost:5000/api/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: "123", skill: skill, stepId: stepId, completed: !currentStatus })
      });
    } catch (error) {
      console.error("Backend update failed:", error);
    }
    */
  };

  return (
    <div className="text-white p-8 pt-10">
      <div className="max-w-3xl mx-auto">
        
        {/* Header & Back Button */}
        <button 
          onClick={() => router.push('/applicant/recommendations')} 
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft size={18} /> Back to Recommendations
        </button>

        <h1 className="text-4xl font-bold mb-2 capitalize">
          {formattedSkillName} Roadmap
        </h1>
        
        <div className="flex justify-between items-end mb-8">
          <p className="text-purple-400 font-medium">Internal AI-Guided Learning Path</p>
          <span className="text-sm text-gray-400">{progressPercentage}% Completed</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-2 mb-10 overflow-hidden border border-white/5">
          <div 
            className="bg-gradient-to-r from-purple-500 to-green-400 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Roadmap Modules */}
        <div className="space-y-4">
          {displaySteps.map((module, index) => (
            <div 
              key={module.id}
              className={`p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
                module.status === 'completed' ? 'bg-green-500/5 border-green-500/20' :
                module.status === 'current' ? 'bg-purple-500/10 border-purple-500/50 scale-[1.02] shadow-lg shadow-purple-500/10' :
                'bg-slate-900 border-white/5 opacity-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                  module.status === 'completed' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' :
                  module.status === 'current' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 
                  'bg-slate-800 text-gray-500'
                }`}>
                  {module.status === 'completed' ? <CheckCircle2 size={24} /> : index + 1}
                </div>
                <div>
                  <h4 className={`font-bold text-lg ${module.status === 'completed' ? 'text-gray-400 line-through' : 'text-white'}`}>
                    {module.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <FileText size={12} /> {module.type}
                  </div>
                </div>
              </div>

              {/* Action Buttons based on status */}
              {module.status === 'locked' ? (
                <div className="p-3 rounded-full bg-slate-800/50">
                  <Lock size={20} className="text-gray-600" />
                </div>
              ) : (
                <div className="flex gap-3">
                  {module.status === 'current' && (
                    <a 
                      href={module.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-full text-sm font-semibold transition text-white"
                    >
                      <Play size={16} /> Start
                    </a>
                  )}
                  <button 
                    onClick={() => toggleStep(module.id, module.completed)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
                      module.status === 'completed' 
                        ? 'bg-slate-800 text-gray-400 hover:text-white hover:bg-slate-700' 
                        : 'bg-white text-black hover:bg-gray-200'
                    }`}
                  >
                    {module.status === 'completed' ? 'Undo' : 'Mark Done'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Success Message */}
        {progressPercentage === 100 && (
          <div className="mt-8 p-5 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center justify-center gap-3 text-green-400 animate-pulse">
            <Trophy className="w-8 h-8" />
            <span className="font-bold text-lg">Roadmap Completed! You are ready for the next level.</span>
          </div>
        )}
      </div>
    </div>
  );
}