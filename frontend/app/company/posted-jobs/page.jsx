'use client';

import React, { useEffect, useState } from 'react';
import CompanySidebar from '../../components/ui/CompanySidebar';
import { 
  Briefcase, 
  FileText, 
  Calendar, 
  Trash2, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building2 
} from 'lucide-react';

export default function PostedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch jobs when the component loads
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

  // Helper function to process skills string into an array
  const getSkillsArray = (skillsString) => {
    if (!skillsString) return [];
    return skillsString.split(',').map(skill => skill.trim()).filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex">
      {/* Sidebar */}
      <CompanySidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Posted Jobs
              </h1>
              <p className="text-gray-400 text-sm mt-1">Manage your active job listings</p>
            </div>
            <a href="/company/add-job" className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-lg shadow-purple-500/20">
              + Post New Job
            </a>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64 text-gray-400">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-24 bg-slate-800/30 backdrop-blur-sm rounded-3xl border border-white/5">
              <Briefcase className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white">No jobs posted yet</h3>
              <p className="text-gray-400 mt-2">Start by creating your first job post.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-slate-800/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-lg hover:border-purple-500/30 transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                          {job.jobTitle}
                        </h2>
                        <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                          <Building2 className="w-4 h-4" />
                          <span>{job.companyName}</span>
                          <span className="text-gray-600">•</span>
                          <span className="text-gray-500">Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <button 
                        className="text-gray-500 hover:text-red-400 p-2 rounded-full hover:bg-white/5 transition"
                        title="Delete Job"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Metadata Tags */}
                    <div className="flex flex-wrap gap-3 mb-5">
                      <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> {job.employmentType}
                      </span>
                      <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {job.workLocation}
                      </span>
                      {job.salaryRange && (
                        <span className="bg-green-500/10 text-green-300 border border-green-500/20 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> {job.salaryRange}
                        </span>
                      )}
                      <span className="bg-orange-500/10 text-orange-300 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-medium">
                        {job.experienceLevel}
                      </span>
                    </div>

                    {/* Skills Section - Icon Removed */}
                    <div className="mb-5">
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Required Skills</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getSkillsArray(job.requiredSkills).map((skill, index) => (
                          <span 
                            key={index}
                            className="bg-slate-700/50 text-gray-300 px-2.5 py-1 rounded-md text-xs border border-white/5"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Description Excerpt */}
                    <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed border-l-2 border-purple-500/30 pl-3">
                      {job.jobDescription}
                    </p>
                    
                    {/* Footer Info */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
                      <div className="flex gap-6 text-sm text-gray-500">
                        {job.workingHours && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{job.workingHours}</span>
                          </div>
                        )}
                        {job.closingDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>Closes: {new Date(job.closingDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {job.fileName && (
                        <a 
                          href={job.fileData} 
                          download={job.fileName} 
                          className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 hover:underline transition"
                        >
                          <FileText className="w-4 h-4" />
                          Download Spec ({job.fileName})
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}