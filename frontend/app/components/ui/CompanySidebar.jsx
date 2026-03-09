'use client';

import React from 'react';
import { Building2, Users, FileText, Briefcase, BarChart3, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CompanySidebar() {
  const router = useRouter();

  return (
    <aside className="w-72 h-screen bg-slate-900/80 backdrop-blur-lg border-r border-purple-500/20 p-6 hidden md:block">
      <div className="flex items-center space-x-2 mb-10">
        <Building2 className="w-8 h-8 text-purple-400" />
        <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Company Panel
        </span>
      </div>

      <nav className="space-y-4">
        <button 
          onClick={() => router.push("/company/jobpost-dashbord")}
          className="flex items-center space-x-3 text-gray-300 hover:text-purple-400 transition w-full text-left"
        >
          <BarChart3 className="w-5 h-5" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => router.push("/company/posted-jobs")}
          className="flex items-center space-x-3 text-gray-300 hover:text-purple-400 transition w-full text-left"
        >
          <Briefcase className="w-5 h-5" />
          <span>Posted Jobs</span>
        </button>

        <button
          onClick={() => router.push("/company/applicants")}
          className="flex items-center space-x-3 text-gray-300 hover:text-purple-400 transition w-full text-left"
        >
          <Users className="w-5 h-5" />
          <span>Applicants</span>
        </button>

        <button
          onClick={() => router.push("/company/Addnew-jobpost")}
          className="flex items-center space-x-3 text-gray-300 hover:text-purple-400 transition w-full text-left"
        >
          <FileText className="w-5 h-5" />
          <span>Add New Job Post</span>
        </button>

        <button
          onClick={() => router.push("/company/settings")}
          className="flex items-center space-x-3 text-gray-300 hover:text-purple-400 transition w-full text-left"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>

        <button
          onClick={() => router.push("/logout")}
          className="flex items-center space-x-3 text-red-400 hover:text-red-500 transition w-full text-left mt-10"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
}
