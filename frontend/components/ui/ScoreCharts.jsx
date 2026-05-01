"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function ScoreChart({ data }) {

  return (

    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">

      <h3 className="text-white text-lg mb-4">
        Interview Score Progress
      </h3>

      <ResponsiveContainer width="100%" height={250}>

        <LineChart data={data}>

          <XAxis dataKey="name" stroke="#aaa" />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="score"
            stroke="#8b5cf6"
            strokeWidth={3}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  );

}

export default ScoreChart;