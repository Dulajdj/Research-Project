"use client";

import React from "react";

function RecentInterviews({ interviews }) {

  return (

    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">

      <h3 className="text-white text-lg mb-4">
        Recent Interviews
      </h3>

      <div className="space-y-4">

        {interviews.map((item) => (

          <div
            key={item._id}
            className="flex justify-between border-b border-slate-700 pb-3"
          >

            <div>

              <p className="text-white font-semibold">
                {item.title}
              </p>

              <p className="text-gray-400 text-sm">
                {item.candidateName}
              </p>

            </div>

            <div className="text-right">

              <p className="text-green-400">
                {item.score || 0}%
              </p>

              <p className="text-gray-400 text-sm">
                {item.date}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}

export default RecentInterviews;