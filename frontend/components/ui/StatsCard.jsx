"use client";

import React from "react";

function StatsCard({ icon, title, value }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition">

      <div className="flex items-center gap-3 mb-2">
        {icon}
        <p className="text-gray-400 text-sm">{title}</p>
      </div>

      <h2 className="text-3xl font-bold text-white">
        {value}
      </h2>

    </div>
  );
}

export default StatsCard;