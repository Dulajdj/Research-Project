"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useSettings } from "@/lib/useSettings";
import axios from "axios";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell
} from "recharts";

// ===================== AI RECRUITER SVG =====================
const AIRecruiterLogo = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="58" fill="url(#robotGrad)" stroke="#7c3aed" strokeWidth="2"/>
    <line x1="60" y1="15" x2="60" y2="5" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="60" cy="4" r="4" fill="#7c3aed"/>
    <rect x="30" y="18" width="60" height="45" rx="12" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="1.5"/>
    <circle cx="46" cy="36" r="8" fill="#312e81"/>
    <circle cx="74" cy="36" r="8" fill="#312e81"/>
    <circle cx="46" cy="36" r="5" fill="#06b6d4"/>
    <circle cx="74" cy="36" r="5" fill="#06b6d4"/>
    <circle cx="48" cy="34" r="2" fill="white" opacity="0.8"/>
    <circle cx="76" cy="34" r="2" fill="white" opacity="0.8"/>
    <rect x="42" y="50" width="36" height="6" rx="3" fill="#312e81"/>
    <rect x="45" y="51" width="6" height="4" rx="1" fill="#06b6d4"/>
    <rect x="54" y="51" width="6" height="4" rx="1" fill="#7c3aed"/>
    <rect x="63" y="51" width="6" height="4" rx="1" fill="#06b6d4"/>
    <rect x="38" y="65" width="44" height="30" rx="8" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="1.5"/>
    <circle cx="60" cy="75" r="6" fill="#7c3aed" opacity="0.6"/>
    <rect x="44" y="87" width="12" height="4" rx="2" fill="#06b6d4" opacity="0.7"/>
    <rect x="64" y="87" width="12" height="4" rx="2" fill="#7c3aed" opacity="0.7"/>
    <rect x="18" y="66" width="18" height="8" rx="4" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="1.5"/>
    <rect x="84" y="66" width="18" height="8" rx="4" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="1.5"/>
    <defs>
      <radialGradient id="robotGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#2e1065"/>
        <stop offset="100%" stopColor="#0f0a1e"/>
      </radialGradient>
    </defs>
  </svg>
);

// ===================== ICON COMPONENTS =====================
const MicIcon = ({ active }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <rect x="9" y="2" width="6" height="12" rx="3" fill={active ? "#fff" : "#94a3b8"}/>
    <path d="M5 11a7 7 0 0 0 14 0" stroke={active ? "#fff" : "#94a3b8"} strokeWidth="2" strokeLinecap="round"/>
    <line x1="12" y1="18" x2="12" y2="22" stroke={active ? "#fff" : "#94a3b8"} strokeWidth="2" strokeLinecap="round"/>
    <line x1="8" y1="22" x2="16" y2="22" stroke={active ? "#fff" : "#94a3b8"} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CamIcon = ({ active }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="7" width="15" height="11" rx="2" fill={active ? "#fff" : "#94a3b8"}/>
    <path d="M17 10l5-3v10l-5-3V10z" fill={active ? "#fff" : "#94a3b8"}/>
    {!active && <line x1="2" y1="22" x2="22" y2="2" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>}
  </svg>
);

const PhoneIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="white"/>
  </svg>
);

// ===================== GREETING HELPER =====================
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
};

// ===================== MEETING STYLE CONFIGS =====================
const meetingStyleConfigs = {
  formal_structured: {
    label: "Structured Interview",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    transitionPhrases: [
      "Thank you. Moving to the next question.",
      "Noted. Next question.",
      "Recorded. Proceeding to question number",
      "Thank you for your response. Next:",
      "Moving on to the next standardized question."
    ],
    completionMessage: "Thank you. You have completed all structured interview questions. Your responses have been recorded."
  },
  casual_conversational: {
    label: "Unstructured Interview",
    badgeColor: "bg-green-500/20 text-green-300 border-green-500/30",
    transitionPhrases: [
      "That's really interesting! Let's explore another area.",
      "I love that perspective. Here's something else I'd like to know.",
      "Great, thanks for sharing that. Let's chat about something else.",
      "That's good to hear. So tell me more about...",
      "Thanks for opening up about that. Let's move on."
    ],
    completionMessage: "That was a wonderful conversation! Thank you so much for sharing. We've covered everything we need."
  },
  panel_multi_perspective: {
    label: "Panel Interview",
    badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    transitionPhrases: [
      "Thank you. The next panelist has a question for you.",
      "Good answer. Moving to the next panel question.",
      "Our next interviewer would like to ask you about something.",
      "Thank you for that. The panel has another question.",
      "Noted by the panel. Next question coming from a different perspective."
    ],
    completionMessage: "The panel has completed all questions. Thank you for your time today. We will be in touch with next steps."
  },
  personal_direct: {
    label: "One-on-One Interview",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    transitionPhrases: [
      "Great answer! Moving on.",
      "Thank you. Next question.",
      "Understood. Here's your next question.",
      "Good. Let's continue.",
      "Noted. Next one for you."
    ],
    completionMessage: "Excellent! You've completed all the questions. Thank you for your time. Please click generate report to see your results."
  },
  star_method: {
    label: "Competency-Based Interview",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    transitionPhrases: [
      "Good example. Remember to use the STAR format. Next competency.",
      "Thank you for that example. Moving to the next competency area.",
      "Noted. Let's assess another key competency.",
      "Good. Next question — please use Situation, Task, Action, Result format.",
      "Thank you. Here's your next competency-based question."
    ],
    completionMessage: "Well done! You have completed all competency-based questions. Your STAR method responses have been recorded for evaluation."
  },
  high_pressure: {
    label: "Stress Interview",
    badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
    transitionPhrases: [
      "Next question — and quickly please.",
      "Moving on. No time to hesitate.",
      "Next. Think fast.",
      "Good. Let's keep the pressure up. Next question.",
      "Quick answer required. Next:"
    ],
    completionMessage: "Interview complete. You've faced all the pressure questions. Let's see how you held up — click generate report."
  },
  quick_screening: {
    label: "Phone/Video Screening",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    transitionPhrases: [
      "Got it. Quick next question.",
      "Okay. Moving on.",
      "Noted. Next screening question.",
      "Good. Let's keep it moving.",
      "Understood. Next."
    ],
    completionMessage: "Great, that covers everything for this screening call. Thank you for your time. We'll be in touch if you move to the next round."
  },
  group_dynamics: {
    label: "Group Interview",
    badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    transitionPhrases: [
      "Good perspective. Next question — think about how you work with others.",
      "Interesting. Keep collaboration in mind. Next question.",
      "Thank you. Next scenario for you.",
      "Good. Here's your next group dynamics question.",
      "Noted. Let's explore another team situation."
    ],
    completionMessage: "Excellent! You've completed all the group interview scenarios. Thank you for demonstrating your teamwork and leadership qualities."
  },
  standard: {
    label: "Interview",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    transitionPhrases: [
      "Great answer! Moving on.",
      "Thank you. Next question.",
      "Understood. Here's your next question.",
      "Good. Let's continue.",
      "Noted. Next one for you."
    ],
    completionMessage: "Excellent! You've completed all the questions. Thank you for your time. Please click generate report to see your results."
  }
};

const getMeetingConfig = (meetingStyle) => {
  return meetingStyleConfigs[meetingStyle] || meetingStyleConfigs.standard;
};

// ===================== PHASE CONSTANTS =====================
const PHASE = {
  GREETING: "greeting",
  INTRO: "intro",
  QUESTIONS: "questions",
  DONE: "done"
};

// ===================== TYPING INDICATOR =====================
const TypingDots = () => (
  <div className="flex items-center gap-1 mt-3">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
    <span className="text-purple-300 text-xs ml-2">AI is speaking...</span>
  </div>
);

// ===================== MAIN COMPONENT =====================
export default function ScheduledInterview() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const interviewId = searchParams.get("id");

  // ✅ useSettings called INSIDE the component (correct placement)
  const settings = useSettings();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [introAnswer, setIntroAnswer] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [interimText, setInterimText] = useState("");

  const [phase, setPhase] = useState(PHASE.GREETING);
  const [greetingText, setGreetingText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [completed, setCompleted] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [time, setTime] = useState(0);
  const [isVoiceAnswer, setIsVoiceAnswer] = useState(false);

  const [meetingConfig, setMeetingConfig] = useState(meetingStyleConfigs.standard);
  const [interviewTypeLabel, setInterviewTypeLabel] = useState("Interview");

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const answerMethodRef = useRef("typed");
  const voiceFlagsRef = useRef([]);

  // ===================== TIMER =====================
  useEffect(() => {
    timerRef.current = setInterval(() => setTime((p) => p + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = () => {
    const m = String(Math.floor(time / 60)).padStart(2, "0");
    const s = String(time % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // ===================== FETCH QUESTIONS =====================
 // REPLACE WITH:
useEffect(() => {
  if (!interviewId) return;
  axios
    .get(`http://localhost:5000/api/interview/${interviewId}`)
    .then((res) => {
      setQuestions(res.data.questions);

      const style = res.data.meetingStyle || "standard";
      const config = getMeetingConfig(style);

      if (res.data.introPrompt) {
        config.introPrompt = res.data.introPrompt;
      }

      setMeetingConfig(config);
      setInterviewTypeLabel(config.label);

      if (res.data.interviewTypes?.length > 0) {
        setInterviewTypeLabel(res.data.interviewTypes.join(" + ") + " Interview");
      }
    });
}, [interviewId]);

  // ===================== AI SPEAK =====================
  // Uses voiceSpeed and voiceGender from settings
  const speak = (text, onDone) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    // ✅ Apply settings: voice speed
    utterance.rate = settings.voiceSpeed ?? 0.88;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();

    // ✅ Apply settings: voice gender
    let preferred;
    if (settings.voiceGender === "male") {
      preferred = voices.find(
        (v) => v.lang === "en-US" && (v.name.includes("Daniel") || v.name.includes("Google UK English Male") || v.name.includes("Alex"))
      );
    } else if (settings.voiceGender === "neutral") {
      preferred = voices.find(
        (v) => v.lang === "en-US" && v.name.includes("Google")
      );
    } else {
      // female (default)
      preferred = voices.find(
        (v) => v.lang === "en-US" && (v.name.includes("Samantha") || v.name.includes("Google US English") || v.name.includes("Karen"))
      );
    }
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onDone) onDone();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (onDone) onDone();
    };

    // ✅ Only speak if autoSpeak is enabled (or it's a question/system message)
    if (settings.autoSpeak !== false) {
      window.speechSynthesis.speak(utterance);
    } else {
      // Still trigger onDone so flow continues
      setIsSpeaking(false);
      if (onDone) onDone();
    }
  };

  // ===================== GREETING FLOW =====================
  useEffect(() => {
    if (questions.length === 0) return;

    const greeting = getGreeting();
    const fullGreeting = `${greeting}! Welcome to your ${interviewTypeLabel} session. I'm your AI Recruiter today. Let's get started!`;

    setGreetingText(fullGreeting);
    setPhase(PHASE.GREETING);

    speak(fullGreeting, () => {
      setTimeout(() => {
        setPhase(PHASE.INTRO);
        speak(meetingConfig.introPrompt);
      }, 600);
    });
  }, [questions, meetingConfig]);

  // ===================== MIC =====================
  const toggleMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition requires Google Chrome.");
      return;
    }

    if (micOn) {
      recognitionRef.current?.stop();
      setMicOn(false);
      setInterimText("");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    let finalText = "";

    recognition.onstart = () => {
      answerMethodRef.current = "voice";
      setIsVoiceAnswer(true);
    };

    recognition.onresult = (event) => {
      let interim = "";
      let newFinal = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const best = event.results[i][0];
        if (event.results[i].isFinal) {
          if (best.confidence > 0.3) {
            newFinal += best.transcript + " ";
          } else {
            for (let j = 0; j < event.results[i].length; j++) {
              if (event.results[i][j].confidence > 0.2) {
                newFinal += event.results[i][j].transcript + " ";
                break;
              }
            }
          }
        } else {
          interim += best.transcript;
        }
      }

      if (newFinal) {
        finalText += newFinal;
        setCurrentAnswer(finalText);
      }
      setInterimText(interim);
    };

    recognition.onerror = (e) => {
      if (e.error === "no-speech") {
        try { recognition.stop(); setTimeout(() => { if (micOn) recognition.start(); }, 500); } catch {}
      }
    };

    recognition.onend = () => {
      if (micOn) {
        setTimeout(() => { try { recognition.start(); } catch {} }, 200);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setMicOn(true);
  };

  // ===================== CAMERA =====================
  const toggleCamera = async () => {
    if (cameraOn) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      streamRef.current = null;
      setCameraOn(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 640, facingMode: "user" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraOn(true);
    } catch {
      alert("Camera access denied. Please allow camera permissions.");
    }
  };

  // ===================== SAVE ANSWER =====================
  const handleSave = () => {
    const finalAnswer = (currentAnswer + " " + interimText).trim();
    if (!finalAnswer) {
      alert("Please provide an answer before continuing.");
      return;
    }

    recognitionRef.current?.stop();
    setMicOn(false);
    setInterimText("");

    const byVoice = answerMethodRef.current === "voice";
    answerMethodRef.current = "typed";
    setIsVoiceAnswer(false);
    setCurrentAnswer("");

    if (phase === PHASE.INTRO) {
      setIntroAnswer(finalAnswer);
      setPhase(PHASE.QUESTIONS);
      setTimeout(() => speak(questions[0]), 600);
      return;
    }

    if (phase === PHASE.QUESTIONS) {
      const updatedAnswers = [...answers, finalAnswer];
      const updatedFlags = [...voiceFlagsRef.current, byVoice];
      voiceFlagsRef.current = updatedFlags;
      setAnswers(updatedAnswers);

      if (currentIndex < questions.length - 1) {
        const next = currentIndex + 1;
        setCurrentIndex(next);

        const phrases = meetingConfig.transitionPhrases;
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        speak(phrase, () => setTimeout(() => speak(questions[next]), 400));
      } else {
        setCompleted(true);
        speak(meetingConfig.completionMessage);
      }
    }
  };

  // ===================== GENERATE REPORT =====================
  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/interview/score", {
        interviewId,
        answers,
        introAnswer,
        voiceFlags: voiceFlagsRef.current
      });
      setResult(res.data);
      setShowReport(true);
    } catch {
      alert("Error generating report. Please try again.");
    }
    setLoading(false);
  };

  const downloadPDF = () => {
    window.open(`http://localhost:5000/api/interview/report/${result._id}`, "_blank");
  };

  const endCall = () => {
    window.speechSynthesis.cancel();
    recognitionRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    router.push("/InterviewDashboard");
  };

  // ===================== DISPLAY HELPERS =====================
  const getCurrentDisplayText = () => {
    if (phase === PHASE.GREETING) return greetingText;
    if (phase === PHASE.INTRO) return meetingConfig.introPrompt;
    if (phase === PHASE.QUESTIONS) return questions[currentIndex];
    return "";
  };

  const getCurrentPhaseLabel = () => {
    if (phase === PHASE.GREETING) return { label: "Welcome", color: "text-blue-300" };
    if (phase === PHASE.INTRO) return { label: "Introduction", color: "text-yellow-300" };
    if (phase === PHASE.QUESTIONS)
      return { label: `Question ${currentIndex + 1} of ${questions.length}`, color: "text-purple-300" };
    return { label: "", color: "" };
  };

  // ===================== COMPLETED SCREEN =====================
  if (completed && !showReport) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 text-white">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-4xl font-bold mb-3">Interview Completed!</h1>
        <p className="text-purple-300 mb-3 text-lg">You answered {questions.length} questions.</p>
        <div className={`mb-8 px-4 py-2 rounded-full border text-sm ${meetingConfig.badgeColor}`}>
          {interviewTypeLabel}
        </div>
        <button
          onClick={generateReport}
          disabled={loading}
          className="bg-gradient-to-r from-violet-600 to-purple-600 px-10 py-4 rounded-2xl text-lg font-semibold hover:scale-105 transition shadow-xl disabled:opacity-60"
        >
          {loading ? "Analyzing your answers..." : "Generate AI Feedback & Score"}
        </button>
      </div>
    );
  }

  // ===================== REPORT SCREEN =====================
  if (showReport && result) {
    const hasVoice = result.voiceAnalysis?.hasVoiceAnswers;
    const chartData = [
      { name: "Technical", value: result.breakdown?.technical ?? 0, fill: "#818cf8" },
      ...(hasVoice
        ? [
            { name: "Communication", value: result.breakdown?.communication ?? 0, fill: "#34d399" },
            { name: "Confidence",    value: result.breakdown?.confidence ?? 0,    fill: "#f472b6" }
          ]
        : [])
    ];
    const scoreColor = result.score >= 70 ? "#4ade80" : result.score >= 50 ? "#facc15" : "#f87171";

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 p-8 text-white">
        <h1 className="text-3xl font-bold text-center mb-2 text-purple-200">📊 Interview Performance Report</h1>
        <p className="text-center mb-8">
          <span className={`px-4 py-1 rounded-full border text-sm ${meetingConfig.badgeColor}`}>
            {interviewTypeLabel}
          </span>
        </p>

        {/* SCORE */}
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-xl mb-8 text-center border border-purple-500/30">
          <div className="text-7xl font-black mb-2" style={{ color: scoreColor }}>{result.score}</div>
          <div className="text-xl text-purple-300">out of 100</div>
          {!hasVoice && (
            <div className="mt-4 bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-lg text-sm inline-block border border-yellow-500/40">
              ⚠️ Typed answers detected — Communication & Confidence scores excluded
            </div>
          )}
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-center text-purple-200 font-semibold mb-4">Score Breakdown</h3>
            <ResponsiveContainer width="100%" height={240}>
              <RadialBarChart innerRadius="20%" outerRadius="90%" data={chartData}>
                <RadialBar dataKey="value" background clockWise label={{ fill: "#fff", fontSize: 12 }}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </RadialBar>
                <Legend />
                <Tooltip contentStyle={{ background: "#1e1b4b", border: "1px solid #7c3aed" }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-center text-purple-200 font-semibold mb-4">Category Scores</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20"/>
                <XAxis dataKey="name" stroke="#c4b5fd" tick={{ fontSize: 12 }}/>
                <YAxis stroke="#c4b5fd" domain={[0, 100]}/>
                <Tooltip contentStyle={{ background: "#1e1b4b", border: "1px solid #7c3aed" }}/>
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* INTRO REVIEW */}
        {introAnswer && (
          <div className="bg-white/10 backdrop-blur-xl p-6 mb-4 rounded-2xl border border-blue-500/20">
            <p className="font-semibold text-blue-200 mb-3">🧑 Introduction</p>
            <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/30">
              <p className="text-xs text-blue-300 font-semibold mb-1">YOUR ANSWER</p>
              <p className="text-gray-200 text-sm">{introAnswer}</p>
            </div>
          </div>
        )}

        {/* QUESTION REVIEW */}
        <h2 className="text-xl font-bold text-purple-200 mb-4">📝 Question-by-Question Review</h2>
        {questions.map((q, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-xl p-6 mb-4 rounded-2xl border border-purple-500/20">
            <p className="font-semibold text-purple-100 mb-3">Q{i + 1}: {q}</p>
            <div className="bg-blue-500/10 rounded-xl p-3 mb-3 border border-blue-500/30">
              <p className="text-xs text-blue-300 font-semibold mb-1">YOUR ANSWER</p>
              <p className="text-gray-200 text-sm">{answers[i] || "No answer provided"}</p>
              {voiceFlagsRef.current[i] && (
                <span className="text-xs text-green-400 mt-1 inline-block">🎤 Voice answer</span>
              )}
            </div>
            {result.questionReviews?.[i] && (
              <>
                <div className="bg-green-500/10 rounded-xl p-3 mb-3 border border-green-500/30">
                  <p className="text-xs text-green-300 font-semibold mb-1">IDEAL ANSWER</p>
                  <p className="text-gray-200 text-sm">{result.questionReviews[i].idealAnswer}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/20 rounded-lg px-4 py-2 border border-purple-500/30">
                    <span className="text-xs text-purple-300">Score: </span>
                    <span className="font-bold text-white">{result.questionReviews[i].score}/10</span>
                  </div>
                  <p className="text-sm text-gray-300 flex-1">{result.questionReviews[i].comment}</p>
                </div>
              </>
            )}
          </div>
        ))}

        {/* FEEDBACK */}
        <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 p-6 rounded-2xl mb-8 border border-violet-500/30">
          <h3 className="text-xl font-semibold mb-3 text-violet-200">🤖 AI Overall Feedback</h3>
          <p className="text-gray-200 leading-relaxed">{result.feedback}</p>
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          <button onClick={downloadPDF} className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-semibold transition">
            📥 Download PDF
          </button>
          <button onClick={() => router.push("/InterviewDashboard")} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition border border-white/20">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ===================== MEETING UI =====================
  const phaseInfo = getCurrentPhaseLabel();

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex flex-col">

      {/* HEADER */}
      <div className="flex justify-between items-center px-8 py-4 bg-black/40 backdrop-blur-sm border-b border-purple-500/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xs font-bold text-white">AI</div>
          <h1 className="font-bold text-white text-lg">AI Interview Session</h1>
          <span className={`text-xs px-3 py-1 rounded-full border ${meetingConfig.badgeColor}`}>
            {interviewTypeLabel}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium px-3 py-1 rounded-full bg-white/10 ${phaseInfo.color}`}>
            {phaseInfo.label}
          </span>
          {/* ✅ Show timer only if showTimer setting is true */}
          {settings.showTimer !== false && (
            <div className="flex items-center gap-2 bg-red-500/20 text-red-300 px-3 py-1 rounded-full border border-red-500/30 text-sm">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"/>
              {formatTime()}
            </div>
          )}
        </div>
      </div>

      {/* MAIN */}
      <div className="flex flex-1 p-6 gap-6 overflow-hidden">

        {/* AI RECRUITER PANEL */}
        <div className="flex-1 bg-black/30 backdrop-blur-sm rounded-3xl border border-purple-500/20 flex flex-col items-center justify-center p-8">
          <AIRecruiterLogo />
          <h2 className="text-purple-200 font-semibold text-lg mt-5 mb-2">AI Recruiter</h2>

          {phase === PHASE.QUESTIONS && (
            <div className="flex gap-2 mb-5">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i < currentIndex ? "bg-green-400" : i === currentIndex ? "bg-purple-400 scale-125" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          )}

          {phase === PHASE.GREETING && (
            <div className="mb-3 bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-500/30">
              👋 Welcome
            </div>
          )}
          {phase === PHASE.INTRO && (
            <div className="mb-3 bg-yellow-500/20 text-yellow-300 text-xs px-3 py-1 rounded-full border border-yellow-500/30">
              🧑 Introduction Round
            </div>
          )}

          <div className="bg-purple-500/10 rounded-2xl p-6 border border-purple-500/20 max-w-md text-center">
            <p className="text-white text-base leading-relaxed">{getCurrentDisplayText()}</p>
            {isSpeaking && <TypingDots />}
          </div>
        </div>

        {/* USER PANEL */}
        <div className="flex-1 bg-black/30 backdrop-blur-sm rounded-3xl border border-purple-500/20 flex flex-col items-center justify-center p-8">

          {/* CAMERA CIRCLE */}
          <div className="relative w-52 h-52 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-2xl bg-gradient-to-br from-slate-700 to-slate-900 mb-6">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraOn ? "block" : "hidden"}`}
            />
            {!cameraOn && (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-white/40">YOU</div>
                <div className="text-xs text-white/30 mt-1">Camera Off</div>
              </div>
            )}
            <div className={`absolute bottom-3 right-3 w-3 h-3 rounded-full ${cameraOn ? "bg-green-400 animate-pulse" : "bg-gray-600"}`}/>
          </div>

          {/* ANSWER BOX */}
          {phase !== PHASE.GREETING && (
            <>
              <div className="w-full max-w-md relative">
                <p className="text-purple-300 text-xs mb-2 font-medium">
                  {phase === PHASE.INTRO ? "Your Introduction" : `Your Answer — Q${currentIndex + 1}`}
                </p>
                <textarea
                  className="w-full bg-white/10 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-4 text-white placeholder-white/30 resize-none focus:outline-none focus:border-purple-400 transition"
                  rows="5"
                  value={currentAnswer + (interimText ? ` ${interimText}` : "")}
                  onChange={(e) => {
                    setCurrentAnswer(e.target.value);
                    answerMethodRef.current = "typed";
                    setIsVoiceAnswer(false);
                  }}
                  placeholder={micOn ? "🎤 Listening... speak your answer" : "Type your answer or click mic to speak..."}
                />
                {micOn && (
                  <div className="absolute top-8 right-3 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-ping"/>
                    <span className="text-xs text-red-300">REC</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={isSpeaking}
                className="mt-4 w-full max-w-md bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-2xl font-semibold hover:opacity-90 hover:scale-[1.02] transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {phase === PHASE.INTRO
                  ? "Submit Introduction →"
                  : currentIndex < questions.length - 1
                  ? "Save & Next Question →"
                  : "Submit Final Answer ✓"}
              </button>
            </>
          )}

          {phase === PHASE.GREETING && (
            <div className="text-purple-300 text-sm text-center animate-pulse mt-4">
              Please wait while the interviewer finishes speaking...
            </div>
          )}
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex justify-center items-center gap-8 py-5 bg-black/40 backdrop-blur-sm border-t border-purple-500/20">
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={toggleMic}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
              micOn ? "bg-green-500 shadow-green-500/40 scale-110" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            <MicIcon active={micOn} />
          </button>
          <span className="text-xs text-white/50">{micOn ? "Mic On" : "Mic Off"}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={endCall}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30 transition-all"
          >
            <PhoneIcon />
          </button>
          <span className="text-xs text-white/50">End Call</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={toggleCamera}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
              cameraOn ? "bg-green-500 shadow-green-500/40 scale-110" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            <CamIcon active={cameraOn} />
          </button>
          <span className="text-xs text-white/50">{cameraOn ? "Cam On" : "Cam Off"}</span>
        </div>
      </div>
    </div>
  );
}