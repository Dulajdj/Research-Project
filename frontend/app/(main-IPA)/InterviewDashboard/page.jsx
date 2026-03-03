"use client";
import React, { useState } from "react";
import { Video, View } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function Dashboard() {
  const router = useRouter;
  const [interviewList, setInterviewList] = useState([]);

  return (
    <div className="min-h-screen p-6">
      {/* Dashboard Title */}
      <h2 className="text-2xl font-bold text-gray-200 mb-6">Dashboard</h2>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Create New Interview */}
        <Link href={'InterviewDashboard/CreateInterview'} className="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl hover:bg-slate-800/60 hover:border-purple-500/30 transition-all duration-300 cursor-pointer">
          <div className="flex flex-col items-start">
            <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600/30 group-hover:scale-110 transition-all duration-300">
              <Video className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-100 mb-2 group-hover:text-white transition-colors">
              Create New Interview
            </h3>
            <p className="text-gray-400 text-base leading-relaxed">
              Create AI Interviews and schedule them with Candidates
            </p>
          </div>
        </Link>

        {/* View All Interviews */}
        <div className="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl hover:bg-slate-800/60 hover:border-purple-500/30 transition-all duration-300 cursor-pointer">
          <div className="flex flex-col items-start">
            <div className="w-16 h-16 bg-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600/30 group-hover:scale-110 transition-all duration-300">
              <View className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-100 mb-2 group-hover:text-white transition-colors">
              View All Interviews
            </h3>
            <p className="text-gray-400 text-base leading-relaxed">
              Schedule and previous interviews
            </p>
          </div>
        </div>
      </div>

      {/* Previously Created Interviews */}
      <h2 className="text-2xl font-bold text-gray-200 mb-6">
        Previously Created Interviews
      </h2>

      <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 shadow-xl flex flex-col items-center text-center">
        {interviewList?.length === 0 ? (
          <>
            <div className="w-20 h-20 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-6">
              <Video className="h-10 w-10 text-blue-400" />
            </div>
            <p className="text-gray-300 text-base mb-6">
              You don't have any interview created!
            </p>
            <Link href={'InterviewDashboard/CreateInterview'} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl text-base font-semibold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 transform hover:scale-105">
              + Create New Interview
            </Link>
          </>
        ) : (
          <div>{/* Map interviews here later */}</div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;