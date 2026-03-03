'use client';

import React, { useState } from 'react';
import { Menu, X, Brain, LogIn, UserPlus, Target, Lightbulb, Users, TrendingUp, Award, Sparkles, Heart, Zap, CheckCircle, Globe, Shield, Rocket } from 'lucide-react';

function AboutUs() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const teamMembers = [
    {
      name: "Research Team",
      role: "AI & ML Specialists",
      description: "Developing cutting-edge AI algorithms for career guidance",
      icon: Brain
    },
    {
      name: "Development Team",
      role: "Software Developers",
      description: "Building robust and scalable platform infrastructure",
      icon: Rocket
    },
    {
      name: "Career Experts",
      role: "Industry Professionals",
      description: "Providing insights into Sri Lankan job market trends",
      icon: Target
    },
    {
      name: "Support Team",
      role: "User Success",
      description: "Ensuring the best experience for every user",
      icon: Heart
    }
  ];

  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Leveraging cutting-edge AI technology to revolutionize career development"
    },
    {
      icon: Shield,
      title: "Trust & Privacy",
      description: "Protecting user data with enterprise-grade security and ethical AI practices"
    },
    {
      icon: Users,
      title: "Inclusivity",
      description: "Making career opportunities accessible to all Sri Lankan professionals"
    },
    {
      icon: TrendingUp,
      title: "Excellence",
      description: "Delivering high-quality, accurate, and personalized career guidance"
    }
  ];

  const milestones = [
    { year: "2025", title: "Project Initiated", description: "Research began on AI-powered career solutions" },
    { year: "2025", title: "Platform Development", description: "Built comprehensive career guidance system" },
    { year: "2025", title: "Beta Launch", description: "Released to Sri Lankan job market" },
    { year: "2025", title: "Growing Impact", description: "Helping thousands achieve career goals" }
  ];

  const features = [
    { icon: CheckCircle, text: "AI-Powered Resume Building" },
    { icon: CheckCircle, text: "Voice-Based Interview Practice" },
    { icon: CheckCircle, text: "Personalized Career Pathways" },
    { icon: CheckCircle, text: "Real-Time Job Matching" },
    { icon: CheckCircle, text: "Skill Gap Analysis" },
    { icon: CheckCircle, text: "GitHub Project Integration" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="fixed w-full bg-slate-900/80 backdrop-blur-lg z-50 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.href = '/'}>
              <Brain className="w-8 h-8 text-purple-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Career Guide
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-300 hover:text-purple-400 transition">Home</a>
              <a href="/" className="text-gray-300 hover:text-purple-400 transition">Features</a>
              <a href="/about" className="text-purple-400 font-semibold">About</a>
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
              <a href="/#features" className="block text-gray-300 hover:text-purple-400 py-2">Features</a>
              <a href="/about" className="block text-purple-400 font-semibold py-2">About</a>
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
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-purple-300">About Our Mission</span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Empowering Sri Lankan
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Career Success Stories
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            We're on a mission to transform the career landscape in Sri Lanka by combining artificial intelligence 
            with deep understanding of local job market dynamics.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Our Mission
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                The AI Career Guidance System is a research project developed to bridge the gap between 
                job seekers and employers in Sri Lanka's rapidly evolving digital economy. Our platform 
                leverages advanced artificial intelligence, natural language processing, and machine learning 
                to provide personalized career solutions.
              </p>
              <p className="text-gray-300 text-lg mb-6">
                We believe that every individual deserves access to quality career guidance, regardless 
                of their background. By analyzing real-time job market data and individual skills, we help 
                users make informed decisions about their professional journey.
              </p>
              <div className="flex items-center space-x-2 text-purple-400">
                <Globe className="w-5 h-5" />
                <span className="font-semibold">Tailored for Sri Lankan Job Market</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition">
                  <feature.icon className="w-6 h-6 text-green-400 mb-2" />
                  <p className="text-sm text-gray-300">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-400">
              The principles that guide our work and innovation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Journey Timeline */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-400">
              Building the future of career guidance in Sri Lanka
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6 hover:border-purple-400/50 transition">
                  <div className="text-3xl font-bold text-purple-400 mb-2">{milestone.year}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{milestone.title}</h3>
                  <p className="text-gray-400 text-sm">{milestone.description}</p>
                </div>
                {index < milestones.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 right-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-transparent transform translate-x-full -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-400">
              Dedicated professionals working to transform career guidance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <member.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                <div className="text-purple-400 font-semibold mb-3">{member.role}</div>
                <p className="text-gray-400 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Powered by Advanced Technology
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Our platform is built using cutting-edge technologies including Next.js, React, 
            Tailwind CSS, and Supabase, integrated with sophisticated AI and machine learning algorithms.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[ 'AI/ML', 'Natural Language Processing', 'Voice Recognition', 'Data Analytics'].map((tech, index) => (
              <div key={index} className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full px-6 py-3">
                <span className="text-white font-semibold">{tech}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Join Our Mission
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Be part of the revolution in Sri Lankan career development
          </p>
          <button 
            onClick={() => window.location.href = '/auth/signup'}
            className="bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:scale-105 transition transform"
          >
            Get Started Today
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
                <li><a href="#" className="hover:text-purple-400 transition">Contact</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Privacy Policy</a></li>
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

export default AboutUs;