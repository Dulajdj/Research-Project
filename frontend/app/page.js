'use client';

import React, { useState } from 'react';
import { Menu, X, Brain, FileText, MessageSquare, TrendingUp, Briefcase, ChevronRight, Star, Users, Target, Zap, LogIn, UserPlus } from 'lucide-react';

function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const components = [
    {
      id: 1,
      title: "Resume & Career Personalization",
      description: "AI-powered CV builder with real-time job suggestions and GitHub project analysis",
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
      link: "/resume-builder",
      features: ["Smart CV Generator", "Cover Letter Creation", "Job Matching", "GitHub Integration"]
    },
    {
      id: 2,
      title: "AI Applicant Filter",
      description: "Voice-based interview practice with instant feedback and skill assessment",
      icon: MessageSquare,
      color: "from-purple-500 to-pink-500",
      link: "/interview-practice",
      features: ["Real-time Feedback", "Skill Quiz", "Unbiased Assessment"]
    },
    {
      id: 3,
      title: "Career & Learning Guidance",
      description: "Smart career path recommendations with personalized skill development plans",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      link: "/career-guidance",
      features: ["Skill Gap Analysis", "Career Paths", "Course Recommendations", "Market Trends"]
    },
    {
      id: 4,
      title: "Interview Preparation Assistant",
      description: "AI-generated voice-based interview questions tailored to your job role and experience",
      icon: Briefcase,
      color: "from-orange-500 to-red-500",
      link: "/InterviewHome",
      features: ["Voice Interview", "HR & Technical Q&A", "Custom Questions", "Mock Interviews"]
    }
  ];

  const stats = [
    { icon: Users, value: "1000+", label: "Active Users" },
    { icon: Briefcase, value: "500+", label: "Job Matches" },
    { icon: Star, value: "95%", label: "Success Rate" },
    { icon: Target, value: "24/7", label: "AI Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="fixed w-full bg-slate-900/80 backdrop-blur-lg z-50 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-purple-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Career Guide
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-300 hover:text-purple-400 transition">Home</a>
              <a href="#features" className="text-gray-300 hover:text-purple-400 transition">Features</a>
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
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </button>
              </div>
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
              <a href="/" className="block text-gray-300 hover:text-purple-400 py-2">Home</a>
              <a href="#features" className="block text-gray-300 hover:text-purple-400 py-2">Features</a>
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

      {/* Hero Section */}
      <div id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-purple-300">AI-Powered Career Solutions</span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Transform Your Career Journey
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              with AI Intelligence
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Empowering Sri Lankan job seekers and employers with cutting-edge AI technology. 
            Build perfect resumes, practice interviews, discover career paths, and land your dream job.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <button 
              onClick={() => window.location.href = '/auth/signup'}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105"
            >
              Start Your Journey
            </button>
            <button className="bg-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-full text-lg font-semibold border border-white/20 hover:bg-white/20 transition">
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
                <stat.icon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Powerful AI-Driven Features
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need to succeed in your career journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {components.map((component) => (
              <div
                key={component.id}
                className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer"
                onClick={() => window.location.href = component.link}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${component.color} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform`}>
                  <component.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition">
                  {component.title}
                </h3>
                
                <p className="text-gray-400 mb-6">
                  {component.description}
                </p>

                <div className="space-y-2 mb-6">
                  {component.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className={`w-1.5 h-1.5 bg-gradient-to-r ${component.color} rounded-full`}></div>
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center text-purple-400 font-semibold group-hover:translate-x-2 transition-transform">
                  Explore Now
                  <ChevronRight className="w-5 h-5 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of Sri Lankan professionals using AI to advance their careers
          </p>
          <button 
            onClick={() => window.location.href = '/auth/signup'}
            className="bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:scale-105 transition transform"
          >
            Get Started Free
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="w-6 h-6 text-purple-400" />
                <span className="text-lg font-bold text-white">AI Career Guide</span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering careers with AI technology tailored for the Sri Lankan job market.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/resume-builder" className="hover:text-purple-400 transition">Resume Builder</a></li>
                <li><a href="/interview-practice" className="hover:text-purple-400 transition">Interview Practice</a></li>
                <li><a href="/career-guidance" className="hover:text-purple-400 transition">Career Guidance</a></li>
                <li><a href="/InterviewDashboard" className="hover:text-purple-400 transition">Job Matching</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">

                <li><a href="/about" className="hover:text-purple-400 transition">About Us</a></li>
                <li><a href="/contact" className="hover:text-purple-400 transition">Contact</a></li>
                <li><a href="/privacy-policy" className="hover:text-purple-400 transition">Privacy Policy</a></li>

                <li><a href="#" className="hover:text-purple-400 transition">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-purple-400 transition">LinkedIn</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Facebook</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Twitter</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Instagram</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 AI Career Guidance System. All rights reserved. Made for Sri Lankan Job Market.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;