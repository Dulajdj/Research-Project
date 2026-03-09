'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Map, ArrowLeft, Loader2, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- FIXED IMPORT PATH ---
// We move up 3 levels: heatmap (1) -> applicant (2) -> app (3) -> then into components
const JobHeatmap = dynamic(() => import('../../../applicant/heatmap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-800 text-gray-400">
      <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading Map...
    </div>
  )
});

export default function JobHeatmapPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch Jobs from Database
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Updated to use Port 5000 to match your Node.js backend configuration
        const res = await fetch('http://localhost:5001/api/jobs');
        const data = await res.json();
        if (data.success) {
          setJobs(data.data);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto h-[85vh] flex flex-col">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-white/10 transition text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Map className="w-8 h-8 text-purple-400" />
                Job Opportunity Map
              </h1>
              <p className="text-gray-400 text-sm">See where companies are hiring across Sri Lanka</p>
            </div>
          </div>
          
          <div className="bg-slate-800/80 backdrop-blur border border-white/10 px-5 py-2 rounded-xl text-sm flex items-center gap-3 shadow-lg">
            <div className="flex flex-col items-end">
              <span className="text-purple-400 font-bold text-lg leading-none">
                {loading ? "..." : jobs.length}
              </span>
              <span className="text-gray-400 text-xs uppercase">Active Jobs</span>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <MapPin className="w-5 h-5 text-purple-400" />
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 bg-slate-800 border-4 border-slate-700 rounded-3xl shadow-2xl overflow-hidden relative">
          
          {/* THE MAP COMPONENT */}
          {!loading && <JobHeatmap jobs={jobs} />}

          {/* Legend Overlay */}
          <div className="absolute bottom-6 right-6 bg-slate-900/90 backdrop-blur-md border border-white/10 p-4 rounded-xl z-[400] shadow-xl">
            <h4 className="text-[10px] font-bold uppercase text-gray-400 mb-2 tracking-wider">Hiring Density</h4>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 font-medium">Low</span>
              {/* Gradient Bar */}
              <div className="w-32 h-3 bg-gradient-to-r from-blue-500 via-lime-500 to-red-500 rounded-full shadow-inner"></div>
              <span className="text-xs text-white font-bold">High</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}