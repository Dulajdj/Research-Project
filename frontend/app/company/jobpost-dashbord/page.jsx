'use client';

import React from 'react';
import { 
  Briefcase, Users, BarChart3, TrendingUp, 
  ArrowUpRight, Plus, Eye, UserPlus, Clock
} from 'lucide-react';
import CompanySidebar from '@/app/components/ui/CompanySidebar'; // Oyaage sidebar path eka hariyatama danna
import { useRouter } from 'next/navigation';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

// --- MOCK DATA FOR CHART ---
const chartData = [
  { name: 'Mon', applicants: 12 },
  { name: 'Tue', applicants: 19 },
  { name: 'Wed', applicants: 15 },
  { name: 'Thu', applicants: 28 },
  { name: 'Fri', applicants: 42 },
  { name: 'Sat', applicants: 30 },
  { name: 'Sun', applicants: 45 },
];

// --- MOCK DATA FOR RECENT APPLICANTS ---
const recentApplicants = [
  { id: 1, name: 'Kasun Perera', role: 'Frontend Engineer', time: '2 hours ago' },
  { id: 2, name: 'Amandi Silva', role: 'UI/UX Designer', time: '5 hours ago' },
  { id: 3, name: 'Nuwan Jay', role: 'Backend Developer', time: '1 day ago' },
];

export default function CompanyDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white flex font-sans">
      <CompanySidebar />

      <main className="flex-1 p-6 md:p-10 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Company Dashboard
              </h1>
              <p className="text-gray-400">
                Here's what's happening with your job posts today.
              </p>
            </div>
            
            {/* Quick Post Button top right */}
            <button
              onClick={() => router.push("/company/Addnew-jobpost")}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all"
            >
              <Plus className="w-5 h-5" /> Post New Job
            </button>
          </div>

          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-slate-800/40 backdrop-blur-lg border border-white/10 p-6 rounded-3xl hover:bg-slate-800/60 transition duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <Briefcase className="w-24 h-24 text-purple-400" />
              </div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-purple-500/20 rounded-2xl">
                  <Briefcase className="w-6 h-6 text-purple-400" />
                </div>
                <span className="flex items-center text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3 mr-1" /> +2 This Week
                </span>
              </div>
              <div className="relative z-10">
                <div className="text-4xl font-bold text-white mb-1">12</div>
                <div className="text-gray-400 font-medium">Active Job Posts</div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-800/40 backdrop-blur-lg border border-white/10 p-6 rounded-3xl hover:bg-slate-800/60 transition duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <Users className="w-24 h-24 text-pink-400" />
              </div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-pink-500/20 rounded-2xl">
                  <Users className="w-6 h-6 text-pink-400" />
                </div>
                <span className="flex items-center text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3 mr-1" /> +45 This Week
                </span>
              </div>
              <div className="relative z-10">
                <div className="text-4xl font-bold text-white mb-1">248</div>
                <div className="text-gray-400 font-medium">Total Applicants</div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-800/40 backdrop-blur-lg border border-white/10 p-6 rounded-3xl hover:bg-slate-800/60 transition duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <BarChart3 className="w-24 h-24 text-blue-400" />
              </div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-blue-500/20 rounded-2xl">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <span className="flex items-center text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3 mr-1" /> +5% Rate
                </span>
              </div>
              <div className="relative z-10">
                <div className="text-4xl font-bold text-white mb-1">89%</div>
                <div className="text-gray-400 font-medium">Match Accuracy</div>
              </div>
            </div>
          </div>

          {/* Middle Section: Chart & Recent List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Area (Takes 2 columns on large screens) */}
            <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Application Overview</h2>
                  <p className="text-sm text-gray-400">Applicant traffic over the last 7 days</p>
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApplicants" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c084fc" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                      itemStyle={{ color: '#e879f9' }}
                    />
                    <Area type="monotone" dataKey="applicants" stroke="#c084fc" strokeWidth={3} fillOpacity={1} fill="url(#colorApplicants)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Applicants Area */}
            <div className="bg-slate-800/40 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Recent Applicants</h2>
                <button 
                  onClick={() => router.push('/company/applicants')}
                  className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center"
                >
                  View All <ArrowUpRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              <div className="space-y-4 flex-1">
                {recentApplicants.map((app) => (
                  <div key={app.id} className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-2xl border border-white/5 hover:border-purple-500/30 transition cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                      {app.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">{app.name}</h4>
                      <p className="text-xs text-gray-400 truncate">{app.role}</p>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center whitespace-nowrap">
                      <Clock className="w-3 h-3 mr-1" /> {app.time}
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => router.push('/company/applicants')}
                className="w-full mt-6 py-3 rounded-xl border border-purple-500/30 text-purple-300 font-semibold hover:bg-purple-500/10 transition flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" /> Review Candidates
              </button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}