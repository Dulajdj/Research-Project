"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ─── Default settings ────────────────────────────────────────────────────────
export const DEFAULT_SETTINGS = {
  // Interview
  autoSpeak: true,
  voiceSpeed: 0.9,
  voiceGender: "female",
  showTimer: true,
  timerDuration: 120,
  autoNext: false,
  // Appearance
  accentColor: "purple",
  fontSize: "medium",
  compactMode: false,
  animations: true,
  // Notifications
  emailNotifs: false,
  practiceReminder: true,
  reminderFreq: "daily",
  sessionAlerts: true,
  // Privacy
  saveHistory: true,
  analytics: true,
  shareData: false,
};

// ─── Hook — use anywhere in the app to read settings ─────────────────────────
export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("voiceprep_settings");
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
    } catch {}
  }, []);
  return settings;
}

// ─── Save helper ──────────────────────────────────────────────────────────────
function persistSettings(s) {
  try { localStorage.setItem("voiceprep_settings", JSON.stringify(s)); } catch {}
}

// ─── Apply appearance side-effects immediately ───────────────────────────────
function applyAppearance(s) {
  const root = document.documentElement;
  const accentMap = {
    purple:  "#7c3aed",
    blue:    "#2563eb",
    cyan:    "#0891b2",
    green:   "#059669",
    rose:    "#e11d48",
    amber:   "#d97706",
  };
  const fontMap = { small: "13px", medium: "15px", large: "17px" };
  root.style.setProperty("--accent",      accentMap[s.accentColor] || accentMap.purple);
  root.style.setProperty("--base-font",   fontMap[s.fontSize]      || fontMap.medium);
  root.style.setProperty("--compact-gap", s.compactMode ? "8px" : "16px");
  if (!s.animations) {
    root.style.setProperty("--transition-speed", "0ms");
  } else {
    root.style.removeProperty("--transition-speed");
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Toggle({ value, onChange, accent = "#7c3aed" }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 48, height: 26, borderRadius: 999, cursor: "pointer", flexShrink: 0,
        background: value ? `linear-gradient(135deg,${accent},#4f46e5)` : "rgba(255,255,255,0.08)",
        border: `1px solid ${value ? accent + "80" : "rgba(255,255,255,0.1)"}`,
        position: "relative", transition: "all 0.25s ease",
        boxShadow: value ? `0 0 14px ${accent}55` : "none",
      }}
    >
      <div style={{
        position: "absolute", top: 3,
        left: value ? 25 : 3,
        width: 18, height: 18, borderRadius: "50%",
        background: "white",
        transition: "left 0.25s cubic-bezier(.4,0,.2,1)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)"
      }}/>
    </div>
  );
}

function Slider({ value, min, max, step, onChange, formatLabel, accent = "#7c3aed" }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{
          width: "100%", height: 4, borderRadius: 999, outline: "none", cursor: "pointer",
          background: `linear-gradient(to right, ${accent} ${pct}%, rgba(255,255,255,0.08) ${pct}%)`,
          WebkitAppearance: "none", appearance: "none", border: "none",
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontSize: 11, color: "#334155" }}>{formatLabel(min)}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#c4b5fd", fontFamily: "'DM Mono',monospace" }}>{formatLabel(value)}</span>
        <span style={{ fontSize: 11, color: "#334155" }}>{formatLabel(max)}</span>
      </div>
    </div>
  );
}

function SettingSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background: "#12101e", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 9, padding: "7px 30px 7px 12px", color: "#e2e8f0",
        fontSize: 13, fontFamily: "'Outfit',sans-serif", outline: "none",
        cursor: "pointer", minWidth: 140, WebkitAppearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value} style={{ background: "#12101e" }}>{o.label}</option>
      ))}
    </select>
  );
}

function Section({ icon, title, subtitle, accent = "#7c3aed", children }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.022)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 20, overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "18px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: `linear-gradient(135deg, ${accent}12, transparent 60%)`,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11, flexShrink: 0,
          background: `${accent}1a`, border: `1px solid ${accent}30`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}>{icon}</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: "#475569", marginTop: 1 }}>{subtitle}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Row({ label, desc, last, children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 24px", gap: 20,
      borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.04)",
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#e2e8f0" }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function SliderRow({ label, desc, last, accent, ...sliderProps }) {
  return (
    <div style={{
      padding: "16px 24px",
      borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.04)",
    }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#e2e8f0" }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{desc}</div>}
      </div>
      <Slider accent={accent} {...sliderProps} />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Settings() {
  const [s, setS] = useState(DEFAULT_SETTINGS);
  const [status, setStatus] = useState("idle"); // idle | saved | error
  const [unsaved, setUnsaved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("voiceprep_settings");
      if (raw) {
        const loaded = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
        setS(loaded);
        applyAppearance(loaded);
      }
    } catch {}
  }, []);

  // Single updater — marks unsaved
  const update = (key, value) => {
    setS(prev => ({ ...prev, [key]: value }));
    setUnsaved(true);
    // Apply appearance changes immediately (live preview)
    if (["accentColor","fontSize","compactMode","animations"].includes(key)) {
      applyAppearance({ ...s, [key]: value });
    }
  };

  const handleSave = () => {
    try {
      persistSettings(s);
      applyAppearance(s);
      setStatus("saved");
      setUnsaved(false);
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
    }
  };

  const handleReset = (scope) => {
    const confirmMap = {
      history:   "This will permanently delete all past interview results.",
      progress:  "This will wipe all progress charts and statistics.",
      questions: "This will remove all bookmarked questions.",
      settings:  "This will restore ALL settings to factory defaults.",
    };
    if (!confirm(confirmMap[scope])) return;
    if (scope === "history")   { localStorage.removeItem("interviewHistory"); }
    if (scope === "progress")  { localStorage.removeItem("progressData"); }
    if (scope === "questions") { localStorage.removeItem("savedQuestions"); }
    if (scope === "settings")  {
      localStorage.removeItem("voiceprep_settings");
      setS(DEFAULT_SETTINGS);
      applyAppearance(DEFAULT_SETTINGS);
      setUnsaved(false);
    }
    alert("Done! " + confirmMap[scope].replace("This will ", "").replace(".", " completed."));
  };

  const accentHex = {
    purple: "#7c3aed", blue: "#2563eb", cyan: "#0891b2",
    green: "#059669",  rose: "#e11d48", amber: "#d97706",
  }[s.accentColor] || "#7c3aed";

  const accents = [
    { value: "purple", color: "#7c3aed" },
    { value: "blue",   color: "#2563eb" },
    { value: "cyan",   color: "#0891b2" },
    { value: "green",  color: "#059669" },
    { value: "rose",   color: "#e11d48" },
    { value: "amber",  color: "#d97706" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        .sp * { box-sizing: border-box; margin: 0; padding: 0; }
        .sp {
          min-height: 100vh; background: #07070f;
          font-family: 'Outfit', sans-serif; color: #e2e8f0;
          padding: 40px 48px 80px; position: relative;
        }
        .sp::before {
          content: ''; position: fixed; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 600px 500px at 80% -10%, rgba(124,58,237,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 400px 400px at 10% 90%, rgba(56,189,248,0.04) 0%, transparent 70%);
        }
        .sp-wrap { position: relative; z-index: 1; max-width: 840px; margin: 0 auto; }
        .sp-back {
          display: inline-flex; align-items: center; gap: 6px;
          color: #475569; font-size: 13px; text-decoration: none;
          margin-bottom: 36px; transition: color 0.2s;
        }
        .sp-back:hover { color: #a78bfa; }
        .sp-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .sp-eyebrow { font-size: 11px; font-weight: 700; color: #7c3aed; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px; }
        .sp-title { font-size: 38px; font-weight: 800; color: #f8fafc; letter-spacing: -0.04em; line-height: 1; }
        .sp-title em { font-style: normal; background: linear-gradient(130deg, #a78bfa 0%, #38bdf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .sp-sub { font-size: 14px; color: #475569; margin-top: 8px; }
        .sp-grid { display: flex; flex-direction: column; gap: 14px; }

        .sp-save-btn {
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: white; border: none; border-radius: 12px;
          padding: 11px 24px; font-size: 14px; font-weight: 700;
          font-family: 'Outfit', sans-serif; cursor: pointer;
          box-shadow: 0 0 20px rgba(124,58,237,0.3); transition: all 0.2s;
          display: flex; align-items: center; gap: 8px; position: relative;
        }
        .sp-save-btn:hover { transform: translateY(-2px); box-shadow: 0 0 32px rgba(124,58,237,0.5); }
        .unsaved-dot {
          position: absolute; top: -4px; right: -4px;
          width: 10px; height: 10px; border-radius: 50%;
          background: #f59e0b; border: 2px solid #07070f;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }

        .sp-toast {
          display: flex; align-items: center; gap: 8px;
          border-radius: 12px; padding: 11px 20px; font-size: 13px; font-weight: 700;
        }
        .sp-toast.saved { background: rgba(74,222,128,0.1); color: #4ade80; border: 1px solid rgba(74,222,128,0.2); }
        .sp-toast.error { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }

        .swatches { display: flex; gap: 8px; }
        .swatch { width: 28px; height: 28px; border-radius: 8px; cursor: pointer; transition: all 0.2s; border: 2px solid transparent; position: relative; }
        .swatch:hover { transform: scale(1.12); }
        .swatch.on { border-color: white; transform: scale(1.2); box-shadow: 0 0 10px rgba(255,255,255,0.25); }
        .swatch.on::after { content: '✓'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; color: white; }

        .info-badge {
          display: inline-flex; align-items: center;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 999px; padding: 4px 12px;
          font-size: 12px; color: #64748b; font-family: 'DM Mono', monospace;
        }

        .danger-wrap { background: rgba(239,68,68,0.03); border: 1px solid rgba(239,68,68,0.12); border-radius: 20px; overflow: hidden; }
        .danger-head { display: flex; align-items: center; gap: 14px; padding: 18px 24px; background: rgba(239,68,68,0.05); border-bottom: 1px solid rgba(239,68,68,0.1); }
        .danger-icon { width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.2); display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .danger-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; gap: 20px; }
        .danger-btn { background: rgba(239,68,68,0.08); color: #f87171; border: 1px solid rgba(239,68,68,0.18); border-radius: 9px; padding: 7px 16px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: 'Outfit', sans-serif; transition: all 0.2s; white-space: nowrap; flex-shrink: 0; }
        .danger-btn:hover { background: rgba(239,68,68,0.18); border-color: rgba(239,68,68,0.35); }

        .sp-footer { display: flex; justify-content: flex-end; align-items: center; gap: 16px; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.05); }
        .unsaved-note { font-size: 12px; color: #f59e0b; display: flex; align-items: center; gap: 6px; }

        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #fff; border: 3px solid #7c3aed; cursor: pointer; box-shadow: 0 0 8px rgba(124,58,237,0.5); transition: transform 0.15s; }
        input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.2); }
        input[type=range]::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: #fff; border: 3px solid #7c3aed; cursor: pointer; }
      `}</style>

      <div className="sp">
        <div className="sp-wrap">
          <Link href="/InterviewDashboard" className="sp-back">← Dashboard</Link>

          {/* HEADER */}
          <div className="sp-header">
            <div>
              <div className="sp-eyebrow">⚙️ Configuration</div>
              <h1 className="sp-title">App <em>Settings</em></h1>
              <p className="sp-sub">Changes are saved to your browser and persist across sessions</p>
            </div>
            <div>
              {status === "saved" && <div className="sp-toast saved">✅ Settings saved!</div>}
              {status === "error" && <div className="sp-toast error">❌ Failed to save</div>}
              {status === "idle" && (
                <button className="sp-save-btn" onClick={handleSave}>
                  Save Changes →
                  {unsaved && <span className="unsaved-dot"/>}
                </button>
              )}
            </div>
          </div>

          <div className="sp-grid">

            {/* ─── INTERVIEW EXPERIENCE ─── */}
            <Section icon="🎙️" title="Interview Experience" subtitle="Controls how AI interview sessions behave" accent="#7c3aed">
              <Row label="Auto-speak questions" desc="AI reads each question aloud when a session starts">
                <Toggle value={s.autoSpeak} onChange={v => update("autoSpeak", v)} accent={accentHex}/>
              </Row>
              <Row label="AI Voice Gender" desc="Voice gender used for question narration">
                <SettingSelect value={s.voiceGender} onChange={v => update("voiceGender", v)} options={[
                  { value: "female",  label: "Female"  },
                  { value: "male",    label: "Male"    },
                  { value: "neutral", label: "Neutral" },
                ]}/>
              </Row>
              <Row label="Show countdown timer" desc="Display a timer during interview and practice sessions">
                <Toggle value={s.showTimer} onChange={v => update("showTimer", v)} accent={accentHex}/>
              </Row>
              <Row label="Auto-advance questions" desc="Jump to next question automatically when timer expires">
                <Toggle value={s.autoNext} onChange={v => update("autoNext", v)} accent={accentHex}/>
              </Row>
              <SliderRow
                label="AI Voice Speed"
                desc="How fast the AI narrates questions (takes effect on next session)"
                accent={accentHex}
                value={s.voiceSpeed} min={0.5} max={1.5} step={0.1}
                onChange={v => update("voiceSpeed", v)}
                formatLabel={v => `${v.toFixed(1)}×`}
              />
              <SliderRow
                label="Practice Timer Duration"
                desc="Seconds allowed per question in Practice Mode"
                last accent={accentHex}
                value={s.timerDuration} min={30} max={300} step={30}
                onChange={v => update("timerDuration", v)}
                formatLabel={v => v >= 60 ? `${Math.floor(v/60)}m${v%60 ? ` ${v%60}s` : ""}` : `${v}s`}
              />
            </Section>

            {/* ─── APPEARANCE ─── */}
            <Section icon="🎨" title="Appearance" subtitle="Live preview — changes apply instantly" accent="#06b6d4">
              <Row label="Accent Color" desc="Highlight color used across buttons, rings, and active states">
                <div className="swatches">
                  {accents.map(a => (
                    <div
                      key={a.value}
                      className={`swatch ${s.accentColor === a.value ? "on" : ""}`}
                      style={{ background: a.color }}
                      onClick={() => update("accentColor", a.value)}
                      title={a.value}
                    />
                  ))}
                </div>
              </Row>
              <Row label="Font Size" desc="Base text size across the interface">
                <SettingSelect value={s.fontSize} onChange={v => update("fontSize", v)} options={[
                  { value: "small",  label: "Small (13px)"  },
                  { value: "medium", label: "Medium (15px)" },
                  { value: "large",  label: "Large (17px)"  },
                ]}/>
              </Row>
              <Row label="Compact Mode" desc="Reduce padding for a denser, tighter layout">
                <Toggle value={s.compactMode} onChange={v => update("compactMode", v)} accent={accentHex}/>
              </Row>
              <Row label="Animations" desc="Enable transitions and micro-interactions throughout the app" last>
                <Toggle value={s.animations} onChange={v => update("animations", v)} accent={accentHex}/>
              </Row>
            </Section>

            {/* ─── NOTIFICATIONS ─── */}
            <Section icon="🔔" title="Notifications" subtitle="Choose when and how you get reminded" accent="#f59e0b">
              <Row label="Email notifications" desc="Receive session summaries and weekly tips by email">
                <Toggle value={s.emailNotifs} onChange={v => update("emailNotifs", v)} accent={accentHex}/>
              </Row>
              <Row label="Practice reminders" desc="Get nudged to keep your interview skills sharp">
                <Toggle value={s.practiceReminder} onChange={v => update("practiceReminder", v)} accent={accentHex}/>
              </Row>
              <Row label="Reminder frequency" desc="How often to send practice reminders">
                <SettingSelect value={s.reminderFreq} onChange={v => update("reminderFreq", v)} options={[
                  { value: "daily",      label: "Daily"       },
                  { value: "every2days", label: "Every 2 days"},
                  { value: "weekly",     label: "Weekly"      },
                  { value: "never",      label: "Never"       },
                ]}/>
              </Row>
              <Row label="Session complete alerts" desc="Notify when an interview session finishes" last>
                <Toggle value={s.sessionAlerts} onChange={v => update("sessionAlerts", v)} accent={accentHex}/>
              </Row>
            </Section>

            {/* ─── PRIVACY & DATA ─── */}
            <Section icon="🔒" title="Privacy & Data" subtitle="Control how your data is stored and shared" accent="#10b981">
              <Row label="Save interview history" desc="Store past sessions so you can review your progress">
                <Toggle value={s.saveHistory} onChange={v => update("saveHistory", v)} accent={accentHex}/>
              </Row>
              <Row label="Usage analytics" desc="Share anonymous usage data to help improve the app">
                <Toggle value={s.analytics} onChange={v => update("analytics", v)} accent={accentHex}/>
              </Row>
              <Row label="Share performance data" desc="Allow scores to contribute to anonymised benchmarks" last>
                <Toggle value={s.shareData} onChange={v => update("shareData", v)} accent={accentHex}/>
              </Row>
            </Section>

            {/* ─── ABOUT ─── */}
            <Section icon="ℹ️" title="About" subtitle="VoicePrep AI — application information" accent="#64748b">
              {[
                ["Version",       "1.0.0"],
                ["AI Model",      "GPT-3.5 Turbo · OpenRouter"],
                ["Speech Engine", "Web Speech API"],
                ["PDF Parser",    "pdfjs-dist"],
                ["Framework",     "Next.js 14 (App Router)"],
              ].map(([k, v], i, a) => (
                <Row key={k} label={k} last={i === a.length - 1}>
                  <span className="info-badge">{v}</span>
                </Row>
              ))}
            </Section>

            {/* ─── DANGER ZONE ─── */}
            <div className="danger-wrap">
              <div className="danger-head">
                <div className="danger-icon">⚠️</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fca5a5" }}>Danger Zone</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Irreversible actions — proceed with caution</div>
                </div>
              </div>
              {[
                { scope: "history",   label: "Clear Interview History",  desc: "Permanently delete all past interview results and scores"   },
                { scope: "progress",  label: "Reset Progress Data",      desc: "Wipe all progress charts and performance statistics"        },
                { scope: "questions", label: "Clear Saved Questions",    desc: "Remove all bookmarked questions from the Question Bank"     },
                { scope: "settings",  label: "Reset All Settings",       desc: "Restore every setting back to factory defaults"             },
              ].map(({ scope, label, desc }, i, a) => (
                <div key={scope} className="danger-row"
                  style={{ borderBottom: i < a.length - 1 ? "1px solid rgba(239,68,68,0.07)" : "none" }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#fca5a5" }}>{label}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{desc}</div>
                  </div>
                  <button className="danger-btn" onClick={() => handleReset(scope)}>
                    {label.split(" ")[0]}
                  </button>
                </div>
              ))}
            </div>

          </div>

          {/* BOTTOM SAVE */}
          <div className="sp-footer">
            {unsaved && (
              <span className="unsaved-note">
                ● Unsaved changes
              </span>
            )}
            {status === "saved" && <div className="sp-toast saved">✅ All changes saved!</div>}
            {status === "error" && <div className="sp-toast error">❌ Failed to save</div>}
            {status === "idle" && (
              <button className="sp-save-btn" onClick={handleSave}>
                💾 Save All Changes
                {unsaved && <span className="unsaved-dot"/>}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}