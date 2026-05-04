'use client';

import React, { useEffect, useState, useMemo } from 'react';
import CompanySidebar from '@/app/components/ui/CompanySidebar'; // Verify path
import { 
  Briefcase, FileText, Calendar, Trash2, MapPin, 
  DollarSign, Clock, Building2, BarChart3, PieChart
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart as RechartsPieChart, Pie, Cell 
} from 'recharts';

// --- COLORS FOR CHARTS ---
const PIE_COLORS = ['#c084fc', '#f472b6', '#38bdf8', '#fbbf24', '#34d399'];

export default function PostedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/jobs');
        const data = await res.json();
        if (data.success) {
          setJobs(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // --- ANALYTICS DATA GENERATION (Derived from jobs) ---
  
  // 1. Data for "Experience Level" Pie Chart
  const experienceData = useMemo(() => {
    const counts = {};
    jobs.forEach(job => {
      const level = job.experienceLevel || 'Unspecified';
      counts[level] = (counts[level] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [jobs]);

  // 2. Data for "Employment Type" Bar Chart
  const employmentData = useMemo(() => {
    const counts = {};
    jobs.forEach(job => {
      const type = job.employmentType || 'Unspecified';
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, count: counts[key] }));
  }, [jobs]);

  // Helper
  const getSkillsArray = (skillsString) => {
    if (!skillsString) return [];
    return skillsString.split(',').map(skill => skill.trim()).filter(Boolean);
  };

  // Handle Delete (Mock function - Add your API call here)
  const handleDelete = (jobId) => {
    if(window.confirm('Are you sure you want to delete this job post?')) {
      // Add fetch DELETE request here
      setJobs(jobs.filter(j => j._id !== jobId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white flex font-sans">
      <CompanySidebar />

      <main className="flex-1 p-6 md:p-10 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Posted Jobs Analytics
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manage and analyze your active job listings.</p>
          </div>

          {/* --- TOP SECTION: CHARTS --- */}
          {!loading && jobs.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart 1: Experience Levels (Pie) */}
              <div className="bg-slate-800/40 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                  <PieChart className="w-5 h-5 text-pink-400" />
                  <h2 className="text-lg font-bold text-white">Jobs by Experience Level</h2>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={experienceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {experienceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                        itemStyle={{ color: '#e879f9' }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {experienceData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-300">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                      {entry.name} ({entry.value})
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart 2: Employment Types (Bar) */}
              <div className="bg-slate-800/40 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-bold text-white">Jobs by Employment Type</h2>
                </div>
                <div className="h-[250px] w-full mt-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={employmentData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip 
                        cursor={{ fill: '#334155', opacity: 0.4 }}
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                      />
                      <Bar dataKey="count" fill="#c084fc" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* --- BOTTOM SECTION: JOB LISTINGS --- */}
          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-400" /> Active Job Posts ({jobs.length})
            </h2>

            {loading ? (
              <div className="flex flex-col justify-center items-center h-64 text-purple-400 gap-3">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                Loading jobs...
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-24 bg-slate-800/30 backdrop-blur-sm rounded-3xl border border-white/5 shadow-inner">
                <Briefcase className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-white">No jobs posted yet</h3>
                <p className="text-gray-400 mt-2">Start by creating your first job post from the dashboard.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-slate-800/40 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-lg hover:border-purple-500/30 hover:bg-slate-800/60 transition-all group relative overflow-hidden flex flex-col"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10 flex-1 flex flex-col">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 pr-4">
                          <h2 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                            {job.jobTitle}
                          </h2>
                          <div className="flex items-center gap-2 text-gray-400 text-sm mt-1.5">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            <span className="truncate">{job.companyName}</span>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => handleDelete(job._id)}
                          className="text-gray-500 hover:text-red-400 p-2.5 rounded-xl hover:bg-red-500/10 transition shrink-0 bg-white/5"
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Metadata Tags */}
                      <div className="flex flex-wrap gap-2 mb-5">
                        <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5">
                          <Briefcase className="w-3 h-3" /> {job.employmentType}
                        </span>
                        <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" /> {job.workLocation}
                        </span>
                        {job.salaryRange && (
                          <span className="bg-green-500/10 text-green-300 border border-green-500/20 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5">
                            <DollarSign className="w-3 h-3" /> {job.salaryRange}
                          </span>
                        )}
                        <span className="bg-orange-500/10 text-orange-300 border border-orange-500/20 px-2.5 py-1 rounded-lg text-xs font-medium">
                          {job.experienceLevel}
                        </span>
                      </div>

                      {/* Description Excerpt */}
                      <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed flex-1">
                        {job.jobDescription}
                      </p>
                      
                      {/* Footer Info */}
                      <div className="pt-4 border-t border-white/10 mt-auto">
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          {job.fileName && (
                            <a 
                              href={job.fileData} 
                              download={job.fileName} 
                              className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 hover:underline transition font-medium"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              View Spec
                            </a>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}