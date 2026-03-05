'use client';

import React, { useState } from 'react';
import { Menu, X, Brain, LogIn, UserPlus } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-slate-900/80 backdrop-blur-lg z-50 border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Career Guide
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-300 hover:text-purple-400 transition">Home</a>
            <a href="/#features" className="text-gray-300 hover:text-purple-400 transition">Features</a>
            <a href="/about" className="text-gray-300 hover:text-purple-400 transition">About</a>

            <div className="flex items-center space-x-3">
              <button 
                onClick={() => window.location.href = '/auth/login'}
                className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>
              <button 
                onClick={() => window.location.href = '/auth/signup'}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </button>
            </div>
          </div>

          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-slate-800/95 backdrop-blur-lg">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <a href="/" className="block text-gray-300 hover:text-purple-400 py-2">Home</a>
            <a href="/#features" className="block text-gray-300 hover:text-purple-400 py-2">Features</a>
            <a href="/about" className="block text-gray-300 hover:text-purple-400 py-2">About</a>

            <button 
              onClick={() => window.location.href = '/auth/login'}
              className="w-full flex items-center justify-center space-x-2 text-gray-300 hover:text-purple-400 py-2 border border-gray-600 rounded-full mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>

            <button 
              onClick={() => window.location.href = '/auth/signup'}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
