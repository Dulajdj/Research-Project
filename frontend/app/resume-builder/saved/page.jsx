'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Edit, FileText, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// default to the local backend server if no env var provided
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function SavedResumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const url = `${API_BASE}/api/resume?t=${Date.now()}`;
      console.log('fetchResumes url:', url, 'API_BASE:', API_BASE);
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();

      const safeResumes = (Array.isArray(data) ? data : []).map(item => ({
        _id: item._id || '',
        createdAt: item.createdAt || new Date().toISOString(),
        selectedTemplate: item.selectedTemplate || 'modern',
        formData: {
          personalInfo: {
            fullName: item.personalInfo?.fullName || '',
            email: item.personalInfo?.email || '',
            phone: item.personalInfo?.phone || '',
            address: item.personalInfo?.address || '',
            linkedin: item.personalInfo?.linkedin || '',
            github: item.personalInfo?.github || '',
            website: item.personalInfo?.website || ''
          },
          summary: item.summary || '',
          skills: item.skills || '',
          experience: Array.isArray(item.experience) ? item.experience : [],
          education: Array.isArray(item.education) ? item.education : [],
          projects: Array.isArray(item.projects) ? item.projects : []
        }
      }));

      setResumes(safeResumes);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load resumes');
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (id) => {
    if (!confirm('Are you sure you want to delete this resume permanently?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/resume?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setResumes(prev => prev.filter(r => r._id !== id));
        toast.success('Resume deleted successfully!');
      } else {
        toast.error('Failed to delete');
      }
    } catch (err) {
      toast.error('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
        <span className="ml-5 text-white text-xl">Loading your resumes...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Toaster position="top-center" />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-5xl font-bold text-center text-white mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
           Saved Resumes
        </h1>

        {/* ⭐ BACK BUTTON HERE */}
        <div className="flex justify-center mb-12">
          <Link
            href="/resume-builder"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-2xl hover:bg-white/20 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Resume Builder
          </Link>
        </div>

        {resumes.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-32 h-32 mx-auto mb-8 text-gray-700" />
            <p className="text-3xl text-gray-400 mb-10">No resumes saved yet</p>
            <Link
              href="/resume-builder/create"
              className="inline-block px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-3xl hover:shadow-2xl transition transform hover:scale-105"
            >
              Create Your First Resume
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {resumes.map((resume) => {
              const name = resume.formData?.personalInfo?.fullName?.trim();
              const email = resume.formData?.personalInfo?.email;
              const phone = resume.formData?.personalInfo?.phone;

              return (
                <div
                  key={resume._id}
                  className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 hover:border-purple-500/60 transition-all duration-500 group shadow-2xl hover:shadow-purple-500/20"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-white mb-2">
                        {name || 'Untitled Resume'}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Saved on{' '}
                        {new Date(resume.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Link
                        href={`/resume-builder/edit/${resume._id}`}
                        className="p-3 bg-purple-600/30 backdrop-blur rounded-2xl hover:bg-purple-600/50 transition"
                      >
                        <Edit className="w-6 h-6 text-purple-300" />
                      </Link>
                      <button
                        onClick={() => deleteResume(resume._id)}
                        disabled={deletingId === resume._id}
                        className="p-3 bg-red-600/30 backdrop-blur rounded-2xl hover:bg-red-600/50 transition disabled:opacity-50"
                      >
                        {deletingId === resume._id ? (
                          <Loader2 className="w-6 h-6 animate-spin text-red-400" />
                        ) : (
                          <Trash2 className="w-6 h-6 text-red-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 text-gray-300 text-base mb-8">
                    {email && <p>Email: {email}</p>}
                    {phone && <p>Phone: {phone}</p>}
                    <p>
                      Template:{' '}
                      <span className="text-purple-400 font-semibold capitalize">
                        {resume.selectedTemplate}
                      </span>
                    </p>
                  </div>

                  <Link
                    href={`/resume-builder/edit/${resume._id}`}
                    className="block text-center py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-3xl hover:shadow-2xl transition transform hover:scale-105"
                  >
                    Open Resume
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}