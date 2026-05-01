"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const ScoreRing = ({ score }) => {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 70 ? "#4ade80" : score >= 50 ? "#fbbf24" : "#f87171";

  return (
    <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
      <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5"/>
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke={color} strokeWidth="5"
          strokeDasharray={circ}
          strokeDashoffset={circ - fill}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
      }}>
        <span style={{ fontSize: 16, fontWeight: 900, color, fontFamily: "'DM Mono',monospace", lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>/ 100</span>
      </div>
    </div>
  );
};

const ScoreBadge = ({ score }) => {
  if (score >= 80) return { label: "Excellent", bg: "rgba(74,222,128,0.12)", color: "#4ade80", border: "rgba(74,222,128,0.25)" };
  if (score >= 65) return { label: "Good", bg: "rgba(96,165,250,0.12)", color: "#60a5fa", border: "rgba(96,165,250,0.25)" };
  if (score >= 50) return { label: "Average", bg: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "rgba(251,191,36,0.25)" };
  return { label: "Needs Work", bg: "rgba(248,113,113,0.12)", color: "#f87171", border: "rgba(248,113,113,0.25)" };
};

const typeColors = {
  Structured:           { bg: "rgba(96,165,250,0.1)",  color: "#60a5fa"  },
  Unstructured:         { bg: "rgba(52,211,153,0.1)",  color: "#34d399"  },
  Panel:                { bg: "rgba(251,191,36,0.1)",  color: "#fbbf24"  },
  "One-on-One":         { bg: "rgba(192,132,252,0.1)", color: "#c084fc"  },
  "Competency-Based":   { bg: "rgba(251,146,60,0.1)",  color: "#fb923c"  },
  "Phone/Video Screening": { bg: "rgba(34,211,238,0.1)", color: "#22d3ee" },
  "Group Interview":    { bg: "rgba(244,114,182,0.1)", color: "#f472b6"  },
};

const levelColors = {
  Intern:    { color: "#a78bfa", bg: "rgba(167,139,250,0.1)"  },
  Junior:    { color: "#34d399", bg: "rgba(52,211,153,0.1)"   },
  "Mid-Level":{ color: "#60a5fa", bg: "rgba(96,165,250,0.1)"  },
  Senior:    { color: "#fbbf24", bg: "rgba(251,191,36,0.1)"   },
};

export default function History() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("newest");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/interview/history/all")
      .then(res => res.json())
      .then(data => { if (data.success) setInterviews(data.interviews); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filters = ["All", "Excellent", "Good", "Average", "Needs Work"];
  
  const getGrade = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 65) return "Good";
    if (score >= 50) return "Average";
    return "Needs Work";
  };

  const filtered = interviews
    .filter(i => filter === "All" || getGrade(i.score) === filter)
    .filter(i => i.title?.toLowerCase().includes(search.toLowerCase()) ||
                 i.type?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "highest") return b.score - a.score;
      if (sort === "lowest") return a.score - b.score;
      return 0;
    });

  const avg = interviews.length
    ? Math.round(interviews.reduce((s, i) => s + i.score, 0) / interviews.length)
    : 0;
  const best = interviews.length ? Math.max(...interviews.map(i => i.score)) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&family=Mulish:wght@300;400;500;600&display=swap');

        .hx * { box-sizing: border-box; }
        .hx {
          min-height: 100vh;
          background: #060810;
          font-family: 'Mulish', sans-serif;
          color: #e2e8f0;
          padding: 48px;
          position: relative;
          overflow-x: hidden;
        }
        .hx::before {
          content: '';
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background:
            radial-gradient(ellipse 700px 500px at 15% 0%, rgba(99,102,241,0.08) 0%, transparent 65%),
            radial-gradient(ellipse 500px 400px at 85% 100%, rgba(124,58,237,0.07) 0%, transparent 65%),
            radial-gradient(ellipse 300px 300px at 50% 50%, rgba(56,189,248,0.03) 0%, transparent 70%);
        }
        .hx-inner { position: relative; z-index: 1; max-width: 920px; margin: 0 auto; }

        .hx-back {
          display: inline-flex; align-items: center; gap: 6px;
          color: #475569; font-size: 13px; text-decoration: none;
          margin-bottom: 40px; transition: color 0.2s;
          font-family: 'Mulish', sans-serif;
        }
        .hx-back:hover { color: #a78bfa; }

        /* HERO */
        .hx-hero { margin-bottom: 44px; }
        .hx-eyebrow {
          font-size: 11px; font-weight: 700; color: #6366f1;
          letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 10px;
          font-family: 'DM Mono', monospace;
        }
        .hx-title {
          font-family: 'Syne', sans-serif;
          font-size: 42px; font-weight: 800;
          color: #f8fafc; letter-spacing: -0.04em; line-height: 1;
          margin-bottom: 10px;
        }
        .hx-title span {
          background: linear-gradient(130deg, #818cf8 0%, #38bdf8 55%, #a78bfa 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hx-sub { font-size: 14px; color: #475569; }

        /* STAT STRIP */
        .stat-strip {
          display: flex; gap: 12px; margin-bottom: 32px; flex-wrap: wrap;
        }
        .stat-pill {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 12px 18px;
          flex: 1; min-width: 140px;
        }
        .stat-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
        }
        .stat-val {
          font-size: 22px; font-weight: 800; line-height: 1;
          font-family: 'DM Mono', monospace;
        }
        .stat-label { font-size: 11px; color: #475569; margin-top: 2px; }

        /* TOOLBAR */
        .toolbar {
          display: flex; gap: 10px; margin-bottom: 28px;
          flex-wrap: wrap; align-items: center;
        }
        .search-wrap {
          flex: 1; min-width: 200px; position: relative;
        }
        .search-wrap input {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 11px; padding: 10px 12px 10px 36px;
          color: #e2e8f0; font-size: 13px;
          font-family: 'Mulish', sans-serif; outline: none;
          transition: border-color 0.2s;
        }
        .search-wrap input:focus { border-color: rgba(99,102,241,0.4); }
        .search-wrap input::placeholder { color: #334155; }
        .search-icon {
          position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
          font-size: 14px; color: #475569; pointer-events: none;
        }
        .hx-select {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 11px; padding: 10px 32px 10px 12px; color: #e2e8f0;
          font-size: 13px; font-family: 'Mulish', sans-serif; outline: none;
          cursor: pointer; WebkitAppearance: none;
          backgroundImage: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          backgroundRepeat: no-repeat; backgroundPosition: right 10px center;
        }

        /* FILTER PILLS */
        .filter-row { display: flex; gap: 7px; margin-bottom: 28px; flex-wrap: wrap; }
        .fpill {
          padding: 6px 16px; border-radius: 999px; font-size: 12px;
          font-weight: 600; cursor: pointer; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03); color: #64748b;
          transition: all 0.18s; font-family: 'Mulish', sans-serif;
        }
        .fpill:hover { background: rgba(99,102,241,0.1); color: #a5b4fc; }
        .fpill.active { background: rgba(99,102,241,0.18); color: #a5b4fc; border-color: rgba(99,102,241,0.35); }

        /* CARD */
        .hx-card {
          background: rgba(255,255,255,0.022);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; overflow: hidden;
          margin-bottom: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        .hx-card:hover {
          border-color: rgba(99,102,241,0.2);
          box-shadow: 0 0 30px rgba(99,102,241,0.06);
        }
        .hx-card-top {
          display: flex; align-items: center; gap: 18px;
          padding: 20px 24px;
        }
        .hx-card-body { padding: 0 24px 20px; }

        .card-idx {
          width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
          background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #818cf8;
          font-family: 'DM Mono', monospace;
        }
        .card-main { flex: 1; min-width: 0; }
        .card-title {
          font-family: 'Syne', sans-serif;
          font-size: 17px; font-weight: 700; color: #f1f5f9;
          margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .card-meta { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .meta-tag {
          padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600;
          border: 1px solid;
        }
        .card-chevron {
          color: #334155; font-size: 18px; transition: transform 0.2s; flex-shrink: 0;
        }
        .card-chevron.open { transform: rotate(180deg); }

        /* EXPANDED DETAILS */
        .card-details {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 18px 24px;
          display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px;
        }
        .detail-block {}
        .detail-label {
          font-size: 10px; font-weight: 700; color: #475569;
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 5px;
        }
        .detail-val { font-size: 13px; color: #cbd5e1; line-height: 1.5; }

        /* EMPTY */
        .empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 80px 20px; text-align: center;
        }

        /* SHIMMER */
        .shimmer {
          background: linear-gradient(90deg,rgba(255,255,255,0.03) 0%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.03) 100%);
          background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 20px;
        }
        @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }
      `}</style>

      <div className="hx">
        <div className="hx-inner">
          <Link href="/InterviewDashboard" className="hx-back">← Dashboard</Link>

          {/* HERO */}
          <div className="hx-hero">
            <div className="hx-eyebrow">📋 Records</div>
            <h1 className="hx-title">Interview <span>History</span></h1>
            <p className="hx-sub">All your past sessions, scores, and feedback in one place</p>
          </div>

          {/* STAT STRIP */}
          {!loading && interviews.length > 0 && (
            <div className="stat-strip">
              {[
                { icon: "📁", label: "Total Sessions", val: interviews.length, color: "#818cf8", bg: "rgba(129,140,248,0.1)" },
                { icon: "📊", label: "Average Score",  val: `${avg}`,          color: avg >= 70 ? "#4ade80" : avg >= 50 ? "#fbbf24" : "#f87171", bg: "rgba(99,102,241,0.1)" },
                { icon: "🏆", label: "Best Score",     val: `${best}`,         color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
                { icon: "✅", label: "Passed (≥65)",   val: interviews.filter(i => i.score >= 65).length, color: "#34d399", bg: "rgba(52,211,153,0.1)" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  className="stat-pill"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                  <div>
                    <div className="stat-val" style={{ color: s.color }}>{s.val}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* TOOLBAR */}
          <div className="toolbar">
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                placeholder="Search by role or type..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="hx-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{ background: "rgba(255,255,255,0.04)", WebkitAppearance: "none" }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Score</option>
              <option value="lowest">Lowest Score</option>
            </select>
          </div>

          {/* FILTER PILLS */}
          <div className="filter-row">
            {filters.map(f => (
              <button
                key={f}
                className={`fpill ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
                {f !== "All" && (
                  <span style={{ marginLeft: 6, opacity: 0.6 }}>
                    {interviews.filter(i => getGrade(i.score) === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* CONTENT */}
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[1,2,3].map(i => (
                <div key={i} className="shimmer" style={{ height: 88 }}/>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div style={{ fontSize: 52, marginBottom: 16 }}>
                {interviews.length === 0 ? "🎯" : "🔍"}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                {interviews.length === 0 ? "No interviews yet" : "No results found"}
              </div>
              <div style={{ fontSize: 13, color: "#334155" }}>
                {interviews.length === 0
                  ? "Complete your first interview to see it here"
                  : "Try a different search or filter"}
              </div>
            </div>
          ) : (
            <div>
              {filtered.map((item, index) => {
                const badge = ScoreBadge({ score: item.score });
                const tc = typeColors[item.type] || { bg: "rgba(124,58,237,0.1)", color: "#a78bfa" };
                const lc = levelColors[item.experienceLevel] || { color: "#94a3b8", bg: "rgba(148,163,184,0.1)" };
                const isOpen = expanded === item._id;

                return (
                  <motion.div
                    key={item._id}
                    className="hx-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    onClick={() => setExpanded(isOpen ? null : item._id)}
                  >
                    {/* TOP ROW */}
                    <div className="hx-card-top">
                      <div className="card-idx">{String(index + 1).padStart(2, "0")}</div>

                      <ScoreRing score={item.score} />

                      <div className="card-main">
                        <div className="card-title">{item.title}</div>
                        <div className="card-meta">
                          {/* Type tag */}
                          <span className="meta-tag" style={{
                            background: tc.bg, color: tc.color,
                            borderColor: tc.color + "40"
                          }}>
                            {item.type}
                          </span>
                          {/* Level tag */}
                          <span className="meta-tag" style={{
                            background: lc.bg, color: lc.color,
                            borderColor: lc.color + "40"
                          }}>
                            {item.experienceLevel}
                          </span>
                          {/* Grade badge */}
                          <span className="meta-tag" style={{
                            background: badge.bg, color: badge.color,
                            borderColor: badge.border
                          }}>
                            {badge.label}
                          </span>
                          {/* Date */}
                          <span style={{ fontSize: 11, color: "#475569", marginLeft: 2 }}>
                            🗓 {new Date(item.createdAt).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric"
                            })}
                          </span>
                        </div>
                      </div>

                      <div className={`card-chevron ${isOpen ? "open" : ""}`}>▾</div>
                    </div>

                    {/* EXPANDED DETAILS */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ overflow: "hidden" }}
                        >
                          <div className="card-details">
                            <div className="detail-block">
                              <div className="detail-label">📝 Questions</div>
                              <div className="detail-val">{item.questionCount} questions</div>
                            </div>
                            <div className="detail-block">
                              <div className="detail-label">🎯 Score</div>
                              <div className="detail-val" style={{
                                fontWeight: 800, fontSize: 18,
                                color: item.score >= 70 ? "#4ade80" : item.score >= 50 ? "#fbbf24" : "#f87171",
                                fontFamily: "'DM Mono',monospace"
                              }}>
                                {item.score} / 100
                              </div>
                            </div>
                            <div className="detail-block">
                              <div className="detail-label">📋 Description</div>
                              <div className="detail-val" style={{ color: "#64748b" }}>
                                {item.description || "Not provided"}
                              </div>
                            </div>
                            <div className="detail-block">
                              <div className="detail-label">🕒 Date</div>
                              <div className="detail-val">
                                {new Date(item.createdAt).toLocaleDateString("en-US", {
                                  weekday: "short", month: "long", day: "numeric", year: "numeric"
                                })}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#334155" }}>
                Showing {filtered.length} of {interviews.length} sessions
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}