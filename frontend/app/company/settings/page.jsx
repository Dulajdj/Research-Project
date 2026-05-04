'use client';

import React, { useState } from 'react';
import CompanySidebar from '@/app/components/ui/CompanySidebar'; 
import { 
  Building2, Lock, Bell, Save, Globe, 
  Mail, MapPin, AlignLeft, ShieldCheck, Briefcase // <-- Briefcase eka mama udatama damma!
} from 'lucide-react';

export default function CompanySettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    companyName: 'Tech Solutions Inc.',
    website: 'https://techsolutions.com',
    industry: 'Software Development',
    location: 'Colombo, Sri Lanka',
    description: 'We are a leading software development company specializing in AI and Web3 technologies.',
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notifications State
  const [notifications, setNotifications] = useState({
    newApplications: true,
    weeklyReports: false,
    marketingEmails: false,
  });

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleToggleNotification = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex">
      {/* Sidebar */}
      <CompanySidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 h-screen overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Company Settings
            </h1>
            <p className="text-gray-400 mt-2">Manage your company profile, security, and preferences.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Side: Tabs Navigation */}
            <div className="w-full lg:w-64 space-y-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all ${activeTab === 'profile' ? 'bg-purple-600 shadow-lg shadow-purple-500/20 text-white font-semibold' : 'bg-slate-800/40 text-gray-400 hover:bg-slate-800 hover:text-white border border-white/5'}`}
              >
                <Building2 className="w-5 h-5" /> Company Profile
              </button>
              
              <button 
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all ${activeTab === 'security' ? 'bg-purple-600 shadow-lg shadow-purple-500/20 text-white font-semibold' : 'bg-slate-800/40 text-gray-400 hover:bg-slate-800 hover:text-white border border-white/5'}`}
              >
                <ShieldCheck className="w-5 h-5" /> Security
              </button>

              <button 
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all ${activeTab === 'notifications' ? 'bg-purple-600 shadow-lg shadow-purple-500/20 text-white font-semibold' : 'bg-slate-800/40 text-gray-400 hover:bg-slate-800 hover:text-white border border-white/5'}`}
              >
                <Bell className="w-5 h-5" /> Notifications
              </button>
            </div>

            {/* Right Side: Tab Content */}
            <div className="flex-1 bg-slate-800/40 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl">
              
              {/* --- PROFILE TAB --- */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveChanges} className="animate-in fade-in duration-300">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-400"/> Profile Information
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium">Company Name</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input type="text" name="companyName" value={profileData.companyName} onChange={handleProfileChange} className="w-full pl-10 p-3 bg-slate-900/50 border border-white/10 rounded-xl outline-none focus:border-purple-500 transition" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium">Website URL</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input type="url" name="website" value={profileData.website} onChange={handleProfileChange} className="w-full pl-10 p-3 bg-slate-900/50 border border-white/10 rounded-xl outline-none focus:border-purple-500 transition" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium">Industry</label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input type="text" name="industry" value={profileData.industry} onChange={handleProfileChange} className="w-full pl-10 p-3 bg-slate-900/50 border border-white/10 rounded-xl outline-none focus:border-purple-500 transition" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium">Headquarters Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input type="text" name="location" value={profileData.location} onChange={handleProfileChange} className="w-full pl-10 p-3 bg-slate-900/50 border border-white/10 rounded-xl outline-none focus:border-purple-500 transition" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 font-medium">Company Description</label>
                      <div className="relative">
                        <AlignLeft className="absolute left-3 top-4 w-4 h-4 text-gray-500" />
                        <textarea name="description" value={profileData.description} onChange={handleProfileChange} rows="4" className="w-full pl-10 p-3 bg-slate-900/50 border border-white/10 rounded-xl outline-none focus:border-purple-500 transition"></textarea>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-end">
                      <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition disabled:opacity-50">
                        <Save className="w-4 h-4"/> {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* --- SECURITY TAB --- */}
              {activeTab === 'security' && (
                <form onSubmit={handleSaveChanges} className="animate-in fade-in duration-300">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-400"/> Change Password
                  </h2>
                  
                  <div className="space-y-6 max-w-md">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 font-medium">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="••••••••" className="w-full pl-10 p-3 bg-slate-900/50 border border-white/10 rounded-xl outline-none focus:border-purple-500 transition" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 font-medium">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="••••••••" className="w-full pl-10 p-3 bg-slate-900/50 border border-white/10 rounded-xl outline-none focus:border-purple-500 transition" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 font-medium">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="••••••••" className="w-full pl-10 p-3 bg-slate-900/50 border border-white/10 rounded-xl outline-none focus:border-purple-500 transition" />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-end">
                      <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition disabled:opacity-50">
                        <Lock className="w-4 h-4"/> {isSaving ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* --- NOTIFICATIONS TAB --- */}
              {activeTab === 'notifications' && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-purple-400"/> Email Notifications
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-white/5 rounded-2xl">
                      <div>
                        <p className="font-semibold text-white">New Job Applications</p>
                        <p className="text-sm text-gray-400">Receive an email when a candidate applies to your job.</p>
                      </div>
                      <button 
                        onClick={() => handleToggleNotification('newApplications')}
                        className={`w-12 h-6 rounded-full transition-colors relative ${notifications.newApplications ? 'bg-purple-500' : 'bg-slate-700'}`}
                      >
                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications.newApplications ? 'translate-x-6' : 'translate-x-0'}`}></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-white/5 rounded-2xl">
                      <div>
                        <p className="font-semibold text-white">Weekly Performance Reports</p>
                        <p className="text-sm text-gray-400">Get a weekly summary of job views and applicant stats.</p>
                      </div>
                      <button 
                        onClick={() => handleToggleNotification('weeklyReports')}
                        className={`w-12 h-6 rounded-full transition-colors relative ${notifications.weeklyReports ? 'bg-purple-500' : 'bg-slate-700'}`}
                      >
                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications.weeklyReports ? 'translate-x-6' : 'translate-x-0'}`}></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-white/5 rounded-2xl">
                      <div>
                        <p className="font-semibold text-white">Marketing & Product Updates</p>
                        <p className="text-sm text-gray-400">Receive news about new features from AI Career Guide.</p>
                      </div>
                      <button 
                        onClick={() => handleToggleNotification('marketingEmails')}
                        className={`w-12 h-6 rounded-full transition-colors relative ${notifications.marketingEmails ? 'bg-purple-500' : 'bg-slate-700'}`}
                      >
                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications.marketingEmails ? 'translate-x-6' : 'translate-x-0'}`}></span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}