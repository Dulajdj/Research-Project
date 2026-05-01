import React from 'react';
import { Brain } from 'lucide-react';

export default function Footer() {
  return (
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
              <li><a href="/resume-builder" className="hover:text-purple-400">Resume Builder</a></li>
              <li><a href="/interview-practice" className="hover:text-purple-400">Interview Practice</a></li>
              <li><a href="/career-guidance" className="hover:text-purple-400">Career Guidance</a></li>
              <li><a href="/InterviewDashboard" className="hover:text-purple-400">Job Matching</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/about" className="hover:text-purple-400">About Us</a></li>
              <li><a href="/contact" className="hover:text-purple-400">Contact</a></li>
              <li><a href="/privacy-policy" className="hover:text-purple-400">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-purple-400">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-purple-400">LinkedIn</a></li>
              <li><a href="#" className="hover:text-purple-400">Facebook</a></li>
              <li><a href="#" className="hover:text-purple-400">Twitter</a></li>
              <li><a href="#" className="hover:text-purple-400">Instagram</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-400">
          © 2025 AI Career Guidance System. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
