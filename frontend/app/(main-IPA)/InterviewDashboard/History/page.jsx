"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  FileText,
  Hash,
  Star,
  Calendar,
  BarChart
} from "lucide-react";

export default function History() {

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/interview/history/all")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setInterviews(data.interviews);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-10 text-white">

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-12 text-center"
      >
        Interview History
      </motion.h1>

      {loading ? (
        <div className="text-center text-gray-300">
          Loading interview records...
        </div>
      ) : interviews.length === 0 ? (
        <div className="text-center text-gray-400">
          No past interviews found.
        </div>
      ) : (

        <div className="space-y-8">

          {interviews.map((item, index) => (

            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10 hover:scale-[1.02] transition duration-300"
            >

              {/* Job Title */}
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="text-blue-400" />
                <h2 className="text-2xl font-semibold">
                  {item.title}
                </h2>
              </div>

              {/* Experience */}
              <p className="text-sm text-purple-300 mb-6">
                Experience Level: {item.experienceLevel}
              </p>

              {/* DATA GRID */}
              <div className="grid md:grid-cols-5 gap-6 text-gray-300">

                {/* Description */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={16} />
                    <span className="font-semibold text-white">
                      Description
                    </span>
                  </div>
                  <p className="text-sm">
                    {item.description || "Not Provided"}
                  </p>
                </div>

                {/* Questions */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Hash size={16} />
                    <span className="font-semibold text-white">
                      Questions
                    </span>
                  </div>
                  <p className="text-sm">
                    {item.questionCount}
                  </p>
                </div>

                {/* Type */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart size={16} />
                    <span className="font-semibold text-white">
                      Type
                    </span>
                  </div>
                  <p className="text-sm">
                    {item.type}
                  </p>
                </div>

                {/* Score */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Star size={16} />
                    <span className="font-semibold text-white">
                      Score
                    </span>
                  </div>

                  <p className="text-lg font-bold text-green-400">
                    {item.score}/100
                  </p>

                </div>

                {/* Date */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={16} />
                    <span className="font-semibold text-white">
                      Date
                    </span>
                  </div>

                  <p className="text-sm">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>

              </div>

            </motion.div>

          ))}

        </div>
      )}
    </div>
  );
}