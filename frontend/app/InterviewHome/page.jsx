'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, LayoutDashboard, Sparkles, CheckCircle, ArrowRight, Brain, TrendingUp, Menu, X, Home } from 'lucide-react';

function InterviewHome() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: Mic,
      title: "Voice-Based Interviews",
      description: "Practice with AI-powered voice interviews that simulate real interview scenarios"
    },
    {
      icon: Brain,
      title: "AI-Generated Questions",
      description: "Get tailored questions based on your job role, experience level, and industry"
    },
    {
      icon: CheckCircle,
      title: "Instant Feedback",
      description: "Receive real-time analysis and suggestions to improve your interview performance"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your improvement over time with detailed analytics and insights"
    }
  ];

  const steps = [
    { number: "01", title: "Create Interview", description: "Set up your interview parameters and preferences" },
    { number: "02", title: "Practice Session", description: "Engage in AI-powered voice interview sessions" },
    { number: "03", title: "Get Feedback", description: "Review detailed feedback and improvement suggestions" },
    { number: "04", title: "Track Progress", description: "Monitor your performance and skill development" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="fixed w-full bg-slate-900/80 backdrop-blur-lg z-50 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/InterviewHome')}>
              <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 rounded-xl blur-sm opacity-50"></div>
                <Mic className="w-5 h-5 text-white relative z-10" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  VoicePrep AI
                </span>
                <span className="text-xs text-gray-400">
                  Interview Assistant
                </span>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-300 hover:text-purple-400 transition font-medium">
                Home
              </a>
              <a href="#features" className="text-gray-300 hover:text-purple-400 transition font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-300 hover:text-purple-400 transition font-medium">
                How It Works
              </a>
              <button 
                onClick={() => router.push('/InterviewDashboard')}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2.5 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105 font-semibold"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-800/95 backdrop-blur-lg">
            <div className="px-4 pt-2 pb-4 space-y-2">
              <a href="/" className="block text-gray-300 hover:text-purple-400 py-2 font-medium">
                Home
              </a>
              <a href="#features" className="block text-gray-300 hover:text-purple-400 py-2 font-medium">
                Features
              </a>
              <a href="#how-it-works" className="block text-gray-300 hover:text-purple-400 py-2 font-medium">
                How It Works
              </a>
              <button 
                onClick={() => router.push('/InterviewDashboard')}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2.5 rounded-full mt-2 font-semibold"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">AI-Powered Interview Preparation</span>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Master Your
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Interview Skills
            </span>
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Practice with AI-generated voice-based interview questions tailored to your job role. 
            Get instant feedback and improve your performance with our intelligent interview assistant.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => router.push('/InterviewDashboard')}
              className="group flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105"
            >
              <LayoutDashboard className="w-5 h-5" />
              Go to Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
              <div className="text-3xl font-bold text-white mb-1">1000+</div>
              <div className="text-sm text-gray-400">Practice Sessions</div>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
              <div className="text-3xl font-bold text-white mb-1">95%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition col-span-2 md:col-span-1">
              <div className="text-3xl font-bold text-white mb-1">500+</div>
              <div className="text-sm text-gray-400">Happy Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Powerful Features for Your Success
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need to ace your next interview
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="bg-gradient-to-r from-purple-600 to-pink-600 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-purple-100">
              Get started in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all">
                  <div className="text-6xl font-bold text-white/20 mb-4">
                    {step.number}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-purple-100">
                    {step.description}
                  </p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-white/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Start Practicing?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of professionals who improved their interview skills with our AI-powered platform
          </p>
          <button
            onClick={() => router.push('/InterviewDashboard')}
            className="group inline-flex items-center gap-3 bg-white text-purple-600 px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
          >
            Start Your First Interview
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  VoicePrep AI
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering your career journey with AI-powered interview preparation and practice.
              </p>
            </div>

            {/* Quick Links */}
            <div className="md:mx-auto">
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/" className="hover:text-purple-400 transition flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Home
                  </a>
                </li>
                <li>
                  <a href="/InterviewDashboard" className="hover:text-purple-400 transition flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-purple-400 transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-purple-400 transition">
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="md:ml-auto">
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-purple-400 transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
          {/* Copyright */}
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2025 VoicePrep AI. All rights reserved. | Made with ❤️ for Interview Success
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default InterviewHome;