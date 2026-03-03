"use client"
import React from 'react'

function WelcomeContainer() {
  return (
    <div className="w-full bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl hover:bg-slate-800/60 hover:border-purple-500/20 transition-all duration-300">
      <div>
        <h2 className="text-xl font-bold text-gray-100 mb-1">Welcome Back 👋</h2>
        <h2 className="text-gray-400">AI-Driven Interviews, Hassle-Free Hiring</h2>
      </div>
    </div>
  )
}

export default WelcomeContainer