'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Edit, FileText, Loader2, BarChart3, Target } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// ── Animated counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = parseFloat(value) || 0;
    if (target === 0) {
      setDisplay(0);
      return;
    }

    let start = 0;
    const step = Math.max(1, target / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setDisplay(target);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 25);

    return () => clearInterval(timer);
  }, [value]);

  return <>{display}{suffix}</>;
}

// ── Radial progress ring ──────────────────────────────────────────────────────
function Ring({ value = 0, color = "#a78bfa", size = 72, stroke = 6 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
}

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

  const computeCompletion = (resume) => {
    const fields = [
      resume.formData?.personalInfo?.fullName,
      resume.formData?.personalInfo?.email,
      resume.formData?.personalInfo?.phone,
      resume.formData?.summary,
      resume.formData?.skills,
      resume.formData?.experience?.length > 0,
      resume.formData?.education?.length > 0,
      resume.formData?.projects?.length > 0
    ];

    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const totalResumes = resumes.length;

  const averageCompletion =
    totalResumes === 0
      ? 0
      : Math.round(
          resumes.reduce((acc, resume) => acc + computeCompletion(resume), 0) /
            totalResumes
        );

  const lastUpdated = resumes
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  const MAX_COUNT_FOR_RING = 20;
  const countProgress = Math.min(100, Math.round((totalResumes / MAX_COUNT_FOR_RING) * 100));

  const DashboardStatCard = ({
    title,
    value,
    suffix = "",
    icon: Icon,
    accentClass,
    ringColor,
    progress
  }) => {
    const displayValue = value ?? 'N/A';
    const percent = typeof progress === 'number' ? Math.min(Math.max(progress, 0), 100) : 0;

    return (
      <div className="relative bg-slate-900/40 border border-white/10 rounded-3xl p-7 shadow-2xl shadow-black/30 backdrop-blur-xl hover:border-purple-500/60 transition">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-gray-400">{title}</p>
            <p className="mt-2 text-4xl font-bold text-white leading-tight">
              {typeof value === 'number' ? (
                <AnimatedNumber value={value} suffix={suffix} />
              ) : (
                displayValue
              )}
            </p>
          </div>

          <div className="relative w-16 h-16">
            <Ring value={percent} color={ringColor || '#a78bfa'} size={64} stroke={6} />
            <div className={`absolute inset-0 flex items-center justify-center rounded-full ${accentClass} bg-opacity-25`}> 
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-400">{percent}%</p>
      </div>
    );
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
        <h1 className="text-5xl font-bold text-center text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Saved Resumes
        </h1>
        {lastUpdated && (
          <p className="text-center text-sm text-gray-300 mb-8">
            Last updated: {new Date(lastUpdated.createdAt).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 mb-10">
          <DashboardStatCard
            title="Total Resumes"
            value={totalResumes}
            icon={BarChart3}
            accentClass="bg-gradient-to-br from-purple-500 to-indigo-500"
            ringColor="#8b5cf6"
            progress={countProgress}
          />

          <DashboardStatCard
            title="Avg. Completion"
            value={averageCompletion}
            suffix="%"
            icon={Target}
            accentClass="bg-gradient-to-br from-emerald-500 to-teal-500"
            ringColor="#34d399"
            progress={averageCompletion}
          />
        </div>

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