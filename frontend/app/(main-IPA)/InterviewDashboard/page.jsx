"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// ── Inline SVG icons (no external deps) ──────────────────────────────────────
const Icon = {
  mic: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="13" rx="3" fill="currentColor"/>
      <path d="M5 10a7 7 0 0014 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  chart: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" opacity=".5"/>
      <rect x="10" y="7" width="4" height="14" rx="1" fill="currentColor" opacity=".75"/>
      <rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor"/>
    </svg>
  ),
  star: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  target: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>
  ),
  briefcase: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="2"/>
      <line x1="12" y1="12" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  plus: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  arrow: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  history: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M3.05 11a9 9 0 1 0 .5-3M3 4v4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  video: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="15" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M17 10l5-3v10l-5-3V10z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),
  lightning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L4.09 12.96A1 1 0 005 14.5h5.5L11 22l9-11.04A1 1 0 0019 9.5h-5.5L13 2z"/>
    </svg>
  ),
};

// ── Animated counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = parseFloat(value) || 0;
    if (target === 0) return;
    let start = 0;
    const step = target / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 30);
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
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
}

// ── Score badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ score }) {
  const color = score >= 80 ? "#4ade80" : score >= 60 ? "#facc15" : "#f87171";
  return (
    <span style={{
      background: `${color}20`,
      color,
      border: `1px solid ${color}40`,
      padding: "2px 10px",
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 700,
      fontFamily: "'DM Mono', monospace"
    }}>
      {score}%
    </span>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [interviews, setInterviews] = useState([]);
  const [mounted, setMounted] = useState(false);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    setMounted(true);
    fetchStats();
    fetchInterviews();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/interview/dashboard/stats");
      const data = await res.json();
      setStats(data);
    } catch {}
  };

  const fetchInterviews = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/scheduled-interview");
      const data = await res.json();
      if (data.success) setInterviews(data.interviews?.slice(0, 4) || []);
    } catch {}
  };

  const statCards = [
    {
      label: "Total Interviews",
      value: stats.totalInterviews || 0,
      suffix: "",
      icon: Icon.chart,
      color: "#60a5fa",
      ring: Math.min((stats.totalInterviews || 0) * 5, 100),
      ringColor: "#60a5fa",
      bg: "rgba(96,165,250,0.08)",
      border: "rgba(96,165,250,0.18)"
    },
    {
      label: "Average Score",
      value: stats.averageScore || 0,
      suffix: "%",
      icon: Icon.target,
      color: "#34d399",
      ring: stats.averageScore || 0,
      ringColor: "#34d399",
      bg: "rgba(52,211,153,0.08)",
      border: "rgba(52,211,153,0.18)"
    },
    {
      label: "Best Score",
      value: stats.bestScore || 0,
      suffix: "%",
      icon: Icon.star,
      color: "#fbbf24",
      ring: stats.bestScore || 0,
      ringColor: "#fbbf24",
      bg: "rgba(251,191,36,0.08)",
      border: "rgba(251,191,36,0.18)"
    },
    {
      label: "Top Role",
      value: null,
      text: stats.mostPracticedRole || "N/A",
      icon: Icon.briefcase,
      color: "#c084fc",
      ring: 70,
      ringColor: "#c084fc",
      bg: "rgba(192,132,252,0.08)",
      border: "rgba(192,132,252,0.18)"
    }
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        .dash-root * { box-sizing: border-box; }

        .dash-root {
          min-height: 100vh;
          background: #0a0a12;
          color: #e2e8f0;
          font-family: 'Outfit', sans-serif;
          padding: 40px 48px;
          position: relative;
          overflow-x: hidden;
        }

        /* Ambient background glows */
        .dash-root::before {
          content: '';
          position: fixed;
          top: -200px; left: -200px;
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .dash-root::after {
          content: '';
          position: fixed;
          bottom: -200px; right: -200px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .dash-content { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; }

        /* Header */
        .dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; }
        .dash-greeting { font-size: 13px; color: #7c3aed; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 6px; }
        .dash-title { font-size: 34px; font-weight: 800; color: #f1f5f9; letter-spacing: -0.03em; line-height: 1.15; }
        .dash-title span { background: linear-gradient(135deg, #a78bfa, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .dash-subtitle { font-size: 14px; color: #64748b; margin-top: 6px; font-weight: 400; }

        .dash-cta {
          display: flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: white; padding: 12px 22px; border-radius: 12px;
          font-weight: 600; font-size: 14px; text-decoration: none;
          border: none; cursor: pointer;
          box-shadow: 0 0 24px rgba(124,58,237,0.35);
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .dash-cta:hover { transform: translateY(-2px); box-shadow: 0 0 36px rgba(124,58,237,0.5); }

        /* Stat cards */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 36px; }
        @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }

        .stat-card {
          border-radius: 20px;
          padding: 24px;
          display: flex; flex-direction: column; gap: 16px;
          position: relative; overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          animation: fadeUp 0.6s ease both;
        }
        .stat-card:hover { transform: translateY(-4px); }
        .stat-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
        }

        .stat-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .stat-icon-wrap {
          width: 42px; height: 42px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .stat-label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
        .stat-value { font-size: 36px; font-weight: 800; letter-spacing: -0.04em; line-height: 1; font-family: 'DM Mono', monospace; }
        .stat-text { font-size: 20px; font-weight: 700; }

        /* Action section */
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .section-title { font-size: 18px; font-weight: 700; color: #f1f5f9; letter-spacing: -0.02em; }
        .see-all { display: flex; align-items: center; gap: 6px; color: #7c3aed; font-size: 13px; font-weight: 600; text-decoration: none; transition: gap 0.2s; }
        .see-all:hover { gap: 10px; }

        .actions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 36px; }

        .action-card {
          border-radius: 20px;
          padding: 28px;
          text-decoration: none;
          display: flex; align-items: center; gap: 20px;
          transition: all 0.25s ease;
          position: relative; overflow: hidden;
          animation: fadeUp 0.6s ease 0.2s both;
        }
        .action-card::after {
          content: '';
          position: absolute; inset: 0;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(255,255,255,0.04), transparent);
          opacity: 0; transition: opacity 0.2s;
        }
        .action-card:hover { transform: translateY(-3px); }
        .action-card:hover::after { opacity: 1; }

        .action-icon-wrap {
          width: 56px; height: 56px; border-radius: 16px; flex-shrink: 0;
          display: flex; align-items: center; justify-center: center; justify-content: center;
        }
        .action-title { font-size: 17px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }
        .action-desc { font-size: 13px; color: #64748b; font-weight: 400; }
        .action-arrow { margin-left: auto; color: #475569; transition: color 0.2s, transform 0.2s; flex-shrink: 0; }
        .action-card:hover .action-arrow { color: #a78bfa; transform: translateX(4px); }

        /* Interview list */
        .interview-list { display: flex; flex-direction: column; gap: 10px; animation: fadeUp 0.6s ease 0.35s both; }

        .interview-row {
          border-radius: 14px;
          padding: 16px 20px;
          display: flex; align-items: center; gap: 16px;
          transition: all 0.2s ease;
          cursor: default;
        }
        .interview-row:hover { background: rgba(255,255,255,0.04) !important; transform: translateX(4px); }

        .interview-avatar {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 800;
        }
        .interview-role { font-size: 15px; font-weight: 600; color: #e2e8f0; }
        .interview-meta { font-size: 12px; color: #64748b; margin-top: 2px; }
        .interview-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }

        /* Empty state */
        .empty-state {
          border-radius: 20px;
          padding: 48px;
          text-align: center;
          border: 1px dashed rgba(124,58,237,0.3);
          animation: fadeUp 0.6s ease 0.4s both;
        }
        .empty-icon { font-size: 40px; margin-bottom: 12px; }
        .empty-title { font-size: 18px; font-weight: 700; color: #e2e8f0; margin-bottom: 6px; }
        .empty-desc { font-size: 14px; color: #64748b; margin-bottom: 24px; }

        /* Divider */
        .divider { height: 1px; background: rgba(255,255,255,0.05); margin: 36px 0; }

        /* Live indicator */
        .live-dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; display: inline-block; animation: pulse-dot 1.5s infinite; margin-right: 6px; }
        @keyframes pulse-dot { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Quick tips banner */
        .tips-banner {
          border-radius: 16px;
          padding: 18px 24px;
          display: flex; align-items: center; gap: 16px;
          margin-bottom: 36px;
          animation: fadeUp 0.6s ease 0.1s both;
        }
        .tips-text { font-size: 14px; color: #c4b5fd; font-weight: 500; }
        .tips-text strong { color: #f1f5f9; font-weight: 700; }
      `}</style>

      <div className="dash-root">
        <div className="dash-content">

          {/* ── HEADER ── */}
          <div className="dash-header">
            <div>
              <div className="dash-greeting">⚡ {greeting}</div>
              <h1 className="dash-title">
                Interview <span>Command Center</span>
              </h1>
              <p className="dash-subtitle">Track, practice, and master your interview performance</p>
            </div>
            <Link href="InterviewDashboard/CreateInterview" className="dash-cta">
              {Icon.plus} New Interview
            </Link>
          </div>

          {/* ── TIPS BANNER ── */}
          <div className="tips-banner" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <span style={{ fontSize: 22 }}>🎯</span>
            <p className="tips-text">
              <strong>Pro tip:</strong> Enable your microphone during interviews for Communication & Confidence scoring. Typed answers only receive Technical scores.
            </p>
            <span className="live-dot" style={{ marginLeft: "auto", flexShrink: 0 }}/>
            <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 600, whiteSpace: "nowrap" }}>AI Active</span>
          </div>

          {/* ── STAT CARDS ── */}
          <div className="stats-grid">
            {statCards.map((card, i) => (
              <div
                key={i}
                className="stat-card"
                style={{
                  background: card.bg,
                  border: `1px solid ${card.border}`,
                  animationDelay: `${i * 0.08}s`,
                  boxShadow: `0 4px 24px ${card.bg}`
                }}
              >
                <div className="stat-top">
                  <div>
                    <div className="stat-label">{card.label}</div>
                    {card.value !== null
                      ? <div className="stat-value" style={{ color: card.color }}>
                          {mounted ? <AnimatedNumber value={card.value} suffix={card.suffix}/> : `${card.value}${card.suffix}`}
                        </div>
                      : <div className="stat-text" style={{ color: card.color }}>{card.text}</div>
                    }
                  </div>
                  <div>
                    <Ring value={card.ring} color={card.ringColor} size={64} stroke={5}/>
                  </div>
                </div>
                <div
                  className="stat-icon-wrap"
                  style={{ background: `${card.color}18`, color: card.color }}
                >
                  {card.icon}
                </div>
              </div>
            ))}
          </div>

          {/* ── QUICK ACTIONS ── */}
          <div className="section-header">
            <h2 className="section-title">Quick Actions</h2>
          </div>

          <div className="actions-grid">
            <Link
              href="InterviewDashboard/CreateInterview"
              className="action-card"
              style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}
            >
              <div className="action-icon-wrap" style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8" }}>
                {Icon.video}
              </div>
              <div>
                <div className="action-title">Create Interview</div>
                <div className="action-desc">Generate AI-powered questions for any role</div>
              </div>
              <div className="action-arrow">{Icon.arrow}</div>
            </Link>

            <Link
              href="InterviewDashboard/History"
              className="action-card"
              style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}
            >
              <div className="action-icon-wrap" style={{ background: "rgba(168,85,247,0.2)", color: "#c084fc" }}>
                {Icon.history}
              </div>
              <div>
                <div className="action-title">Interview History</div>
                <div className="action-desc">Review past sessions and feedback</div>
              </div>
              <div className="action-arrow">{Icon.arrow}</div>
            </Link>
          </div>

          <div className="divider"/>

          {/* ── SCHEDULED INTERVIEWS ── */}
          <div className="section-header">
            <h2 className="section-title">
              Upcoming Interviews
              {interviews.length > 0 && (
                <span style={{
                  marginLeft: 10, fontSize: 12, background: "rgba(124,58,237,0.2)",
                  color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)",
                  padding: "2px 10px", borderRadius: 999, fontWeight: 600,
                  verticalAlign: "middle"
                }}>
                  {interviews.length}
                </span>
              )}
            </h2>
            <Link href="InterviewDashboard/History" className="see-all">
              See all {Icon.arrow}
            </Link>
          </div>

          {interviews.length > 0 ? (
            <div className="interview-list">
              {interviews.map((iv, i) => {
                const colors = ["#60a5fa","#34d399","#fbbf24","#c084fc"];
                const bgs = ["rgba(96,165,250,0.12)","rgba(52,211,153,0.12)","rgba(251,191,36,0.12)","rgba(192,132,252,0.12)"];
                const initials = (iv.title || iv.candidateName || "?").slice(0, 2).toUpperCase();
                return (
                  <div
                    key={iv._id}
                    className="interview-row"
                    style={{
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      animationDelay: `${0.4 + i * 0.07}s`
                    }}
                  >
                    <div className="interview-avatar" style={{ background: bgs[i % 4], color: colors[i % 4] }}>
                      {initials}
                    </div>
                    <div>
                      <div className="interview-role">{iv.title || "Interview"}</div>
                      <div className="interview-meta">
                        {iv.candidateName && <span>{iv.candidateName} · </span>}
                        {iv.date || "Scheduled"}
                      </div>
                    </div>
                    <div className="interview-right">
                      {iv.score != null && <ScoreBadge score={iv.score}/>}
                      <Link
                        href={`InterviewDashboard/ScheduledInterview?id=${iv._id}`}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center",
                          width: 32, height: 32, borderRadius: 8,
                          background: "rgba(124,58,237,0.15)", color: "#a78bfa",
                          textDecoration: "none", transition: "all 0.2s"
                        }}
                      >
                        {Icon.arrow}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" style={{ background: "rgba(255,255,255,0.015)" }}>
              <div className="empty-icon">🎙️</div>
              <div className="empty-title">No upcoming interviews</div>
              <div className="empty-desc">Create your first AI interview session to get started</div>
              <Link href="InterviewDashboard/CreateInterview" className="dash-cta" style={{ display: "inline-flex" }}>
                {Icon.plus} Create Interview
              </Link>
            </div>
          )}

        </div>
      </div>
    </>
  );
}