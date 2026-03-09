'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import { 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Building2, 
  CheckCircle2,
  ArrowRight,
  Clock,
  Calendar,
  FileText,
  X,
  GraduationCap,
  Code2,
  Map // NEW: Import Map icon for the button
} from 'lucide-react';

export default function ApplicantJobBoard() {
  const router = useRouter(); // Initialize Router
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for the selected job (Modal)
  const [selectedJob, setSelectedJob] = useState(null);

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/jobs');
        const data = await res.json();
        if (data.success) {
          setJobs(data.data);
          setFilteredJobs(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Handle Search
  useEffect(() => {
    const results = jobs.filter(job => {
      const title = job.jobTitle?.toLowerCase() || '';
      const company = job.companyName?.toLowerCase() || '';
      const skills = job.requiredSkills?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();

      return title.includes(search) || company.includes(search) || skills.includes(search);
    });
    setFilteredJobs(results);
  }, [searchTerm, jobs]);

  // --- UPDATED: Handle Apply Action ---
  const handleApply = (jobId) => {
    // Navigate to the dynamic application page
    router.push(`/applicant/apply/${jobId}`);
  };

  // Helper for skills pills
  const getSkillsArray = (skillsString) => {
    if (!skillsString) return [];
    return skillsString.split(',').map(skill => skill.trim()).filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans">
      
      {/* Navbar Placeholder */}
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-purple-400" />
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Career Guide
            </span>
          </div>
          <div className="text-sm text-gray-400">Applicant Portal</div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header & Search */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Dream Job</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Browse through hundreds of job opportunities tailored to your skills and experience.
          </p>

          {/* NEW PART: SEARCH AND MAP BUTTON CONTAINER */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
            <div className="relative w-full max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-4 bg-slate-800/50 border border-white/10 rounded-full leading-5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm"
                placeholder="Search by Job Title, Company, or Skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* NEW: VIEW HEATMAP BUTTON */}
            <button 
              onClick={() => router.push('/applicant/heatmap')}
              className="flex items-center gap-2 px-6 py-4 bg-purple-600/20 border border-purple-500/40 rounded-full hover:bg-purple-600/30 transition-all group whitespace-nowrap"
            >
              <Map className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-purple-100">View Job Map</span>
            </button>
          </div>
        </div>

        {/* Job Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Finding best matches...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-white/5">
            <p className="text-gray-400 text-lg">No jobs found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => {
              const skillsList = getSkillsArray(job.requiredSkills);
              const skillsCount = skillsList.length;

              return (
                <div 
                  key={job._id} 
                  className="group bg-slate-800/40 hover:bg-slate-800/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-300 flex flex-col h-full"
                >
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-white/5 p-3 rounded-xl">
                      <Building2 className="w-6 h-6 text-purple-400" />
                    </div>
                    {job.postingDate && (
                      <span className="text-xs text-gray-500 bg-slate-900/50 px-2 py-1 rounded-full border border-white/5">
                        {new Date(job.postingDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Job Title & Company */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors line-clamp-1">
                      {job.jobTitle}
                    </h3>
                    <p className="text-gray-400 text-sm font-medium">{job.companyName}</p>
                  </div>

                  {/* Details Pills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex items-center text-xs text-gray-300 bg-slate-700/50 px-2.5 py-1 rounded-md border border-white/5">
                      <MapPin className="w-3 h-3 mr-1 text-blue-400" />
                      {job.workLocation}
                    </div>
                    <div className="flex items-center text-xs text-gray-300 bg-slate-700/50 px-2.5 py-1 rounded-md border border-white/5">
                      <Briefcase className="w-3 h-3 mr-1 text-orange-400" />
                      {job.employmentType}
                    </div>
                    {job.salaryRange && (
                      <div className="flex items-center text-xs text-gray-300 bg-slate-700/50 px-2.5 py-1 rounded-md border border-white/5">
                        <DollarSign className="w-3 h-3 mr-1 text-green-400" />
                        {job.salaryRange}
                      </div>
                    )}
                  </div>

                  {/* Skills Preview */}
                  <div className="mb-6 flex-grow">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-semibold">Required Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {skillsList.slice(0, 3).map((skill, i) => (
                        <span key={i} className="text-xs text-purple-200 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                          {skill}
                        </span>
                      ))}
                      {skillsCount > 3 && (
                        <span className="text-xs text-gray-500 px-1 py-0.5">
                          +{skillsCount - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto pt-4 border-t border-white/5 flex gap-3">
                    <button 
                      onClick={() => setSelectedJob(job)} // OPEN MODAL
                      className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-gray-300 hover:bg-white/5 transition hover:text-white"
                    >
                      View Details
                    </button>

                    <button 
                      onClick={() => handleApply(job._id)} // NAVIGATE TO APPLY PAGE
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02]"
                    >
                      Apply Now <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* --- JOB DETAILS MODAL --- */}
      {selectedJob && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-white/10 p-6 flex justify-between items-start z-10">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedJob.jobTitle}</h2>
                <div className="flex items-center gap-2 text-gray-400">
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium">{selectedJob.companyName}</span>
                  {selectedJob.companyWebsite && (
                    <a href={selectedJob.companyWebsite} target="_blank" rel="noreferrer" className="text-purple-400 text-sm hover:underline">
                      (Visit Website)
                    </a>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setSelectedJob(null)}
                className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-6 space-y-8">
              
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                  <div className="text-xs text-gray-500 mb-1">Experience</div>
                  <div className="text-sm font-medium text-white">{selectedJob.experienceLevel}</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                  <div className="text-xs text-gray-500 mb-1">Type</div>
                  <div className="text-sm font-medium text-white">{selectedJob.employmentType}</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                  <div className="text-xs text-gray-500 mb-1">Salary</div>
                  <div className="text-sm font-medium text-green-400">{selectedJob.salaryRange || 'Not specified'}</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                  <div className="text-xs text-gray-500 mb-1">Location</div>
                  <div className="text-sm font-medium text-blue-300">{selectedJob.workLocation}</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" /> Job Description
                </h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                  {selectedJob.jobDescription}
                </p>
              </div>

              {/* Skills & Qualifications Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                
                {/* Skills */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-purple-400" /> Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {getSkillsArray(selectedJob.requiredSkills).map((skill, index) => (
                      <span key={index} className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1.5 rounded-lg text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Qualifications */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-purple-400" /> Qualifications
                  </h3>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedJob.requiredQualifications}
                  </p>
                </div>
              </div>

              {/* Additional Info: Schedule & Dates */}
              <div className="flex flex-wrap gap-6 pt-6 border-t border-white/10 text-sm text-gray-400">
                {selectedJob.workingHours && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Schedule: {selectedJob.workingHours}</span>
                  </div>
                )}
                {selectedJob.closingDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Closing Date: {new Date(selectedJob.closingDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer - Fixed Action Area */}
            <div className="sticky bottom-0 bg-slate-900 border-t border-white/10 p-6 flex items-center justify-between z-10">
              
              {/* Download Attachment Link */}
              <div>
                {selectedJob.fileName && (
                  <a 
                    href={selectedJob.fileData} 
                    download={selectedJob.fileName}
                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium hover:underline transition"
                  >
                    <FileText className="w-4 h-4" />
                    Download Job Spec
                  </a>
                )}
              </div>

              {/* Apply Button - Navigates to Application Page */}
              <button 
                onClick={() => handleApply(selectedJob._id)}
                className="px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-105 bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-purple-500/30"
              >
                Apply for this Position
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}