"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell } from "recharts";

export default function ProgressTracker() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/interview/history/all")
      .then(r => r.json())
      .then(d => { setHistory(d.interviews || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Build chart data from history
  const lineData = history.slice(-10).map((h, i) => ({
    name: `#${i + 1}`,
    score: h.score || 0,
    role: h.title || "Interview"
  }));

  const roleMap = {};
  history.forEach(h => { if (h.title) roleMap[h.title] = (roleMap[h.title] || 0) + 1; });
  const roleData = Object.entries(roleMap).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count).slice(0, 6);

  const avgScore = history.length ? Math.round(history.reduce((s, h) => s + (h.score || 0), 0) / history.length) : 0;
  const bestScore = history.length ? Math.max(...history.map(h => h.score || 0)) : 0;
  const recentTrend = lineData.length >= 2 ? lineData[lineData.length - 1].score - lineData[lineData.length - 2].score : 0;

  const radarData = [
    { subject: "Technical", A: avgScore - 2 },
    { subject: "Communication", A: Math.max(0, avgScore - 8) },
    { subject: "Confidence", A: Math.max(0, avgScore - 5) },
    { subject: "Clarity", A: Math.min(100, avgScore + 3) },
    { subject: "Depth", A: Math.max(0, avgScore - 6) },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) return (
      <div style={{ background: "#1e1b2e", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
        <div style={{ color: "#94a3b8", marginBottom: 4 }}>{label}</div>
        <div style={{ color: "#c4b5fd", fontWeight: 700 }}>{payload[0].value}%</div>
      </div>
    );
    return null;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Mono:wght@500&display=swap');
        .pt * { box-sizing: border-box; }
        .pt { min-height: 100vh; background: #0a0a12; color: #e2e8f0; font-family: 'Outfit', sans-serif; padding: 40px 48px; }
        .pt-back { display: inline-flex; align-items: center; gap: 6px; color: #64748b; font-size: 13px; text-decoration: none; margin-bottom: 28px; transition: color 0.2s; }
        .pt-back:hover { color: #a78bfa; }
        .pt-title { font-size: 30px; font-weight: 800; color: #f1f5f9; letter-spacing: -0.03em; margin-bottom: 6px; }
        .pt-sub { font-size: 14px; color: #64748b; margin-bottom: 32px; }

        .pt-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
        .pt-stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px 22px; }
        .pt-stat-label { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
        .pt-stat-val { font-size: 32px; font-weight: 800; font-family: 'DM Mono', monospace; }

        .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .chart-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 24px; }
        .chart-title { font-size: 14px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 20px; }

        .history-list { display: flex; flex-direction: column; gap: 8px; }
        .history-row { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; gap: 14px; }
        .h-num { width: 26px; height: 26px; border-radius: 7px; background: rgba(124,58,237,0.15); color: #a78bfa; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .h-role { font-size: 14px; font-weight: 600; color: #e2e8f0; flex: 1; }
        .h-meta { font-size: 12px; color: #64748b; }
        .h-score { font-size: 15px; font-weight: 800; font-family: 'DM Mono', monospace; }

        .empty-chart { display: flex; align-items: center; justify-content: center; height: 200px; color: #475569; font-size: 14px; }
        .trend-up { color: #4ade80; }
        .trend-down { color: #f87171; }
        .trend-flat { color: #94a3b8; }
      `}</style>

      <div className="pt">
        <Link href="/InterviewDashboard" className="pt-back">← Dashboard</Link>
        <h1 className="pt-title">📈 Progress Tracker</h1>
        <p className="pt-sub">Track your interview performance over time</p>

        {/* STATS */}
        <div className="pt-stats">
          {[
            { label: "Total Sessions", val: history.length, color: "#60a5fa", suffix: "" },
            { label: "Average Score", val: avgScore, color: "#34d399", suffix: "%" },
            { label: "Best Score", val: bestScore, color: "#fbbf24", suffix: "%" },
            { label: "Recent Trend", val: recentTrend > 0 ? `+${recentTrend}` : recentTrend, color: recentTrend >= 0 ? "#4ade80" : "#f87171", suffix: "%" },
          ].map((s, i) => (
            <div key={i} className="pt-stat" style={{ borderColor: `${s.color}20` }}>
              <div className="pt-stat-label">{s.label}</div>
              <div className="pt-stat-val" style={{ color: s.color }}>{s.val}{s.suffix}</div>
            </div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-title">Score Over Time</div>
            {lineData.length === 0
              ? <div className="empty-chart">No data yet — complete an interview first</div>
              : <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                    <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12 }}/>
                    <YAxis stroke="#475569" domain={[0, 100]} tick={{ fontSize: 12 }}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2.5} dot={{ fill: "#a78bfa", r: 5 }} activeDot={{ r: 7, fill: "#c4b5fd" }}/>
                  </LineChart>
                </ResponsiveContainer>
            }
          </div>

          <div className="chart-card">
            <div className="chart-title">Interviews by Role</div>
            {roleData.length === 0
              ? <div className="empty-chart">No data yet</div>
              : <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={roleData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false}/>
                    <XAxis type="number" stroke="#475569" tick={{ fontSize: 11 }}/>
                    <YAxis type="category" dataKey="name" stroke="#475569" tick={{ fontSize: 11 }} width={90}/>
                    <Tooltip contentStyle={{ background: "#1e1b2e", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 10, fontSize: 13 }}/>
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {roleData.map((_, i) => {
                        const colors = ["#7c3aed","#4f46e5","#2563eb","#0891b2","#059669","#d97706"];
                        return <Cell key={i} fill={colors[i % colors.length]}/>;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-title">Skill Radar</div>
            {history.length === 0
              ? <div className="empty-chart">Complete interviews to see radar</div>
              : <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)"/>
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 12 }}/>
                    <Radar name="Score" dataKey="A" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} strokeWidth={2}/>
                  </RadarChart>
                </ResponsiveContainer>
            }
          </div>

          <div className="chart-card" style={{ overflow: "hidden" }}>
            <div className="chart-title">Recent Sessions</div>
            {loading ? (
              <div className="empty-chart">Loading...</div>
            ) : history.length === 0 ? (
              <div className="empty-chart">No sessions yet</div>
            ) : (
              <div className="history-list" style={{ maxHeight: 220, overflowY: "auto" }}>
                {history.slice(0, 8).map((h, i) => {
                  const sc = h.score || 0;
                  const col = sc >= 70 ? "#4ade80" : sc >= 50 ? "#fbbf24" : "#f87171";
                  return (
                    <div key={i} className="history-row">
                      <div className="h-num">#{i + 1}</div>
                      <div>
                        <div className="h-role">{h.title || "Interview"}</div>
                        <div className="h-meta">{h.experienceLevel} · {h.type}</div>
                      </div>
                      <div className="h-score" style={{ color: col }}>{sc}%</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}