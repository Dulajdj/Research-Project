'use client';

import React, { useEffect, useState, useMemo } from 'react';
import CompanySidebar from '@/app/components/ui/CompanySidebar'; // Path eka oyaage widihata wenas karaganna (@/components... unath hari)
import { 
  Search, Users, FileText, CheckCircle, XCircle, 
  Clock, Eye, Download, Calendar, Mail, Phone, Briefcase
} from 'lucide-react';

export default function CompanyApplicantsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal State
  const [selectedApp, setSelectedApp] = useState(null);

  // 1. Fetch Applications from Database
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // API Endpoint eka oyaage backend route ekata wenas karanna
        const res = await fetch('http://localhost:5000/api/applications');
        const data = await res.json();
        if (data.success) {
          setApplications(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // 2. Filter Logic (Search & Status)
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = 
        app.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  // 3. Handle Status Update
  const updateStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        // Update local state immediately for better UX
        setApplications(prev => prev.map(app => 
          app._id === appId ? { ...app, status: newStatus } : app
        ));
        if (selectedApp) setSelectedApp({ ...selectedApp, status: newStatus });
        alert(`Status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  // Helper for Status Colors
  const getStatusStyle = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Reviewed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Shortlisted': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex">
      {/* Sidebar */}
      <CompanySidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Applicant Tracker
            </h1>
            <p className="text-gray-400 mt-2">Manage and review incoming job applications.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 border border-white/10 p-6 rounded-2xl flex items-center gap-4">
              <div className="bg-purple-500/20 p-3 rounded-xl"><Users className="w-6 h-6 text-purple-400"/></div>
              <div><p className="text-gray-400 text-sm">Total Applications</p><p className="text-2xl font-bold">{applications.length}</p></div>
            </div>
            <div className="bg-slate-800/50 border border-white/10 p-6 rounded-2xl flex items-center gap-4">
              <div className="bg-yellow-500/20 p-3 rounded-xl"><Clock className="w-6 h-6 text-yellow-400"/></div>
              <div><p className="text-gray-400 text-sm">Pending Review</p><p className="text-2xl font-bold">{applications.filter(a => a.status === 'Pending').length}</p></div>
            </div>
            <div className="bg-slate-800/50 border border-white/10 p-6 rounded-2xl flex items-center gap-4">
              <div className="bg-green-500/20 p-3 rounded-xl"><CheckCircle className="w-6 h-6 text-green-400"/></div>
              <div><p className="text-gray-400 text-sm">Shortlisted</p><p className="text-2xl font-bold">{applications.filter(a => a.status === 'Shortlisted').length}</p></div>
            </div>
          </div>

          {/* Filters Area */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-800/40 p-4 rounded-2xl border border-white/10">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Search applicants, jobs, emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm transition"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-auto px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl outline-none text-sm focus:ring-2 focus:ring-purple-500 text-gray-300"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-slate-800/40 rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-slate-900/60 text-gray-400 font-medium">
                  <tr>
                    <th className="px-6 py-4">Applicant Info</th>
                    <th className="px-6 py-4">Applied Job</th>
                    <th className="px-6 py-4">Date Applied</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan="5" className="text-center py-10 text-purple-400 animate-pulse">Loading Applications...</td></tr>
                  ) : filteredApps.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-10 text-gray-500">No applications found.</td></tr>
                  ) : (
                    filteredApps.map((app) => (
                      <tr key={app._id} className="hover:bg-white/5 transition duration-200">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white text-base">{app.applicantName}</div>
                          <div className="text-gray-400 text-xs mt-1">{app.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-purple-300">{app.jobTitle}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                          {new Date(app.appliedDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(app.status || 'Pending')}`}>
                            {app.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setSelectedApp(app)}
                            className="p-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {app.resumeUrl && (
                            <a 
                              href={app.resumeUrl} 
                              target="_blank" rel="noreferrer"
                              className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition"
                              title="Download Resume"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* --- APPLICANT DETAILS MODAL --- */}
      {selectedApp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedApp(null)}>
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-white/10 p-6 flex justify-between items-start z-10">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedApp.applicantName}</h2>
                <p className="text-purple-400 text-sm mt-1 flex items-center gap-2">
                  <Briefcase className="w-4 h-4"/> Applied for: {selectedApp.jobTitle}
                </p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-800/50 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Mail className="w-4 h-4 text-gray-500"/> {selectedApp.email}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Phone className="w-4 h-4 text-gray-500"/> {selectedApp.phone || 'N/A'}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Calendar className="w-4 h-4 text-gray-500"/> {new Date(selectedApp.appliedDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-gray-500"/> Status: 
                  <span className={`px-2 py-0.5 rounded text-xs border ${getStatusStyle(selectedApp.status || 'Pending')}`}>
                    {selectedApp.status || 'Pending'}
                  </span>
                </div>
              </div>

              {/* Cover Letter / Message */}
              {selectedApp.coverLetter && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Cover Letter</h3>
                  <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5 text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedApp.coverLetter}
                  </div>
                </div>
              )}

              {/* Resume Download Button */}
              {selectedApp.resumeUrl && (
                <div className="pt-2">
                  <a 
                    href={selectedApp.resumeUrl} 
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium shadow-lg transition"
                  >
                    <FileText className="w-5 h-5"/> Open Resume PDF
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer - Status Actions */}
            <div className="sticky bottom-0 bg-slate-900 border-t border-white/10 p-6 flex flex-wrap gap-3 z-10">
              <span className="w-full text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Change Application Status</span>
              
              <button onClick={() => updateStatus(selectedApp._id, 'Reviewed')} className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition">
                Mark as Reviewed
              </button>
              <button onClick={() => updateStatus(selectedApp._id, 'Shortlisted')} className="px-4 py-2 text-sm font-medium rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 transition">
                Shortlist Candidate
              </button>
              <button onClick={() => updateStatus(selectedApp._id, 'Rejected')} className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition">
                Reject
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}