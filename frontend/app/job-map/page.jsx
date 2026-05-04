'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Map, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const MapLoader = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-purple-400">
    <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
    <p className="animate-pulse font-medium">Loading Sri Lanka Job Map...</p>
  </div>
);

// Map component eka dynamically import karanawa
const JobHeatmap = dynamic(() => import('./JobHeatmap'), {
  ssr: false,
  loading: MapLoader
});

export default function NewJobMapPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);

  // Map page eka load weddi API eken available jobs tika gannawa
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/jobs');
        const data = await res.json();
        if (data.success) {
          setJobs(data.data); // Jobs tika state ekata set karanawa
        }
      } catch (error) {
        console.error("Failed to fetch jobs for map:", error);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()} 
            className="p-2 rounded-full hover:bg-white/10 transition text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Map className="w-8 h-8 text-purple-500" />
              Job Opportunities Heatmap
            </h1>
            <p className="text-gray-400 mt-1">
              Sri Lanka we pura thiyena available job vacancies balanna.
            </p>
          </div>
        </div>

        {/* Map eka render wena thana */}
        <div className="w-full h-[70vh] min-h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/10 relative z-0">
          <JobHeatmap jobs={jobs} />
        </div>

      </div>
    </div>
  );
}