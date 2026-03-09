"use client";

import React, { useState, useEffect } from "react";
import {
  Video,
  View,
  Plus,
  ArrowRight,
  BarChart3,
  Award,
  Target,
  Briefcase
} from "lucide-react";
import Link from "next/link";

function Dashboard() {

  const [stats, setStats] = useState({});
  const [scheduledInterviews, setScheduledInterviews] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchScheduledInterviews();
  }, []);

  // ======================
  // FETCH DASHBOARD STATS
  // ======================

  const fetchStats = async () => {
    try {

      const res = await fetch(
        "http://localhost:5000/api/interview/dashboard/stats"
      );

      const data = await res.json();

      setStats(data);

    } catch (error) {
      console.log(error);
    }
  };

  // ======================
  // FETCH SCHEDULED INTERVIEWS
  // ======================

  const fetchScheduledInterviews = async () => {

    try {

      const res = await fetch(
        "http://localhost:5000/api/scheduled-interview"
      );

      const data = await res.json();

      if (data.success) {
        setScheduledInterviews(
          data.interviews?.slice(0, 3) || []
        );
      }

    } catch (error) {
      console.log(error);
    }

  };

  return (
    <div className="min-h-screen p-6">

      {/* TITLE */}

      <h1 className="text-3xl font-bold text-gray-200 mb-8">
        AI Interview Dashboard
      </h1>

      {/* =========================
          ANALYTICS CARDS
      ========================== */}

      <div className="grid md:grid-cols-4 gap-6 mb-10">

        {/* Total Interviews */}

        <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">

          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="text-blue-400"/>
            <h3 className="text-gray-300 text-sm">
              Total Interviews
            </h3>
          </div>

          <p className="text-3xl font-bold text-white">
            {stats.totalInterviews || 0}
          </p>

        </div>


        {/* Average Score */}

        <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">

          <div className="flex items-center gap-3 mb-3">
            <Target className="text-green-400"/>
            <h3 className="text-gray-300 text-sm">
              Average Score
            </h3>
          </div>

          <p className="text-3xl font-bold text-white">
            {stats.averageScore || 0}%
          </p>

        </div>


        {/* Best Score */}

        <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">

          <div className="flex items-center gap-3 mb-3">
            <Award className="text-yellow-400"/>
            <h3 className="text-gray-300 text-sm">
              Best Score
            </h3>
          </div>

          <p className="text-3xl font-bold text-white">
            {stats.bestScore || 0}%
          </p>

        </div>


        {/* Most Practiced Role */}

        <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">

          <div className="flex items-center gap-3 mb-3">
            <Briefcase className="text-purple-400"/>
            <h3 className="text-gray-300 text-sm">
              Most Practiced Role
            </h3>
          </div>

          <p className="text-lg font-semibold text-white">
            {stats.mostPracticedRole || "N/A"}
          </p>

        </div>

      </div>

      {/* =========================
         ACTION CARDS
      ========================== */}

      <div className="grid md:grid-cols-2 gap-6 mb-10">

        <Link
          href={'InterviewDashboard/CreateInterview'}
          className="bg-slate-800 border border-slate-700 rounded-xl p-8 hover:border-purple-500 transition"
        >

          <Video className="text-blue-400 mb-4"/>

          <h3 className="text-xl text-white font-semibold">
            Create New Interview
          </h3>

          <p className="text-gray-400">
            Generate AI interview questions
          </p>

        </Link>


        <Link
          href={'InterviewDashboard/History'}
          className="bg-slate-800 border border-slate-700 rounded-xl p-8 hover:border-purple-500 transition"
        >

          <View className="text-purple-400 mb-4"/>

          <h3 className="text-xl text-white font-semibold">
            View Interviews
          </h3>

          <p className="text-gray-400">
            See scheduled and past interviews
          </p>

        </Link>

      </div>

      {/* =========================
         SCHEDULED INTERVIEWS
      ========================== */}

      {scheduledInterviews.length > 0 && (

        <div>

          <div className="flex justify-between mb-6">

            <h2 className="text-xl font-bold text-gray-200">
              Upcoming Interviews
            </h2>

            <Link
              href={'InterviewDashboard/ScheduledInterview'}
              className="flex items-center gap-2 text-blue-400"
            >
              See All
              <ArrowRight size={16}/>
            </Link>

          </div>

          <div className="space-y-4">

            {scheduledInterviews.map((interview) => (

              <div
                key={interview._id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-4"
              >

                <div className="flex justify-between">

                  <div>

                    <h3 className="text-white font-semibold">
                      {interview.title}
                    </h3>

                    <p className="text-gray-400 text-sm">
                      {interview.candidateName}
                    </p>

                  </div>

                  <span className="text-sm text-gray-300">
                    {interview.date}
                  </span>

                </div>

              </div>

            ))}

          </div>

        </div>
        

      )}
      <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 shadow-xl flex flex-col items-center text-center">
           
              <>
                <div className="w-20 h-20 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-6">
                  <Video className="h-10 w-10 text-blue-400" />
                </div>
               
                <Link href={'InterviewDashboard/CreateInterview'} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl text-base font-semibold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 transform hover:scale-105">
                  + Create New Interview
                </Link>
              </>
          </div>

    </div>
  );
}

export default Dashboard;