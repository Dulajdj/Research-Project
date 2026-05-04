'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, FileText, PenTool, CheckCircle, Brain, Sparkles,
  Save, TrendingUp, BarChart2, Activity, Zap, RefreshCw,
  Clock, Award, Target
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/* ─── Animated Number ─────────────────────────────────────────────────────── */
function AnimatedNumber({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = parseFloat(value) || 0;
    if (target === 0) { setDisplay(0); return; }
    let start = 0;
    const step = Math.max(1, target / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}{suffix}</>;
}

/* ─── 3D Bar Chart (SVG-based pseudo-3D) ─────────────────────────────────── */
function ThreeDBarChart({ data, title }) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barW = 44;
  const depthX = 14;
  const depthY = 9;
  const chartH = 160;
  const gap = 18;
  const totalW = data.length * (barW + gap) + depthX + 20;

  return (
    <div style={{ width: '100%' }}>
      <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.35)', fontWeight: 700, marginBottom: 16 }}>{title}</p>
      <svg viewBox={`0 0 ${totalW} ${chartH + depthY + 30}`} style={{ width: '100%', overflow: 'visible' }}>
        {data.map((d, i) => {
          const barH = Math.max(4, (d.value / maxVal) * chartH);
          const x = i * (barW + gap) + 10;
          const y = chartH - barH + depthY;

          // 3D colors
          const front = d.color || '#7c3aed';
          const top = d.topColor || '#a78bfa';
          const side = d.sideColor || '#5b21b6';

          return (
            <g key={i} style={{ cursor: 'pointer' }}>
              {/* side face */}
              <polygon
                points={`
                  ${x + barW},${y}
                  ${x + barW + depthX},${y - depthY}
                  ${x + barW + depthX},${y - depthY + barH}
                  ${x + barW},${y + barH}
                `}
                fill={side}
                opacity={0.85}
              />
              {/* top face */}
              <polygon
                points={`
                  ${x},${y}
                  ${x + depthX},${y - depthY}
                  ${x + barW + depthX},${y - depthY}
                  ${x + barW},${y}
                `}
                fill={top}
                opacity={0.9}
              />
              {/* front face */}
              <rect x={x} y={y} width={barW} height={barH} fill={front} rx={2} />

              {/* glow overlay */}
              <rect x={x} y={y} width={barW * 0.4} height={barH} fill="rgba(255,255,255,0.12)" rx={2} />

              {/* label */}
              <text
                x={x + barW / 2}
                y={chartH + depthY + 18}
                textAnchor="middle"
                fill="rgba(255,255,255,0.45)"
                fontSize={10}
                fontFamily="'DM Sans',sans-serif"
              >{d.label}</text>

              {/* value */}
              <text
                x={x + barW / 2}
                y={y - depthY - 6}
                textAnchor="middle"
                fill="rgba(255,255,255,0.8)"
                fontSize={11}
                fontWeight="700"
                fontFamily="'Sora',sans-serif"
              >{d.value}</text>
            </g>
          );
        })}

        {/* baseline */}
        <line x1={8} y1={chartH + depthY} x2={totalW - 4} y2={chartH + depthY} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      </svg>
    </div>
  );
}

/* ─── 3D Donut / Pie Chart ────────────────────────────────────────────────── */
function ThreeDDonutChart({ segments, title }) {
  const [hovered, setHovered] = useState(null);
  const cx = 100, cy = 80, rx = 72, ry = 40;
  const thickness = 28;
  const innerRx = rx - thickness, innerRy = ry - thickness;
  const depthOffset = 14;

  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  // Convert to angle slices
  let startAngle = -Math.PI / 2;
  const slices = segments.map((seg) => {
    const angle = (seg.value / total) * Math.PI * 2;
    const slice = { ...seg, startAngle, endAngle: startAngle + angle };
    startAngle += angle;
    return slice;
  });

  function polarToEllipse(angle, radiusX, radiusY, cx, cy) {
    return [cx + radiusX * Math.cos(angle), cy + radiusY * Math.sin(angle)];
  }

  function arcPath(slice, rx, ry, cx, cy, yOff = 0) {
    const [x1, y1] = polarToEllipse(slice.startAngle, rx, ry, cx, cy + yOff);
    const [x2, y2] = polarToEllipse(slice.endAngle, rx, ry, cx, cy + yOff);
    const large = slice.endAngle - slice.startAngle > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${rx} ${ry} 0 ${large} 1 ${x2} ${y2}`;
  }

  function ringPath(slice, outerRx, outerRy, innerRx, innerRy, cx, cy, yOff = 0) {
    const [ox1, oy1] = polarToEllipse(slice.startAngle, outerRx, outerRy, cx, cy + yOff);
    const [ox2, oy2] = polarToEllipse(slice.endAngle, outerRx, outerRy, cx, cy + yOff);
    const [ix1, iy1] = polarToEllipse(slice.startAngle, innerRx, innerRy, cx, cy + yOff);
    const [ix2, iy2] = polarToEllipse(slice.endAngle, innerRx, innerRy, cx, cy + yOff);
    const large = slice.endAngle - slice.startAngle > Math.PI ? 1 : 0;
    return `M ${ox1} ${oy1} A ${outerRx} ${outerRy} 0 ${large} 1 ${ox2} ${oy2} L ${ix2} ${iy2} A ${innerRx} ${innerRy} 0 ${large} 0 ${ix1} ${iy1} Z`;
  }

  // Only draw side depth for bottom half slices
  function sidePath(slice) {
    const paths = [];
    const steps = 24;
    const angleRange = slice.endAngle - slice.startAngle;
    for (let i = 0; i < steps; i++) {
      const a1 = slice.startAngle + (i / steps) * angleRange;
      const a2 = slice.startAngle + ((i + 1) / steps) * angleRange;
      if (Math.sin((a1 + a2) / 2) < -0.1) continue; // only bottom-facing
      const [ox1, oy1] = polarToEllipse(a1, rx, ry, cx, cy);
      const [ox2, oy2] = polarToEllipse(a2, rx, ry, cx, cy);
      const [ix1, iy1] = polarToEllipse(a1, innerRx, innerRy, cx, cy);
      const [ix2, iy2] = polarToEllipse(a2, innerRx, innerRy, cx, cy);
      paths.push(`M ${ox1} ${oy1} L ${ox1} ${oy1 + depthOffset} L ${ox2} ${oy2 + depthOffset} L ${ox2} ${oy2} Z`);
      paths.push(`M ${ix1} ${iy1} L ${ix1} ${iy1 + depthOffset} L ${ix2} ${iy2 + depthOffset} L ${ix2} ${iy2} Z`);
    }
    return paths;
  }

  return (
    <div style={{ width: '100%' }}>
      <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.35)', fontWeight: 700, marginBottom: 8 }}>{title}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg viewBox="0 0 200 160" style={{ width: '60%', overflow: 'visible' }}>
          {/* depth / side faces */}
          {slices.map((slice, i) => (
            <g key={`side-${i}`} opacity={0.6}>
              {sidePath(slice).map((p, pi) => (
                <path key={pi} d={p} fill={slice.color} />
              ))}
            </g>
          ))}

          {/* bottom ring */}
          {slices.map((slice, i) => (
            <path key={`bot-${i}`} d={ringPath(slice, rx, ry, innerRx, innerRy, cx, cy, depthOffset)} fill={slice.color} opacity={0.55} />
          ))}

          {/* top ring */}
          {slices.map((slice, i) => (
            <path
              key={`top-${i}`}
              d={ringPath(slice, rx, ry, innerRx, innerRy, cx, cy)}
              fill={slice.color}
              opacity={hovered === i ? 1 : 0.88}
              style={{ transition: 'opacity .2s', cursor: 'pointer', filter: hovered === i ? `drop-shadow(0 0 8px ${slice.color})` : 'none' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}

          {/* center label */}
          <text x={cx} y={cy - 10} textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize={18} fontWeight={800} fontFamily="'Sora',sans-serif">{total}</text>
          <text x={cx} y={cy + 6} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={9} fontFamily="'DM Sans',sans-serif">TOTAL</text>
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {segments.map((seg, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: seg.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', margin: 0, fontFamily: "'DM Sans',sans-serif" }}>{seg.label}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0, fontFamily: "'Sora',sans-serif" }}>{seg.value}</p>
              </div>
              <span style={{ fontSize: 11, color: seg.color, fontWeight: 600 }}>
                {total > 0 ? Math.round((seg.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Sparkline ───────────────────────────────────────────────────────────── */
function Sparkline({ data, color = '#7c3aed', height = 48 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 200;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - (v / max) * (height - 4)}`).join(' ');
  const areaPath = `M 0,${height} L ${data.map((v, i) => `${(i / (data.length - 1)) * w},${height - (v / max) * (height - 4)}`).join(' L ')} L ${w},${height} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sg-${color.replace('#', '')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * w} cy={height - (data[data.length - 1] / max) * (height - 4)} r={3} fill={color} />
    </svg>
  );
}

/* ─── Live Pulse Dot ──────────────────────────────────────────────────────── */
function PulseDot({ color = '#34d399' }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.4,
        animation: 'db-pulse 1.8s cubic-bezier(.4,0,.6,1) infinite'
      }} />
      <span style={{ position: 'relative', display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: color }} />
    </span>
  );
}

/* ─── Main Dashboard ──────────────────────────────────────────────────────── */
export default function ResumeBuilderMain() {
  const [activeTab, setActiveTab] = useState('resume');
  const [stats, setStats] = useState({
    resumeCount: 0,
    coverLetterCount: 0,
    resumesByMonth: [],
    coverLettersByMonth: [],
    resumeTemplates: [],
    avgCompletion: 0,
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef(null);

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      // Fetch resumes and cover letters in parallel
      const [resumeRes, clRes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/resume?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/cover-letter?t=${Date.now()}`, { cache: 'no-store' }),
      ]);

      let resumes = [], coverLetters = [];

      if (resumeRes.status === 'fulfilled' && resumeRes.value.ok) {
        const data = await resumeRes.value.json();
        resumes = Array.isArray(data) ? data : [];
      }
      if (clRes.status === 'fulfilled' && clRes.value.ok) {
        const data = await clRes.value.json();
        // handle { coverLetters: [...] } or raw array
        coverLetters = Array.isArray(data) ? data : (Array.isArray(data?.coverLetters) ? data.coverLetters : []);
      }

      // Build monthly buckets (last 6 months)
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en-US', { month: 'short' }), r: 0, cl: 0 };
      });

      resumes.forEach(r => {
        const d = new Date(r.createdAt || Date.now());
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const m = months.find(m => m.key === key);
        if (m) m.r++;
      });
      coverLetters.forEach(cl => {
        const d = new Date(cl.createdAt || Date.now());
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const m = months.find(m => m.key === key);
        if (m) m.cl++;
      });

      // Template distribution
      const tplMap = {};
      resumes.forEach(r => {
        const t = r.selectedTemplate || r.template || 'default';
        tplMap[t] = (tplMap[t] || 0) + 1;
      });
      const tplColors = ['#7c3aed', '#06b6d4', '#f59e0b', '#ec4899', '#34d399', '#f97316'];
      const resumeTemplates = Object.entries(tplMap).map(([k, v], i) => ({
        label: k.charAt(0).toUpperCase() + k.slice(1),
        value: v,
        color: tplColors[i % tplColors.length],
      }));

      // Avg completion
      const avgCompletion = resumes.length === 0 ? 0 : Math.round(
        resumes.reduce((acc, r) => {
          const f = [
            r.personalInfo?.fullName || r.formData?.personalInfo?.fullName,
            r.personalInfo?.email || r.formData?.personalInfo?.email,
            r.personalInfo?.phone || r.formData?.personalInfo?.phone,
            r.summary || r.formData?.summary,
            r.skills || r.formData?.skills,
            (r.experience || r.formData?.experience || []).length > 0,
            (r.education || r.formData?.education || []).length > 0,
          ];
          return acc + Math.round((f.filter(Boolean).length / f.length) * 100);
        }, 0) / resumes.length
      );

      setStats({
        resumeCount: resumes.length,
        coverLetterCount: coverLetters.length,
        resumesByMonth: months.map(m => ({ label: m.label, value: m.r })),
        coverLettersByMonth: months.map(m => ({ label: m.label, value: m.cl })),
        resumeTemplates: resumeTemplates.length > 0 ? resumeTemplates : [
          { label: 'Modern', value: 0, color: '#7c3aed' },
          { label: 'Classic', value: 0, color: '#06b6d4' },
        ],
        avgCompletion,
        lastUpdated: new Date(),
      });
    } catch (e) {
      console.error('Stats fetch failed:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    intervalRef.current = setInterval(() => fetchStats(), 30000); // refresh every 30s
    return () => clearInterval(intervalRef.current);
  }, [fetchStats]);

  const features = [
    {
      id: 'resume', title: 'Resume Builder',
      description: 'Create professional CVs with AI assistance',
      icon: FileText, color: 'from-blue-500 to-cyan-500',
      features: ['Smart templates', 'AI suggestions', 'PDF export', 'ATS optimization']
    },
    {
      id: 'cover-letter', title: 'Cover Letter Generator',
      description: 'Generate personalized cover letters',
      icon: PenTool, color: 'from-purple-500 to-pink-500',
      features: ['Job-specific content', 'AI writing', 'Multiple formats', 'Customization']
    },
    {
      id: 'checker', title: 'Resume Checker',
      description: 'Analyze and improve your resume',
      icon: CheckCircle, color: 'from-green-500 to-emerald-500',
      features: ['ATS scoring', 'Grammar check', 'Keyword optimization', 'Improvement tips']
    }
  ];

  const pieData = [
    { label: 'Resumes', value: stats.resumeCount, color: '#7c3aed' },
    { label: 'Cover Letters', value: stats.coverLetterCount, color: '#06b6d4' },
  ];

  const barData3D = stats.resumesByMonth.map((m, i) => ({
    label: m.label,
    value: m.value,
    color: '#7c3aed',
    topColor: '#a78bfa',
    sideColor: '#5b21b6',
  }));

  const clBarData3D = stats.coverLettersByMonth.map((m, i) => ({
    label: m.label,
    value: m.cl || stats.coverLettersByMonth[i]?.value || 0,
    color: '#0891b2',
    topColor: '#22d3ee',
    sideColor: '#0e7490',
  }));

  // Merge resume + cover letter bars
  const combinedBarData = stats.resumesByMonth.map((m, i) => ({
    label: m.label,
    value: m.value + (stats.coverLettersByMonth[i]?.value || 0),
    color: i % 2 === 0 ? '#7c3aed' : '#0891b2',
    topColor: i % 2 === 0 ? '#a78bfa' : '#22d3ee',
    sideColor: i % 2 === 0 ? '#5b21b6' : '#0e7490',
  }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes db-fadeup { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes db-orb    { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(24px,-16px) scale(1.06)} 70%{transform:translate(-16px,12px) scale(0.96)} }
        @keyframes db-pulse  { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(2.2);opacity:0} }
        @keyframes db-spin   { to{transform:rotate(360deg)} }
        @keyframes db-shimmer{ 0%{opacity:.5} 50%{opacity:1} 100%{opacity:.5} }

        .db-f1{animation:db-fadeup .55s cubic-bezier(.22,1,.36,1) .05s both}
        .db-f2{animation:db-fadeup .55s cubic-bezier(.22,1,.36,1) .13s both}
        .db-f3{animation:db-fadeup .55s cubic-bezier(.22,1,.36,1) .21s both}
        .db-f4{animation:db-fadeup .55s cubic-bezier(.22,1,.36,1) .29s both}
        .db-f5{animation:db-fadeup .55s cubic-bezier(.22,1,.36,1) .37s both}
        .db-f6{animation:db-fadeup .55s cubic-bezier(.22,1,.36,1) .45s both}

        .db-orb-a{animation:db-orb 14s ease-in-out infinite}
        .db-orb-b{animation:db-orb 20s ease-in-out 5s infinite reverse}

        /* Stat card */
        .db-stat{
          position:relative;overflow:hidden;
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.08);
          border-radius:22px;padding:24px;
          backdrop-filter:blur(20px);
          transition:border-color .25s,transform .2s,box-shadow .2s;
        }
        .db-stat:hover{border-color:rgba(139,92,246,.5);transform:translateY(-3px);box-shadow:0 16px 48px rgba(88,28,135,.22)}

        /* Chart card */
        .db-chart{
          position:relative;overflow:hidden;
          background:rgba(255,255,255,.03);
          border:1px solid rgba(255,255,255,.07);
          border-radius:24px;padding:26px 28px;
          backdrop-filter:blur(20px);
          transition:border-color .25s,transform .2s;
        }
        .db-chart:hover{border-color:rgba(139,92,246,.35);transform:translateY(-2px)}

        /* Feature card */
        .db-feature{
          background:rgba(255,255,255,.05);
          backdrop-filter:blur(12px);
          border:1px solid rgba(255,255,255,.1);
          border-radius:28px;padding:32px;
          transition:all .3s;cursor:pointer;
        }
        .db-feature:hover{background:rgba(255,255,255,.09);transform:scale(1.025);box-shadow:0 20px 60px rgba(88,28,135,.3)}

        /* Active tab panel */
        .db-panel{
          background:rgba(255,255,255,.04);
          backdrop-filter:blur(14px);
          border:1px solid rgba(255,255,255,.1);
          border-radius:28px;padding:36px;
          text-align:center;
        }

        .db-pill-btn{
          display:inline-flex;align-items:center;gap:7px;
          padding:12px 28px;border-radius:99px;
          font-size:14px;font-weight:600;color:#fff;text-decoration:none;
          transition:opacity .2s,transform .18s,box-shadow .2s;
          font-family:'DM Sans',sans-serif;
        }
        .db-pill-btn:hover{opacity:.88;transform:translateY(-2px)}

        .db-back-btn{
          display:inline-flex;align-items:center;gap:8px;
          padding:9px 18px;border-radius:12px;font-size:13.5px;font-weight:500;
          color:rgba(255,255,255,.62);
          background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
          text-decoration:none;transition:color .2s,background .2s,border-color .2s,transform .18s;
          font-family:'DM Sans',sans-serif;
        }
        .db-back-btn:hover{color:#fff;background:rgba(139,92,246,.18);border-color:rgba(139,92,246,.45);transform:translateX(-2px)}

        .db-refresh-btn{
          display:inline-flex;align-items:center;gap:6px;
          padding:8px 14px;border-radius:11px;font-size:12px;font-weight:600;
          color:rgba(255,255,255,.5);background:rgba(255,255,255,.05);
          border:1px solid rgba(255,255,255,.08);cursor:pointer;
          transition:all .2s;font-family:'DM Sans',sans-serif;
        }
        .db-refresh-btn:hover{color:#a78bfa;border-color:rgba(139,92,246,.4);background:rgba(139,92,246,.1)}

        .db-ring{
          width:48px;height:48px;border-radius:14px;
          display:flex;align-items:center;justify-content:center;
          flex-shrink:0;
        }

        .db-bar-bg{height:4px;border-radius:99px;background:rgba(255,255,255,.07);overflow:hidden;margin-top:14px}
        .db-bar-fill{height:100%;border-radius:99px;transition:width 1.2s cubic-bezier(.4,0,.2,1)}

        .db-section-label{
          font-size:10px;text-transform:uppercase;letter-spacing:.1em;
          color:rgba(255,255,255,.3);font-weight:700;font-family:'DM Sans',sans-serif;
          margin:0 0 20px;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg,#020617 0%,#1a0533 55%,#0f172a 100%)',
        padding: 'clamp(20px,5vw,52px)',
        fontFamily: "'DM Sans',sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Ambient orbs */}
        <div className="db-orb-a" style={{ position:'fixed',top:'-8%',right:'-4%',width:560,height:560,borderRadius:'50%',background:'radial-gradient(circle,rgba(88,28,135,.2) 0%,transparent 68%)',pointerEvents:'none',zIndex:0 }} />
        <div className="db-orb-b" style={{ position:'fixed',bottom:'-12%',left:'-6%',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(30,27,75,.32) 0%,transparent 68%)',pointerEvents:'none',zIndex:0 }} />
        <div style={{ position:'fixed',inset:0,zIndex:0,pointerEvents:'none',backgroundImage:'radial-gradient(rgba(139,92,246,0.06) 1px,transparent 1px)',backgroundSize:'34px 34px' }} />

        <div style={{ position:'relative',zIndex:1,maxWidth:1280,margin:'0 auto' }}>

          {/* ── Top Nav ── */}
          <div className="db-f1" style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:48 }}>
            <Link href="/" className="db-back-btn">
              <ArrowLeft size={14} /> Back to Home
            </Link>
            <div style={{ display:'flex',alignItems:'center',gap:10 }}>
              <PulseDot />
              <span style={{ fontSize:12,color:'rgba(255,255,255,.35)',fontFamily:"'DM Sans',sans-serif" }}>
                Live {stats.lastUpdated ? `· ${stats.lastUpdated.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}` : ''}
              </span>
              <button
                className="db-refresh-btn"
                onClick={() => fetchStats(true)}
                disabled={refreshing}
              >
                <RefreshCw size={12} style={{ animation: refreshing ? 'db-spin 1s linear infinite' : 'none' }} />
                Refresh
              </button>
            </div>
          </div>

          {/* ── Hero ── */}
          <div className="db-f2" style={{ textAlign:'center',marginBottom:52 }}>
            <div style={{ display:'inline-flex',alignItems:'center',gap:7,padding:'4px 14px',borderRadius:99,fontSize:12,fontWeight:600,background:'rgba(139,92,246,.15)',border:'1px solid rgba(139,92,246,.28)',color:'#c4b5fd',marginBottom:18,letterSpacing:'.04em',textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif" }}>
              <Brain size={13} style={{ color:'#fbbf24' }} /> AI-Powered Career Tools
            </div>
            <h1 style={{
              fontFamily:"'Sora',sans-serif",
              fontSize:'clamp(2rem,5vw,3.6rem)',fontWeight:800,
              letterSpacing:'-0.035em',lineHeight:1.08,margin:'0 0 14px',
              background:'linear-gradient(140deg,#ffffff 20%,#ddd6fe 55%,#a78bfa 100%)',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
            }}>
              Resume & Career <span style={{ background:'linear-gradient(140deg,#a78bfa,#f472b6,#22d3ee)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>Personalization</span>
            </h1>
            <p style={{ fontSize:16,color:'rgba(255,255,255,.45)',maxWidth:520,margin:'0 auto',fontFamily:"'DM Sans',sans-serif" }}>
              Build professional resumes, generate cover letters, and optimize your career documents with AI assistance.
            </p>
          </div>

          {/* ── Real-Time Stat Cards ── */}
          <div className="db-f3" style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:14,marginBottom:28 }}>

            {/* Resumes */}
            <div className="db-stat">
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12 }}>
                <div>
                  <p style={{ fontSize:10,textTransform:'uppercase',letterSpacing:'.08em',color:'rgba(255,255,255,.35)',fontWeight:700,margin:'0 0 6px',fontFamily:"'DM Sans',sans-serif" }}>Saved Resumes</p>
                  <p style={{ fontSize:38,fontWeight:800,color:'#fff',lineHeight:1,fontFamily:"'Sora',sans-serif",margin:0 }}>
                    {loading ? '—' : <AnimatedNumber value={stats.resumeCount} />}
                  </p>
                </div>
                <div className="db-ring" style={{ background:'rgba(124,58,237,.18)',border:'1px solid rgba(124,58,237,.3)' }}>
                  <FileText size={20} style={{ color:'#a78bfa' }} />
                </div>
              </div>
              <Sparkline data={stats.resumesByMonth.map(m => m.value)} color="#7c3aed" height={40} />
              <p style={{ fontSize:11,color:'rgba(255,255,255,.28)',margin:'8px 0 0',fontFamily:"'DM Sans',sans-serif" }}>↑ across 6 months</p>
            </div>

            {/* Cover Letters */}
            <div className="db-stat">
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12 }}>
                <div>
                  <p style={{ fontSize:10,textTransform:'uppercase',letterSpacing:'.08em',color:'rgba(255,255,255,.35)',fontWeight:700,margin:'0 0 6px',fontFamily:"'DM Sans',sans-serif" }}>Cover Letters</p>
                  <p style={{ fontSize:38,fontWeight:800,color:'#fff',lineHeight:1,fontFamily:"'Sora',sans-serif",margin:0 }}>
                    {loading ? '—' : <AnimatedNumber value={stats.coverLetterCount} />}
                  </p>
                </div>
                <div className="db-ring" style={{ background:'rgba(6,182,212,.15)',border:'1px solid rgba(6,182,212,.28)' }}>
                  <PenTool size={20} style={{ color:'#22d3ee' }} />
                </div>
              </div>
              <Sparkline data={stats.coverLettersByMonth.map(m => m.value)} color="#0891b2" height={40} />
              <p style={{ fontSize:11,color:'rgba(255,255,255,.28)',margin:'8px 0 0',fontFamily:"'DM Sans',sans-serif" }}>↑ across 6 months</p>
            </div>

            {/* Avg Completion */}
            <div className="db-stat">
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12 }}>
                <div>
                  <p style={{ fontSize:10,textTransform:'uppercase',letterSpacing:'.08em',color:'rgba(255,255,255,.35)',fontWeight:700,margin:'0 0 6px',fontFamily:"'DM Sans',sans-serif" }}>Avg Completion</p>
                  <p style={{ fontSize:38,fontWeight:800,color:'#fff',lineHeight:1,fontFamily:"'Sora',sans-serif",margin:0 }}>
                    {loading ? '—' : <AnimatedNumber value={stats.avgCompletion} suffix="%" />}
                  </p>
                </div>
                <div className="db-ring" style={{ background:'rgba(52,211,153,.15)',border:'1px solid rgba(52,211,153,.28)' }}>
                  <Target size={20} style={{ color:'#34d399' }} />
                </div>
              </div>
              <div className="db-bar-bg">
                <div className="db-bar-fill" style={{ width:`${stats.avgCompletion}%`,background:'linear-gradient(90deg,#059669,#34d399)' }} />
              </div>
              <p style={{ fontSize:11,color:'rgba(255,255,255,.28)',margin:'8px 0 0',fontFamily:"'DM Sans',sans-serif" }}>resume profile score</p>
            </div>

            {/* Total Documents */}
            <div className="db-stat">
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12 }}>
                <div>
                  <p style={{ fontSize:10,textTransform:'uppercase',letterSpacing:'.08em',color:'rgba(255,255,255,.35)',fontWeight:700,margin:'0 0 6px',fontFamily:"'DM Sans',sans-serif" }}>Total Documents</p>
                  <p style={{ fontSize:38,fontWeight:800,color:'#fff',lineHeight:1,fontFamily:"'Sora',sans-serif",margin:0 }}>
                    {loading ? '—' : <AnimatedNumber value={stats.resumeCount + stats.coverLetterCount} />}
                  </p>
                </div>
                <div className="db-ring" style={{ background:'rgba(251,146,60,.15)',border:'1px solid rgba(251,146,60,.28)' }}>
                  <Award size={20} style={{ color:'#fb923c' }} />
                </div>
              </div>
              <div className="db-bar-bg">
                <div className="db-bar-fill" style={{ width:`${Math.min(100,Math.round(((stats.resumeCount + stats.coverLetterCount)/30)*100))}%`,background:'linear-gradient(90deg,#d97706,#fb923c)' }} />
              </div>
              <p style={{ fontSize:11,color:'rgba(255,255,255,.28)',margin:'8px 0 0',fontFamily:"'DM Sans',sans-serif" }}>{Math.min(100,Math.round(((stats.resumeCount + stats.coverLetterCount)/30)*100))}% of milestone (30)</p>
            </div>
          </div>

          {/* ── Chart Row ── */}
          <div className="db-f4" style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:18,marginBottom:32 }}>

            {/* 3D Bar Chart — Activity */}
            <div className="db-chart" style={{ gridColumn: 'span 2' }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4 }}>
                <div>
                  <p className="db-section-label" style={{ margin:0 }}>Activity Overview</p>
                  <p style={{ fontSize:17,fontWeight:700,color:'#fff',margin:'4px 0 0',fontFamily:"'Sora',sans-serif" }}>Documents Created per Month</p>
                </div>
                <div style={{ display:'flex',gap:16 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                    <div style={{ width:10,height:10,borderRadius:3,background:'#7c3aed' }} />
                    <span style={{ fontSize:11,color:'rgba(255,255,255,.45)',fontFamily:"'DM Sans',sans-serif" }}>Resumes</span>
                  </div>
                  <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                    <div style={{ width:10,height:10,borderRadius:3,background:'#0891b2' }} />
                    <span style={{ fontSize:11,color:'rgba(255,255,255,.45)',fontFamily:"'DM Sans',sans-serif" }}>Cover Letters</span>
                  </div>
                </div>
              </div>
              {/* Two side-by-side 3D bars */}
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,marginTop:16 }}>
                <ThreeDBarChart data={barData3D} title="📄 Resumes" />
                <ThreeDBarChart data={stats.coverLettersByMonth.map(m => ({
                  ...m,
                  color:'#0891b2', topColor:'#22d3ee', sideColor:'#0e7490'
                }))} title="✉️ Cover Letters" />
              </div>
            </div>

            {/* 3D Donut Chart */}
            <div className="db-chart">
              <p className="db-section-label">Distribution</p>
              <p style={{ fontSize:17,fontWeight:700,color:'#fff',margin:'4px 0 16px',fontFamily:"'Sora',sans-serif" }}>Document Breakdown</p>
              <ThreeDDonutChart
                segments={pieData}
                title="Total Document Mix"
              />

              {/* Template breakdown */}
              {stats.resumeTemplates.length > 0 && (
                <>
                  <div style={{ height:1,background:'rgba(255,255,255,.06)',margin:'20px 0' }} />
                  <p style={{ fontSize:10,textTransform:'uppercase',letterSpacing:'.08em',color:'rgba(255,255,255,.28)',fontWeight:700,margin:'0 0 12px',fontFamily:"'DM Sans',sans-serif" }}>Template Usage</p>
                  {stats.resumeTemplates.slice(0,4).map((t, i) => (
                    <div key={i} style={{ marginBottom:10 }}>
                      <div style={{ display:'flex',justifyContent:'space-between',marginBottom:5 }}>
                        <span style={{ fontSize:12,color:'rgba(255,255,255,.5)',fontFamily:"'DM Sans',sans-serif" }}>{t.label}</span>
                        <span style={{ fontSize:12,color:t.color,fontWeight:700,fontFamily:"'Sora',sans-serif" }}>{t.value}</span>
                      </div>
                      <div className="db-bar-bg" style={{ marginTop:0 }}>
                        <div className="db-bar-fill" style={{ width:`${stats.resumeCount > 0 ? Math.round((t.value/stats.resumeCount)*100) : 0}%`,background:`linear-gradient(90deg,${t.color}99,${t.color})` }} />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

          </div>

          {/* ── Feature Cards ── */}
          <div className="db-f5" style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20,marginBottom:28 }}>
            {features.map(feature => (
              <div key={feature.id} className="db-feature" onClick={() => setActiveTab(feature.id)}
                style={{ borderColor: activeTab === feature.id ? 'rgba(139,92,246,.45)' : undefined }}>
                <div style={{ width:58,height:58,borderRadius:18,background:`linear-gradient(135deg,${feature.id==='resume'?'#3b82f6,#06b6d4':feature.id==='cover-letter'?'#8b5cf6,#ec4899':'#22c55e,#10b981'})`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:22,transition:'transform .3s' }}>
                  <feature.icon size={28} color="#fff" />
                </div>
                <h3 style={{ fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:700,color:'#fff',margin:'0 0 10px',transition:'color .2s' }}>
                  {feature.title}
                </h3>
                <p style={{ color:'rgba(255,255,255,.42)',fontSize:13.5,margin:'0 0 18px',fontFamily:"'DM Sans',sans-serif",lineHeight:1.6 }}>
                  {feature.description}
                </p>
                <div style={{ display:'flex',flexDirection:'column',gap:7,marginBottom:20 }}>
                  {feature.features.map((item, idx) => (
                    <div key={idx} style={{ display:'flex',alignItems:'center',gap:9 }}>
                      <div style={{ width:5,height:5,borderRadius:'50%',background:`linear-gradient(135deg,${feature.id==='resume'?'#3b82f6,#06b6d4':feature.id==='cover-letter'?'#8b5cf6,#ec4899':'#22c55e,#10b981'})`,flexShrink:0 }} />
                      <span style={{ fontSize:13,color:'rgba(255,255,255,.5)',fontFamily:"'DM Sans',sans-serif" }}>{item}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:6,fontSize:13.5,fontWeight:600,color:'#a78bfa',fontFamily:"'DM Sans',sans-serif",transition:'transform .2s' }}>
                  Get Started <ArrowLeft size={15} style={{ transform:'rotate(180deg)' }} />
                </div>
              </div>
            ))}
          </div>

          {/* ── Active Tab Panel ── */}
          <div className="db-f5 db-panel">
            {activeTab === 'resume' && (
              <>
                <div style={{ width:72,height:72,borderRadius:22,background:'linear-gradient(135deg,#3b82f6,#06b6d4)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 22px' }}>
                  <FileText size={34} color="#fff" />
                </div>
                <h2 style={{ fontFamily:"'Sora',sans-serif",fontSize:28,fontWeight:800,color:'#fff',margin:'0 0 12px' }}>Resume Builder</h2>
                <p style={{ color:'rgba(255,255,255,.42)',fontSize:14,maxWidth:480,margin:'0 auto 28px',lineHeight:1.7,fontFamily:"'DM Sans',sans-serif" }}>
                  Create professional resumes with our AI-powered builder. Choose from templates, get smart suggestions, and export to PDF.
                </p>
                <div style={{ display:'flex',flexWrap:'wrap',gap:14,justifyContent:'center' }}>
                  <Link href="/resume-builder/create" className="db-pill-btn" style={{ background:'linear-gradient(135deg,#3b82f6,#06b6d4)',boxShadow:'0 8px 28px rgba(59,130,246,.4)' }}
                    onClick={() => { try{localStorage.removeItem('resumeFormData');localStorage.removeItem('selectedTemplate');}catch(e){} }}>
                    <Sparkles size={16} /> Create New Resume
                  </Link>
                  <Link href="/resume-builder/saved" className="db-pill-btn" style={{ background:'linear-gradient(135deg,#7c3aed,#5b21b6)',boxShadow:'0 8px 28px rgba(124,58,237,.38)' }}>
                    <Save size={16} /> My Saved Resumes
                    {stats.resumeCount > 0 && <span style={{ background:'rgba(255,255,255,.2)',borderRadius:99,padding:'1px 8px',fontSize:11,fontWeight:700 }}>{stats.resumeCount}</span>}
                  </Link>
                </div>
              </>
            )}
            {activeTab === 'cover-letter' && (
              <>
                <div style={{ width:72,height:72,borderRadius:22,background:'linear-gradient(135deg,#8b5cf6,#ec4899)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 22px' }}>
                  <PenTool size={34} color="#fff" />
                </div>
                <h2 style={{ fontFamily:"'Sora',sans-serif",fontSize:28,fontWeight:800,color:'#fff',margin:'0 0 12px' }}>Cover Letter Generator</h2>
                <p style={{ color:'rgba(255,255,255,.42)',fontSize:14,maxWidth:480,margin:'0 auto 28px',lineHeight:1.7,fontFamily:"'DM Sans',sans-serif" }}>
                  Generate personalized cover letters tailored to specific job applications. Our AI creates compelling content that matches your resume.
                </p>
                <div style={{ display:'flex',flexWrap:'wrap',gap:14,justifyContent:'center' }}>
                  <Link href="/resume-builder/cover-letter/create" className="db-pill-btn" style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)',boxShadow:'0 8px 28px rgba(139,92,246,.4)' }}>
                    <Sparkles size={16} /> Generate Cover Letter
                  </Link>
                  <Link href="/resume-builder/cover-letter/saved" className="db-pill-btn" style={{ background:'linear-gradient(135deg,#7c3aed,#5b21b6)',boxShadow:'0 8px 28px rgba(124,58,237,.38)' }}>
                    <Save size={16} /> Saved Cover Letters
                    {stats.coverLetterCount > 0 && <span style={{ background:'rgba(255,255,255,.2)',borderRadius:99,padding:'1px 8px',fontSize:11,fontWeight:700 }}>{stats.coverLetterCount}</span>}
                  </Link>
                </div>
              </>
            )}
            {activeTab === 'checker' && (
              <>
                <div style={{ width:72,height:72,borderRadius:22,background:'linear-gradient(135deg,#22c55e,#10b981)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 22px' }}>
                  <CheckCircle size={34} color="#fff" />
                </div>
                <h2 style={{ fontFamily:"'Sora',sans-serif",fontSize:28,fontWeight:800,color:'#fff',margin:'0 0 12px' }}>Resume Checker</h2>
                <p style={{ color:'rgba(255,255,255,.42)',fontSize:14,maxWidth:480,margin:'0 auto 28px',lineHeight:1.7,fontFamily:"'DM Sans',sans-serif" }}>
                  Analyze your resume for ATS compatibility, grammar issues, and optimization opportunities. Get detailed feedback and improvement suggestions.
                </p>
                <div style={{ display:'flex',flexWrap:'wrap',gap:14,justifyContent:'center' }}>
                  <Link href="/resume-builder/checker" className="db-pill-btn" style={{ background:'linear-gradient(135deg,#22c55e,#10b981)',boxShadow:'0 8px 28px rgba(34,197,94,.4)' }}>
                    <CheckCircle size={16} /> Check My Resume
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* ── Quick Stats Row ── */}
          <div className="db-f6" style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginTop:20 }}>
            {[
              { label:'Resumes Created', value:'1000+', icon:FileText, color:'#7c3aed' },
              { label:'ATS Score', value:'95%', icon:Target, color:'#34d399' },
              { label:'Templates', value:'50+', icon:Zap, color:'#fb923c' },
              { label:'AI Support', value:'24/7', icon:Activity, color:'#22d3ee' },
            ].map((s, i) => (
              <div key={i} className="db-stat" style={{ textAlign:'center',padding:20 }}>
                <s.icon size={22} style={{ color:s.color,margin:'0 auto 10px',display:'block' }} />
                <p style={{ fontSize:24,fontWeight:800,color:'#fff',margin:'0 0 4px',fontFamily:"'Sora',sans-serif" }}>{s.value}</p>
                <p style={{ fontSize:11,color:'rgba(255,255,255,.35)',margin:0,fontFamily:"'DM Sans',sans-serif" }}>{s.label}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}