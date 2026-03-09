"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function PracticeMode() {
  const [jobRole, setJobRole] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [micOn, setMicOn] = useState(false);
  const [interim, setInterim] = useState("");
  const [phase, setPhase] = useState("setup"); // setup | loading | practice | scoring | done
  const [timeLeft, setTimeLeft] = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  const [scores, setScores] = useState(null);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const savedJobRole = useRef("");

  const MIN_QUESTIONS = 1;
  const MAX_QUESTIONS = 20;

  // ===================== TIMER =====================
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft === 0 && timerActive) {
      handleNext();
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timeLeft]);

  // ===================== GENERATE QUESTIONS — calls backend =====================
  const startPractice = async (role, count) => {
    const useRole = role || jobRole;
    const useCount = count || questionCount;

    if (!useRole.trim()) {
      alert("Please enter a job role first.");
      return;
    }

    savedJobRole.current = useRole;
    setPhase("loading");

    try {
      const res = await fetch("http://localhost:5000/api/interview/practice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobRole: useRole, questionCount: useCount })
      });

      if (!res.ok) throw new Error("Backend error: " + res.status);

      const data = await res.json();

      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions returned");
      }

      setQuestions(data.questions);
      setAnswers([]);
      setCurrent(0);
      setAnswer("");
      setInterim("");
      setTimeLeft(120);
      setScores(null);
      setTimerActive(true);
      setPhase("practice");

    } catch (err) {
      console.error("Generate error:", err);
      alert("Failed to generate questions. Please check your backend is running and try again.");
      setPhase("setup");
    }
  };

  // ===================== NEXT QUESTION =====================
  const handleNext = () => {
    clearInterval(timerRef.current);
    setTimerActive(false);
    recognitionRef.current?.stop();
    setMicOn(false);

    const finalAnswer = (answer + " " + interim).trim() || "Skipped";
    const saved = [...answers, { q: questions[current], a: finalAnswer, skipped: finalAnswer === "Skipped" }];
    setAnswers(saved);
    setAnswer("");
    setInterim("");

    if (current < questions.length - 1) {
      setCurrent(p => p + 1);
      setTimeLeft(120);
      setTimeout(() => setTimerActive(true), 100);
    } else {
      setTimerActive(false);
      setPhase("scoring");
      scoreAnswers(saved);
    }
  };

  // ===================== SCORE ANSWERS — calls backend =====================
  const scoreAnswers = async (savedAnswers) => {
    try {
      const res = await fetch("http://localhost:5000/api/interview/practice/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: savedJobRole.current,
          questions: savedAnswers.map(a => a.q),
          answers: savedAnswers.map(a => a.a)
        })
      });

      if (!res.ok) throw new Error("Scoring backend error");

      const data = await res.json();
      setScores(data);

    } catch (err) {
      console.error("Score error:", err);
      setScores({ totalScore: 0, feedback: "Could not generate score. Please try again.", reviews: [] });
    }

    setPhase("done");
  };

  // ===================== MIC =====================
  const toggleMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Use Chrome for speech recognition.");
    if (micOn) {
      recognitionRef.current?.stop();
      setMicOn(false);
      setInterim("");
      return;
    }

    const r = new SR();
    r.lang = "en-US";
    r.continuous = true;
    r.interimResults = true;
    let final = answer;

    r.onresult = e => {
      let itr = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) { final += e.results[i][0].transcript + " "; setAnswer(final); }
        else itr += e.results[i][0].transcript;
      }
      setInterim(itr);
    };
    r.onend = () => { if (micOn) { try { r.start(); } catch {} } };
    r.start();
    recognitionRef.current = r;
    setMicOn(true);
  };

  // ===================== STEPPER HANDLERS =====================
  const decreaseCount = () => setQuestionCount(prev => Math.max(MIN_QUESTIONS, prev - 1));
  const increaseCount = () => setQuestionCount(prev => Math.min(MAX_QUESTIONS, prev + 1));

  const timerPct = (timeLeft / 120) * 100;
  const timerColor = timeLeft > 60 ? "#4ade80" : timeLeft > 30 ? "#facc15" : "#f87171";
  const totalScore = scores?.totalScore ?? 0;
  const scoreColor = totalScore >= 70 ? "#4ade80" : totalScore >= 50 ? "#facc15" : "#f87171";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        .pm * { box-sizing: border-box; }
        .pm { min-height: 100vh; background: #0a0a12; color: #e2e8f0; font-family: 'Outfit', sans-serif; padding: 40px 48px; }
        .pm-back { display: inline-flex; align-items: center; gap: 6px; color: #64748b; font-size: 13px; text-decoration: none; margin-bottom: 28px; transition: color 0.2s; }
        .pm-back:hover { color: #a78bfa; }
        .pm-title { font-size: 30px; font-weight: 800; color: #f1f5f9; letter-spacing: -0.03em; margin-bottom: 6px; }
        .pm-sub { font-size: 14px; color: #64748b; margin-bottom: 32px; }

        .setup-card { background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2); border-radius: 24px; padding: 48px; max-width: 560px; margin: 0 auto; }
        .setup-icon { font-size: 52px; margin-bottom: 16px; text-align: center; }
        .setup-title { font-size: 22px; font-weight: 800; color: #f1f5f9; margin-bottom: 8px; text-align: center; }
        .setup-desc { font-size: 14px; color: #64748b; margin-bottom: 28px; line-height: 1.6; text-align: center; }
        .setup-label { font-size: 13px; font-weight: 600; color: #94a3b8; margin-bottom: 8px; display: block; }
        .setup-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 13px 16px; color: #f1f5f9; font-size: 15px; font-family: 'Outfit', sans-serif; outline: none; transition: border-color 0.2s; margin-bottom: 20px; }
        .setup-input:focus { border-color: rgba(124,58,237,0.5); }
        .setup-input::placeholder { color: #475569; }

        /* ── Stepper ── */
        .stepper-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
        .stepper { display: flex; align-items: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; }
        .stepper-btn { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700; cursor: pointer; border: none; background: transparent; color: #94a3b8; font-family: 'Outfit', sans-serif; transition: background 0.15s, color 0.15s; user-select: none; line-height: 1; }
        .stepper-btn:hover:not(:disabled) { background: rgba(124,58,237,0.22); color: #c4b5fd; }
        .stepper-btn:active:not(:disabled) { background: rgba(124,58,237,0.35); }
        .stepper-btn:disabled { opacity: 0.25; cursor: not-allowed; }
        .stepper-divider { width: 1px; height: 26px; background: rgba(255,255,255,0.1); flex-shrink: 0; }
        .stepper-val { min-width: 72px; text-align: center; font-size: 18px; font-weight: 800; color: #c4b5fd; font-family: 'DM Mono', monospace; padding: 0 4px; }
        .stepper-hint { font-size: 12px; color: #475569; }

        .start-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: linear-gradient(135deg,#7c3aed,#4f46e5); color: white; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; border: none; font-family: 'Outfit', sans-serif; transition: all 0.2s; box-shadow: 0 0 24px rgba(124,58,237,0.35); }
        .start-btn:hover { transform: translateY(-2px); box-shadow: 0 0 36px rgba(124,58,237,0.5); }
        .start-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 40vh; gap: 16px; }
        .spinner { width: 44px; height: 44px; border: 3px solid rgba(124,58,237,0.2); border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text { font-size: 15px; color: #64748b; }

        .practice-layout { display: grid; grid-template-columns: 1fr 360px; gap: 20px; }
        .q-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 32px; }
        .q-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .q-num { font-size: 12px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.1em; }
        .q-role-badge { font-size: 11px; font-weight: 700; color: #a78bfa; background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.25); padding: 4px 10px; border-radius: 999px; }
        .q-timer-wrap { display: flex; align-items: center; gap: 8px; }
        .q-timer { font-size: 18px; font-weight: 800; font-family: 'DM Mono', monospace; }
        .q-text { font-size: 20px; font-weight: 700; color: #f1f5f9; line-height: 1.5; margin-bottom: 24px; }
        .q-textarea { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 16px; color: #e2e8f0; font-size: 14px; font-family: 'Outfit', sans-serif; resize: none; outline: none; transition: border-color 0.2s; }
        .q-textarea:focus { border-color: rgba(124,58,237,0.4); }
        .q-actions { display: flex; gap: 10px; margin-top: 16px; }
        .mic-btn { display: flex; align-items: center; gap: 7px; padding: 10px 18px; border-radius: 10px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; font-family: 'Outfit', sans-serif; transition: all 0.2s; }
        .next-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; padding: 10px 18px; border-radius: 10px; border: none; cursor: pointer; font-size: 14px; font-weight: 700; font-family: 'Outfit', sans-serif; background: linear-gradient(135deg,#7c3aed,#4f46e5); color: white; transition: all 0.2s; }
        .next-btn:hover { opacity: 0.9; }

        .sidebar-panel { display: flex; flex-direction: column; gap: 16px; }
        .side-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 24px; }
        .side-title { font-size: 13px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; }
        .q-dot-row { display: flex; gap: 6px; flex-wrap: wrap; }
        .q-dot { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; font-family: 'DM Mono', monospace; }

        .score-hero { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 36px; text-align: center; margin-bottom: 20px; }
        .score-big { font-size: 72px; font-weight: 900; font-family: 'DM Mono', monospace; line-height: 1; }
        .done-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 28px; margin-bottom: 14px; }
        .done-q { font-size: 15px; font-weight: 700; color: #c4b5fd; margin-bottom: 10px; }
        .done-a-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
        .done-a { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 12px; }
        .done-ideal-label { font-size: 11px; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
        .done-ideal { font-size: 13px; color: #6ee7b7; line-height: 1.6; margin-bottom: 10px; }
        .done-score-badge { border-radius: 8px; padding: 4px 12px; font-size: 13px; font-weight: 800; font-family: 'DM Mono', monospace; flex-shrink: 0; }
        .done-comment { font-size: 13px; color: #64748b; }
        .action-row { display: flex; gap: 10px; justify-content: center; margin-bottom: 28px; flex-wrap: wrap; }
        .action-btn-primary { padding: 12px 24px; border-radius: 12px; border: none; background: linear-gradient(135deg,#7c3aed,#4f46e5); color: white; font: 700 14px 'Outfit',sans-serif; cursor: pointer; transition: all 0.2s; }
        .action-btn-primary:hover { transform: translateY(-1px); }
        .action-btn-ghost { padding: 12px 24px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #94a3b8; font: 700 14px 'Outfit',sans-serif; cursor: pointer; }
        .action-btn-ghost:hover { background: rgba(255,255,255,0.08); }
      `}</style>

      <div className="pm">
        <Link href="/InterviewDashboard" className="pm-back">← Back to Dashboard</Link>
        <h1 className="pm-title">🎯 Practice Mode</h1>
        <p className="pm-sub">Generate role-specific questions and practice with a 2-minute timer per question</p>

        {/* ===================== SETUP ===================== */}
        {phase === "setup" && (
          <div className="setup-card">
            <div className="setup-icon">🎙️</div>
            <div className="setup-title">Set Up Your Practice Session</div>
            <div className="setup-desc">
              Enter your target job role to get AI-generated questions tailored specifically to that position.
            </div>

            <label className="setup-label">Job Role / Position</label>
            <input
              className="setup-input"
              type="text"
              placeholder="e.g. Frontend Developer, Data Analyst, UX Designer..."
              value={jobRole}
              onChange={e => setJobRole(e.target.value)}
              onKeyDown={e => e.key === "Enter" && startPractice()}
            />

            <label className="setup-label">Number of Questions</label>
            <div className="stepper-wrap">
              <div className="stepper">
                <button
                  className="stepper-btn"
                  onClick={decreaseCount}
                  disabled={questionCount <= MIN_QUESTIONS}
                  aria-label="Decrease question count"
                >
                  −
                </button>
                <div className="stepper-divider" />
                <div className="stepper-val">{questionCount}</div>
                <div className="stepper-divider" />
                <button
                  className="stepper-btn"
                  onClick={increaseCount}
                  disabled={questionCount >= MAX_QUESTIONS}
                  aria-label="Increase question count"
                >
                  +
                </button>
              </div>
              <span className="stepper-hint">
                {questionCount === MIN_QUESTIONS
                  ? "Minimum reached"
                  : questionCount === MAX_QUESTIONS
                  ? "Maximum reached"
                  : `${MIN_QUESTIONS}–${MAX_QUESTIONS} questions`}
              </span>
            </div>

            <button
              className="start-btn"
              onClick={() => startPractice()}
              disabled={!jobRole.trim()}
            >
              ▶ Generate & Start Practice
            </button>
          </div>
        )}

        {/* ===================== LOADING ===================== */}
        {phase === "loading" && (
          <div className="loading-wrap">
            <div className="spinner" />
            <div className="loading-text">
              Generating {questionCount} questions for <strong style={{ color: "#a78bfa" }}>{savedJobRole.current || jobRole}</strong>...
            </div>
          </div>
        )}

        {/* ===================== PRACTICE ===================== */}
        {phase === "practice" && questions.length > 0 && (
          <div className="practice-layout">
            <div className="q-card">
              <div className="q-meta">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div className="q-num">Question {current + 1} of {questions.length}</div>
                  <div className="q-role-badge">🎯 {savedJobRole.current}</div>
                </div>
                <div className="q-timer-wrap">
                  <svg width="28" height="28" viewBox="0 0 28 28" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3"/>
                    <circle cx="14" cy="14" r="11" fill="none" stroke={timerColor} strokeWidth="3"
                      strokeDasharray={69.1}
                      strokeDashoffset={69.1 - (timerPct / 100) * 69.1}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }}
                    />
                  </svg>
                  <div className="q-timer" style={{ color: timerColor }}>
                    {String(Math.floor(timeLeft / 60)).padStart(2,"0")}:{String(timeLeft % 60).padStart(2,"0")}
                  </div>
                </div>
              </div>

              <div className="q-text">{questions[current]}</div>

              <textarea
                className="q-textarea"
                rows={6}
                placeholder={micOn ? "🎤 Listening... speak your answer" : "Type your answer here..."}
                value={answer + (interim ? ` ${interim}` : "")}
                onChange={e => setAnswer(e.target.value)}
              />

              <div className="q-actions">
                <button
                  className="mic-btn"
                  onClick={toggleMic}
                  style={{
                    background: micOn ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)",
                    color: micOn ? "#f87171" : "#94a3b8",
                    border: `1px solid ${micOn ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.1)"}`
                  }}
                >
                  {micOn ? "⏹ Stop" : "🎤 Speak"}
                </button>
                <button className="next-btn" onClick={handleNext}>
                  {current < questions.length - 1 ? "Next Question →" : "Finish & Get Score ✓"}
                </button>
              </div>
            </div>

            <div className="sidebar-panel">
              <div className="side-card">
                <div className="side-title">Session Progress</div>
                <div className="q-dot-row">
                  {questions.map((_, i) => (
                    <div key={i} className="q-dot" style={{
                      background: i < current ? "rgba(74,222,128,0.15)" : i === current ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.04)",
                      color: i < current ? "#4ade80" : i === current ? "#c4b5fd" : "#475569",
                      border: `1px solid ${i < current ? "rgba(74,222,128,0.3)" : i === current ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.06)"}`
                    }}>
                      {i < current ? "✓" : i + 1}
                    </div>
                  ))}
                </div>
              </div>

              <div className="side-card" style={{ textAlign: "center" }}>
                <div className="side-title">Time Remaining</div>
                <div style={{ fontSize: 42, fontWeight: 800, fontFamily: "'DM Mono',monospace", color: timerColor }}>
                  {String(Math.floor(timeLeft / 60)).padStart(2,"0")}:{String(timeLeft % 60).padStart(2,"0")}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>2 minutes per question</div>
              </div>

              <div className="side-card">
                <div className="side-title">Tips</div>
                <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.8 }}>
                  💡 Use the STAR method for experience questions<br/>
                  🎤 Speaking aloud builds real confidence<br/>
                  ⏱ Don't overthink — practice natural delivery<br/>
                  🎯 Keep answers focused on <strong style={{ color: "#a78bfa" }}>{savedJobRole.current}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== SCORING ===================== */}
        {phase === "scoring" && (
          <div className="loading-wrap">
            <div className="spinner" />
            <div className="loading-text">
              Analyzing your answers for <strong style={{ color: "#a78bfa" }}>{savedJobRole.current}</strong>...
            </div>
          </div>
        )}

        {/* ===================== DONE ===================== */}
        {phase === "done" && scores && (
          <div>
            <div className="score-hero">
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
                Practice Score — {savedJobRole.current}
              </div>
              <div className="score-big" style={{ color: scoreColor }}>{totalScore}</div>
              <div style={{ fontSize: 16, color: "#64748b", margin: "6px 0 16px" }}>out of 100</div>
              <div style={{ fontSize: 14, color: "#94a3b8", maxWidth: 500, margin: "0 auto 24px", lineHeight: 1.7 }}>
                {scores.feedback}
              </div>
              <div className="action-row">
                <button className="action-btn-primary" onClick={() => { setPhase("setup"); setJobRole(""); }}>
                  🔄 New Practice Session
                </button>
                <button className="action-btn-ghost" onClick={() => startPractice(savedJobRole.current, questionCount)}>
                  ↺ Same Role Again
                </button>
              </div>
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", marginBottom: 16 }}>📝 Question Review</h2>
            {answers.map((item, i) => {
              const review = scores.reviews?.[i];
              const qScore = review?.score ?? 0;
              const qColor = qScore >= 7 ? "#4ade80" : qScore >= 5 ? "#facc15" : "#f87171";
              return (
                <div key={i} className="done-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div className="done-q">Q{i + 1}: {item.q}</div>
                    {review && (
                      <div className="done-score-badge" style={{
                        color: qColor,
                        borderColor: `${qColor}40`,
                        background: `${qColor}15`,
                        border: `1px solid ${qColor}40`,
                        marginLeft: 12
                      }}>
                        {qScore}/10
                      </div>
                    )}
                  </div>

                  <div className="done-a-label">Your Answer</div>
                  <div className="done-a" style={{ color: item.skipped ? "#ef4444" : "#94a3b8" }}>
                    {item.a}
                  </div>

                  {review?.idealAnswer && (
                    <>
                      <div className="done-ideal-label">Ideal Answer</div>
                      <div className="done-ideal">{review.idealAnswer}</div>
                    </>
                  )}

                  {review?.comment && (
                    <div className="done-comment">💬 {review.comment}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}