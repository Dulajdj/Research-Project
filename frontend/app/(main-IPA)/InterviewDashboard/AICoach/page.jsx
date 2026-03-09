"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const TIPS = [
  { icon: "🎯", title: "STAR Method", desc: "For behavioral questions, structure answers as: Situation → Task → Action → Result. Keep each part concise and focused on your direct contribution.", category: "Technique" },
  { icon: "🗣️", title: "Eliminate Filler Words", desc: "Replace 'um', 'uh', 'like' with a confident pause. Practice recording yourself — you'll quickly identify habits to fix.", category: "Communication" },
  { icon: "⏱️", title: "Answer Length", desc: "Target 90–120 seconds per answer. Too short shows lack of depth; too long loses the interviewer. Practice with a timer.", category: "Delivery" },
  { icon: "🔢", title: "Quantify Achievements", desc: "Weak: 'I improved performance.' Strong: 'I reduced load time by 40%, handling 2M daily requests.' Numbers make impact tangible.", category: "Content" },
  { icon: "🤔", title: "Think Before Speaking", desc: "It's perfectly acceptable to say 'Let me think about that for a moment.' 5 seconds of silence beats a rambling response.", category: "Mindset" },
  { icon: "💡", title: "Mirror the Job Description", desc: "Identify 3–5 key skills from the JD. Weave them into your answers naturally. This proves cultural and technical fit.", category: "Strategy" },
  { icon: "👁️", title: "Eye Contact in Video", desc: "Look at the camera lens, not the screen. It creates the illusion of direct eye contact and signals confidence.", category: "Virtual" },
  { icon: "🔁", title: "Rephrase the Question", desc: "Before answering complex questions, briefly rephrase: 'So you're asking about...' — this buys thinking time and confirms understanding.", category: "Technique" },
];

const PROMPTS = [
  "How do I answer 'What is your greatest weakness?'",
  "What's the best way to negotiate salary?",
  "How should I prepare for a system design interview?",
  "How do I handle a question I don't know the answer to?",
  "Give me tips for virtual/remote interviews",
];

export default function AICoach() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your AI Interview Coach. Ask me anything about interview preparation — techniques, common questions, salary negotiation, or industry-specific tips. I'm here to help you land that job! 🎯" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text) => {
  const q = text || input;
  if (!q.trim()) return;
  setInput("");

  const newMessages = [...messages, { role: "user", text: q }];
  setMessages(newMessages);
  setLoading(true);

  try {
    const res = await fetch("http://localhost:5000/api/ai/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: newMessages
          .filter(m => m.role === "user" || m.role === "assistant")
          .map(m => ({ role: m.role, content: m.text }))
      })
    });
    const data = await res.json();
    setMessages(p => [...p, { role: "assistant", text: data.reply }]);
  } catch {
    setMessages(p => [...p, { role: "assistant", text: "Connection issue. Please try again." }]);
  }
  setLoading(false);
};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        .ac * { box-sizing: border-box; }
        .ac { min-height: 100vh; background: #0a0a12; color: #e2e8f0; font-family: 'Outfit', sans-serif; padding: 40px 48px; display: flex; flex-direction: column; }
        .ac-back { display: inline-flex; align-items: center; gap: 6px; color: #64748b; font-size: 13px; text-decoration: none; margin-bottom: 28px; transition: color 0.2s; }
        .ac-back:hover { color: #a78bfa; }
        .ac-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .ac-title { font-size: 30px; font-weight: 800; color: #f1f5f9; letter-spacing: -0.03em; }
        .ac-sub { font-size: 14px; color: #64748b; margin-top: 4px; }

        .tabs { display: flex; gap: 4px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 4px; width: fit-content; margin-bottom: 24px; }
        .tab-btn { padding: 8px 20px; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; font-family: 'Outfit', sans-serif; transition: all 0.2s; }
        .tab-btn.active { background: rgba(124,58,237,0.3); color: #e2e8f0; }
        .tab-btn:not(.active) { background: transparent; color: #64748b; }

        .chat-layout { display: grid; grid-template-columns: 1fr 280px; gap: 20px; flex: 1; }
        .chat-box { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; display: flex; flex-direction: column; height: 560px; }
        .chat-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 14px; scrollbar-width: thin; scrollbar-color: rgba(124,58,237,0.3) transparent; }
        .msg { max-width: 85%; }
        .msg.user { align-self: flex-end; }
        .msg.assistant { align-self: flex-start; }
        .msg-bubble { padding: 12px 16px; border-radius: 14px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
        .msg.user .msg-bubble { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; border-bottom-right-radius: 4px; }
        .msg.assistant .msg-bubble { background: rgba(255,255,255,0.06); color: #e2e8f0; border-bottom-left-radius: 4px; border: 1px solid rgba(255,255,255,0.08); }
        .msg-label { font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px; letter-spacing: 0.06em; text-transform: uppercase; }
        .msg.user .msg-label { text-align: right; }

        .chat-input-row { padding: 14px 16px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; gap: 8px; }
        .chat-input { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 14px; color: #e2e8f0; font-size: 14px; font-family: 'Outfit', sans-serif; outline: none; transition: border-color 0.2s; }
        .chat-input:focus { border-color: rgba(124,58,237,0.4); }
        .chat-send { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; border: none; border-radius: 10px; padding: 10px 18px; font-weight: 700; font-size: 13px; cursor: pointer; font-family: 'Outfit', sans-serif; transition: opacity 0.2s; }
        .chat-send:hover { opacity: 0.9; }
        .chat-send:disabled { opacity: 0.5; cursor: not-allowed; }

        .prompts-panel { display: flex; flex-direction: column; gap: 10px; }
        .prompt-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 12px 14px; cursor: pointer; font-size: 13px; color: #94a3b8; transition: all 0.18s; line-height: 1.5; }
        .prompt-card:hover { background: rgba(124,58,237,0.1); color: #c4b5fd; border-color: rgba(124,58,237,0.25); }
        .prompts-label { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }

        .tips-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        @media (min-width: 1200px) { .tips-grid { grid-template-columns: repeat(3, 1fr); } }
        .tip-card { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 20px; transition: all 0.2s; }
        .tip-card:hover { border-color: rgba(124,58,237,0.25); transform: translateY(-2px); }
        .tip-icon { font-size: 28px; margin-bottom: 10px; }
        .tip-cat { font-size: 10px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
        .tip-title { font-size: 15px; font-weight: 700; color: #f1f5f9; margin-bottom: 8px; }
        .tip-desc { font-size: 13px; color: #94a3b8; line-height: 1.65; }

        .typing { display: flex; gap: 4px; align-items: center; padding: 4px 0; }
        .typing-dot { width: 7px; height: 7px; background: #7c3aed; border-radius: 50%; animation: td 1.2s infinite; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes td { 0%,80%,100% { transform: scale(0.7); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
      `}</style>

      <div className="ac">
        <Link href="/InterviewDashboard" className="ac-back">← Dashboard</Link>
        <div className="ac-header">
          <div>
            <h1 className="ac-title">🤖 AI Coach</h1>
            <p className="ac-sub">Personalized interview coaching powered by AI</p>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab-btn ${activeTab === "chat" ? "active" : ""}`} onClick={() => setActiveTab("chat")}>💬 Chat Coach</button>
          <button className={`tab-btn ${activeTab === "tips" ? "active" : ""}`} onClick={() => setActiveTab("tips")}>💡 Quick Tips</button>
        </div>

        {activeTab === "chat" && (
          <div className="chat-layout">
            <div className="chat-box">
              <div className="chat-messages">
                {messages.map((m, i) => (
                  <div key={i} className={`msg ${m.role}`}>
                    <div className="msg-label">{m.role === "assistant" ? "🤖 AI Coach" : "You"}</div>
                    <div className="msg-bubble">{m.text}</div>
                  </div>
                ))}
                {loading && (
                  <div className="msg assistant">
                    <div className="msg-label">🤖 AI Coach</div>
                    <div className="msg-bubble"><div className="typing"><div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/></div></div>
                  </div>
                )}
                <div ref={bottomRef}/>
              </div>
              <div className="chat-input-row">
                <input
                  className="chat-input"
                  placeholder="Ask anything about interview prep..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                />
                <button className="chat-send" onClick={() => send()} disabled={loading || !input.trim()}>Send →</button>
              </div>
            </div>

            <div className="prompts-panel">
              <div className="prompts-label">Suggested Questions</div>
              {PROMPTS.map((p, i) => (
                <div key={i} className="prompt-card" onClick={() => send(p)}>{p}</div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "tips" && (
          <div className="tips-grid">
            {TIPS.map((t, i) => (
              <div key={i} className="tip-card">
                <div className="tip-icon">{t.icon}</div>
                <div className="tip-cat">{t.category}</div>
                <div className="tip-title">{t.title}</div>
                <div className="tip-desc">{t.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}