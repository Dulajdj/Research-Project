"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [role, setRole] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState("analysis");
  const fileRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    if (f.type === "application/pdf") {
      setText("__PDF__");
    } else {
      const reader = new FileReader();
      reader.onload = (e) => setText(e.target.result);
      reader.readAsText(f);
    }
  };

  const analyze = async () => {
    if ((!text.trim() && !file) || !role.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      let body;
      let headers = {};

      if (file && file.type === "application/pdf") {
        const formData = new FormData();
        formData.append("resume", file);
        formData.append("role", role);
        formData.append("questionCount", questionCount);
        body = formData;
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({ text, role, questionCount });
      }

      const res = await fetch("http://localhost:5000/api/ai/resume/analyze", {
        method: "POST",
        headers,
        body,
      });

      const data = await res.json();
      if (data.message) throw new Error(data.message);
      setResult(data);
      setActiveTab("analysis");
    } catch (e) {
      alert("Analysis failed: " + e.message);
    }
    setLoading(false);
  };

  const scoreColor = result
    ? result.overallScore >= 70 ? "#4ade80"
    : result.overallScore >= 50 ? "#fbbf24" : "#f87171"
    : "#7c3aed";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Mono:wght@500&display=swap');
        .ra * { box-sizing: border-box; }
        .ra { min-height: 100vh; background: #0a0a12; color: #e2e8f0; font-family: 'Outfit', sans-serif; padding: 40px 48px; }
        .ra-back { display: inline-flex; align-items: center; gap: 6px; color: #64748b; font-size: 13px; text-decoration: none; margin-bottom: 28px; transition: color 0.2s; }
        .ra-back:hover { color: #a78bfa; }
        .ra-title { font-size: 30px; font-weight: 800; color: #f1f5f9; letter-spacing: -0.03em; margin-bottom: 6px; }
        .ra-sub { font-size: 14px; color: #64748b; margin-bottom: 32px; }
        .ra-layout { display: grid; grid-template-columns: 380px 1fr; gap: 24px; align-items: start; }

        .input-card { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 28px; display: flex; flex-direction: column; gap: 20px; }
        .card-section-title { font-size: 11px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }

        .upload-zone { border: 2px dashed rgba(124,58,237,0.35); border-radius: 14px; padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s; background: rgba(124,58,237,0.04); }
        .upload-zone.drag, .upload-zone:hover { border-color: #7c3aed; background: rgba(124,58,237,0.1); }
        .upload-icon { font-size: 28px; margin-bottom: 8px; }
        .upload-title { font-size: 14px; font-weight: 700; color: #e2e8f0; margin-bottom: 3px; }
        .upload-sub { font-size: 11px; color: #64748b; }
        .upload-types { display: flex; gap: 5px; justify-content: center; margin-top: 8px; }
        .type-badge { padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; }
        .upload-success { margin-top: 8px; display: inline-flex; align-items: center; gap: 5px; background: rgba(74,222,128,0.1); color: #4ade80; border: 1px solid rgba(74,222,128,0.2); padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 600; }

        .ra-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; display: block; }
        .ra-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 13px; color: #e2e8f0; font-size: 14px; font-family: 'Outfit', sans-serif; outline: none; transition: border-color 0.2s; }
        .ra-input:focus { border-color: rgba(124,58,237,0.4); }
        .ra-input::placeholder { color: #475569; }
        .ra-textarea { resize: none; min-height: 100px; }

        .num-input-wrap { display: flex; align-items: center; gap: 10px; }
        .num-btn { width: 36px; height: 36px; border-radius: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; font-size: 20px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; }
        .num-btn:hover { background: rgba(124,58,237,0.2); border-color: rgba(124,58,237,0.4); color: #c4b5fd; }
        .num-display { flex: 1; text-align: center; font-size: 24px; font-weight: 800; color: #c4b5fd; font-family: 'DM Mono', monospace; background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2); border-radius: 10px; padding: 6px 0; }

        .ra-divider { height: 1px; background: rgba(255,255,255,0.06); }

        .analyze-btn { width: 100%; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; border: none; border-radius: 12px; padding: 13px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Outfit', sans-serif; transition: all 0.2s; box-shadow: 0 0 20px rgba(124,58,237,0.3); }
        .analyze-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 32px rgba(124,58,237,0.5); }
        .analyze-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .results-panel { display: flex; flex-direction: column; gap: 16px; }
        .result-tabs { display: flex; gap: 4px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 4px; width: fit-content; }
        .rtab { padding: 7px 18px; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; font-family: 'Outfit', sans-serif; transition: all 0.2s; }
        .rtab.active { background: rgba(124,58,237,0.3); color: #e2e8f0; }
        .rtab:not(.active) { background: transparent; color: #64748b; }

        .score-hero { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 24px; display: flex; align-items: center; gap: 20px; }
        .score-ring { flex-shrink: 0; position: relative; width: 90px; height: 90px; display: flex; align-items: center; justify-content: center; }
        .score-num { font-size: 26px; font-weight: 900; font-family: 'DM Mono', monospace; }
        .score-label { font-size: 19px; font-weight: 800; color: #f1f5f9; margin-bottom: 5px; }
        .score-desc { font-size: 13px; color: #94a3b8; line-height: 1.6; }

        .result-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px; }
        .rc-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }
        .rc-list { display: flex; flex-direction: column; gap: 8px; }
        .rc-item { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #94a3b8; line-height: 1.5; }
        .rc-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }
        .tag-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .kw-tag { padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        .q-card { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 18px 20px; margin-bottom: 10px; display: flex; gap: 14px; align-items: flex-start; transition: all 0.2s; }
        .q-card:hover { border-color: rgba(124,58,237,0.25); background: rgba(124,58,237,0.04); }
        .q-num { width: 30px; height: 30px; border-radius: 8px; background: rgba(124,58,237,0.15); color: #a78bfa; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-family: 'DM Mono', monospace; }
        .q-text { font-size: 14px; color: #e2e8f0; line-height: 1.6; }

        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 320px; text-align: center; }
        .shimmer { background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 12px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      <div className="ra">
        <Link href="/InterviewDashboard" className="ra-back">← Dashboard</Link>
        <h1 className="ra-title">📄 Resume Analyzer</h1>
        <p className="ra-sub">Upload your resume to get AI-powered analysis and personalized interview questions</p>

        <div className="ra-layout">

          {/* INPUT PANEL */}
          <div className="input-card">

            {/* UPLOAD */}
            <div>
              <div className="card-section-title">📎 Your Resume</div>
              <div
                className={`upload-zone ${dragOver ? "drag" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.txt,.md,application/pdf,text/plain"
                  style={{ display: "none" }}
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                <div className="upload-icon">
                  {file ? (file.type === "application/pdf" ? "📕" : "📝") : "📎"}
                </div>
                <div className="upload-title">
                  {file ? file.name : "Drop your resume here"}
                </div>
                <div className="upload-sub">
                  {file ? `${(file.size / 1024).toFixed(1)} KB · Click to change` : "Click to browse or drag & drop"}
                </div>
                <div className="upload-types">
                  <span className="type-badge" style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>PDF</span>
                  <span className="type-badge" style={{ background: "rgba(96,165,250,0.12)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}>TXT</span>
                  <span className="type-badge" style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>MD</span>
                </div>
                {file && (
                  <div className="upload-success">
                    ✅ {file.type === "application/pdf" ? "PDF ready" : "File loaded"}
                  </div>
                )}
              </div>

              {(!file || file.type !== "application/pdf") && (
                <div style={{ marginTop: 10 }}>
                  <label className="ra-label">Or paste text</label>
                  <textarea
                    className="ra-input ra-textarea"
                    placeholder="Paste your resume content here..."
                    value={text === "__PDF__" ? "" : text}
                    onChange={(e) => { setText(e.target.value); setFile(null); }}
                  />
                </div>
              )}
            </div>

            <div className="ra-divider"/>

            {/* JOB ROLE */}
            <div>
              <div className="card-section-title">🎯 Target Role</div>
              <label className="ra-label">Job Position</label>
              <input
                className="ra-input"
                placeholder="e.g. Full Stack Developer, Product Manager..."
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <div className="ra-divider"/>

            {/* QUESTION COUNT */}
            <div>
              <div className="card-section-title">❓ Question Count</div>
              <label className="ra-label">Number of Questions to Generate</label>
              <div className="num-input-wrap">
                <button className="num-btn" onClick={() => setQuestionCount(p => Math.max(1, p - 1))}>−</button>
                <div className="num-display">{questionCount}</div>
                <button className="num-btn" onClick={() => setQuestionCount(p => Math.min(20, p + 1))}>+</button>
              </div>
            </div>

            <div className="ra-divider"/>

            <button
              className="analyze-btn"
              onClick={analyze}
              disabled={loading || (!text.trim() && !file) || !role.trim()}
            >
              {loading ? "🔍 Analyzing..." : "🚀 Analyze & Generate Questions"}
            </button>
          </div>

          {/* RESULTS PANEL */}
          <div className="results-panel">
            {!result && !loading && (
              <div className="empty-state">
                <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>
                  Your analysis will appear here
                </div>
                <div style={{ fontSize: 13, color: "#374151" }}>
                  Upload your resume and enter a target role to get started
                </div>
              </div>
            )}

            {loading && (
              <>
                <div className="shimmer" style={{ height: 110 }}/>
                <div className="two-col">
                  <div className="shimmer" style={{ height: 150 }}/>
                  <div className="shimmer" style={{ height: 150 }}/>
                </div>
                <div className="shimmer" style={{ height: 80 }}/>
                <div className="shimmer" style={{ height: 80 }}/>
                <div className="shimmer" style={{ height: 200 }}/>
              </>
            )}

            {result && !loading && (
              <>
                {/* TABS */}
                <div className="result-tabs">
                  <button
                    className={`rtab ${activeTab === "analysis" ? "active" : ""}`}
                    onClick={() => setActiveTab("analysis")}
                  >
                    📊 Analysis
                  </button>
                  <button
                    className={`rtab ${activeTab === "questions" ? "active" : ""}`}
                    onClick={() => setActiveTab("questions")}
                  >
                    ❓ Questions ({result.questions?.length || 0})
                  </button>
                </div>

                {/* ANALYSIS TAB */}
                {activeTab === "analysis" && (
                  <>
                    <div className="score-hero">
                      <div className="score-ring">
                        <svg width="90" height="90" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
                          <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
                          <circle cx="45" cy="45" r="38" fill="none" stroke={scoreColor} strokeWidth="7"
                            strokeDasharray={238.8}
                            strokeDashoffset={238.8 - (result.overallScore / 100) * 238.8}
                            strokeLinecap="round"
                            style={{ transition: "stroke-dashoffset 1.2s ease" }}
                          />
                        </svg>
                        <div className="score-num" style={{ color: scoreColor }}>{result.overallScore}</div>
                      </div>
                      <div>
                        <div className="score-label">Resume Score</div>
                        <div className="score-desc">{result.summary}</div>
                      </div>
                    </div>

                    <div className="two-col">
                      <div className="result-card">
                        <div className="rc-title" style={{ color: "#4ade80" }}>✅ Strengths</div>
                        <div className="rc-list">
                          {result.strengths?.map((s, i) => (
                            <div key={i} className="rc-item">
                              <div className="rc-dot" style={{ background: "#4ade80" }}/>{s}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="result-card">
                        <div className="rc-title" style={{ color: "#f87171" }}>⚠️ Improvements</div>
                        <div className="rc-list">
                          {result.improvements?.map((s, i) => (
                            <div key={i} className="rc-item">
                              <div className="rc-dot" style={{ background: "#f87171" }}/>{s}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="result-card">
                      <div className="rc-title" style={{ color: "#60a5fa" }}>🏷️ Detected Keywords</div>
                      <div className="tag-row">
                        {result.keywords?.map((k, i) => (
                          <span key={i} className="kw-tag" style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}>
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="result-card">
                      <div className="rc-title" style={{ color: "#fbbf24" }}>⚡ Add These Keywords</div>
                      <div className="tag-row">
                        {result.missingKeywords?.map((k, i) => (
                          <span key={i} className="kw-tag" style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* QUESTIONS TAB */}
                {activeTab === "questions" && (
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 13, color: "#64748b" }}>
                        {result.questions?.length} questions generated for{" "}
                        <span style={{ color: "#c4b5fd", fontWeight: 600 }}>{role}</span>
                      </div>
                    </div>
                    {result.questions?.map((q, i) => (
                      <div key={i} className="q-card">
                        <div className="q-num">{i + 1}</div>
                        <div className="q-text">
                          {typeof q === "string" ? q : q.question}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}