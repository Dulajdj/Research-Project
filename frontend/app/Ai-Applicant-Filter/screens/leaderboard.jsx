import React, { useState, useEffect } from "react";
import { Trophy, ArrowLeft, Medal, Loader2, Target, Award } from "lucide-react";

function Leaderboard({ onBack }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/assessment/leaderboard",
        );
        const data = await res.json();
        if (data.success) {
          setLeaderboardData(data.data);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] px-4 animate-in fade-in duration-500">
      <div className="w-full max-w-4xl bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-yellow-500/30 shadow-2xl shadow-yellow-500/10">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h2 className="text-3xl font-bold text-white">
              Global Leaderboard
            </h2>
          </div>
          <div className="w-20"></div> {/* Spacer for center alignment */}
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
            <p className="text-gray-400 font-medium">Loading rankings...</p>
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              No assessments have been completed yet.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Be the first to set a high score!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Rank</th>
                  <th className="p-4 font-semibold">Candidate Name</th>
                  <th className="p-4 font-semibold text-center">Top Score</th>
                  <th className="p-4 font-semibold text-center">
                    Total Attempts
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((user, index) => (
                  <tr
                    key={index}
                    className={`border-b border-white/5 transition-colors hover:bg-white/5 ${
                      user.name === "Current User" ? "bg-purple-900/20" : ""
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <Medal className="w-6 h-6 text-yellow-400" />
                        )}
                        {index === 1 && (
                          <Medal className="w-6 h-6 text-gray-300" />
                        )}
                        {index === 2 && (
                          <Medal className="w-6 h-6 text-amber-600" />
                        )}
                        <span
                          className={`font-bold text-lg ${index < 3 ? "text-white" : "text-gray-500"}`}
                        >
                          #{user.rank}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-white flex items-center gap-2">
                      {user.name}
                      {user.name === "Current User" && (
                        <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                          You
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center gap-1 text-green-400 font-bold bg-green-400/10 px-3 py-1 rounded-full">
                        <Award className="w-4 h-4" /> {user.score}%
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center gap-1 text-cyan-400 font-medium bg-cyan-400/10 px-3 py-1 rounded-full">
                        <Target className="w-4 h-4" /> {user.attempts}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
