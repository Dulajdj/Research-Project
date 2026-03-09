'use client';

import React from 'react';
import { Briefcase, Users, BarChart3 } from 'lucide-react';
import CompanySidebar from '../../components/ui/CompanySidebar';

import { useRouter } from 'next/navigation';

export default function CompanyDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex">
      <CompanySidebar />

      <main className="flex-1 p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Welcome to Your Company Dashboard
        </h1>

        <p className="text-gray-300 mb-10">
          Manage job postings, track applicants, and analyze hiring insights.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-2xl hover:bg-white/20 transition">
            <Briefcase className="w-10 h-10 text-purple-300 mb-3" />
            <div className="text-3xl font-bold">12</div>
            <div className="text-gray-300">Active Job Posts</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-2xl hover:bg-white/20 transition">
            <Users className="w-10 h-10 text-purple-300 mb-3" />
            <div className="text-3xl font-bold">248</div>
            <div className="text-gray-300">Total Applicants</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-2xl hover:bg-white/20 transition">
            <BarChart3 className="w-10 h-10 text-purple-300 mb-3" />
            <div className="text-3xl font-bold">89%</div>
            <div className="text-gray-300">Match Accuracy</div>
          </div>
        </div>

        <div className="mt-12 bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-purple-300">Quick Actions</h2>

          <button
            onClick={() => router.push("/company/Addnew-jobpost")}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition"
          >
            + Post New Job
          </button>
        </div>
      </main>
    </div>
  );
}
