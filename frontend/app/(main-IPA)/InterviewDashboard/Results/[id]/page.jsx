"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function InterviewResults() {
  const { id } = useParams();
  const router = useRouter();
  const [interview, setInterview] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/interview/${id}`
        );
        setInterview(res.data);
      } catch (error) {
        console.log("Fetch error:", error);
      }
    };

    fetchData();
  }, [id]);

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-900 text-white">
        Loading...
      </div>
    );
  }

  const handleStartInterview = () => {
    // ✅ EXACT folder name match
    router.push(`/InterviewDashboard/ScheduledInterview?id=${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-10">

      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">

        <h1 className="text-3xl font-bold text-white mb-6">
          Interview Questions
        </h1>

        <div className="mb-6 text-white space-y-2">
          <p>
            <span className="font-semibold">Job Role:</span> {interview.jobRole}
          </p>
          <p>
            <span className="font-semibold">Description:</span> {interview.jobDescription}
          </p>
        </div>

        <div className="space-y-4">
          {interview.questions.map((q, index) => (
            <div
              key={index}
              className="bg-white/10 border border-white/20 p-5 rounded-xl text-white shadow-md hover:scale-[1.02] transition-all duration-300"
            >
              <span className="font-semibold text-purple-300">
                {index + 1}.
              </span>{" "}
              {q}
            </div>
          ))}
        </div>

        {/* ✅ START INTERVIEW BUTTON */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={handleStartInterview}
            className="bg-green-600 hover:bg-green-700 transition-all duration-300 text-white px-10 py-4 rounded-xl text-lg font-semibold shadow-xl hover:scale-105"
          >
            🚀 Start Interview
          </button>
        </div>

      </div>
    </div>
  );
}