"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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
  CartesianGrid
} from "recharts";

export default function ScheduledInterview() {

  const searchParams = useSearchParams();
  const router = useRouter();
  const interviewId = searchParams.get("id");

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");

  const [completed, setCompleted] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [result, setResult] = useState(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [time, setTime] = useState(0);

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // ================= TIMER =================
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = () => {
    const m = String(Math.floor(time / 60)).padStart(2, "0");
    const s = String(time % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // ================= FETCH QUESTIONS =================
  useEffect(() => {
    if (!interviewId) return;
    axios
      .get(`http://localhost:5000/api/interview/${interviewId}`)
      .then((res) => setQuestions(res.data.questions));
  }, [interviewId]);

  // ================= AI SPEAK =================
  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  };

  useEffect(() => {
    if (questions.length > 0) {
      speak(questions[currentIndex]);
    }
  }, [questions]);

  // ================= IMPROVED MIC =================
  const toggleMic = () => {

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Please use Google Chrome");
      return;
    }

    if (micOn) {
      recognitionRef.current.stop();
      setMicOn(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const result = event.results[i][0];
          if (result.confidence > 0.6) {
            finalTranscript += result.transcript + " ";
          }
        }
      }
      setCurrentAnswer((prev) => prev + " " + finalTranscript);
    };

    recognition.onerror = (e) => {
      console.log("Speech error:", e.error);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setMicOn(true);
  };

  // ================= CAMERA =================
  const toggleCamera = async () => {
    if (cameraOn) {
      videoRef.current.srcObject?.getTracks().forEach((t) => t.stop());
      setCameraOn(false);
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    setCameraOn(true);
  };

  // ================= SAVE ANSWER =================
  const handleSave = () => {

    if (!currentAnswer.trim()) return;

    const updated = [...answers, currentAnswer.trim()];
    setAnswers(updated);
    setCurrentAnswer("");

    if (currentIndex < questions.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      setTimeout(() => speak(questions[next]), 1000);
    } else {
      setCompleted(true);
      speak("Interview completed successfully.");
    }
  };

  // ================= GENERATE REPORT =================
  const generateReport = async () => {
    const res = await axios.post(
      "http://localhost:5000/api/interview/score",
      { interviewId, answers }
    );
    setResult(res.data);
    setShowReport(true);
  };

  const downloadPDF = () => {
    window.open(
      `http://localhost:5000/api/interview/report/${result._id}`,
      "_blank"
    );
  };

  const endCall = () => {
    recognitionRef.current?.stop();
    videoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
    router.push("/InterviewDashboard");
  };

  // ================= COMPLETED SCREEN =================
  if (completed && !showReport) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-4xl font-bold mb-6">Interview Completed 🎉</h1>
        <button
          onClick={generateReport}
          className="bg-green-600 px-8 py-4 rounded-xl text-lg hover:scale-105 transition"
        >
          Generate Feedback & Score
        </button>
      </div>
    );
  }

  // ================= REPORT SCREEN =================
  if (showReport && result) {

    const chartData = [
      { name: "Communication", value: result.breakdown.communication },
      { name: "Technical", value: result.breakdown.technical },
      { name: "Confidence", value: result.breakdown.confidence }
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-10 text-white">

        <h1 className="text-4xl font-bold text-center mb-10">
          Interview Performance Report
        </h1>

        {/* SCORE CARD */}
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-xl mb-10 text-center">
          <h2 className="text-3xl font-bold">
            Total Score: {result.score}/100
          </h2>
        </div>

        {/* RADIAL CHART */}
        <div className="flex justify-center mb-10">
          <ResponsiveContainer width="60%" height={300}>
            <RadialBarChart innerRadius="20%" outerRadius="100%" data={chartData}>
              <RadialBar dataKey="value" background clockWise />
              <Legend />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* BAR CHART */}
        <div className="flex justify-center mb-10">
          <ResponsiveContainer width="80%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Bar dataKey="value" fill="#4ade80" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* QUESTION REVIEW */}
        {questions.map((q, i) => (
          <div key={i} className="bg-white/10 p-6 mb-6 rounded-xl">
            <p className="font-semibold text-lg">Q{i + 1}: {q}</p>
            <p className="mt-2 text-gray-200">Your Answer: {answers[i]}</p>
          </div>
        ))}

        {/* AI FEEDBACK */}
        <div className="bg-green-500/20 p-6 rounded-xl mb-8">
          <h3 className="text-xl font-semibold mb-2">AI Feedback</h3>
          <p>{result.feedback}</p>
        </div>

        <div className="flex justify-center gap-6">
          <button
            onClick={downloadPDF}
            className="bg-blue-600 px-6 py-3 rounded-lg hover:scale-105 transition"
          >
            Download PDF
          </button>

          <button
            onClick={() => router.push("/InterviewDashboard")}
            className="bg-gray-700 px-6 py-3 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ================= MEETING UI =================
  return (
    <div className="h-screen bg-gray-100 flex flex-col">

      <div className="flex justify-between px-8 py-4 bg-white shadow">
        <h1 className="font-bold text-lg">AI Interview Session</h1>
        <span>⏱ {formatTime()}</span>
      </div>

      <div className="flex flex-1 p-6 gap-6">

        <div className="flex-1 bg-white rounded-2xl shadow flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold mb-4">AI Recruiter</h2>
          <p className="text-lg text-center px-6">
            {questions[currentIndex]}
          </p>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow flex flex-col items-center justify-center">

          <div className="w-60 h-60 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center shadow-lg">
            {cameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold">You</span>
            )}
          </div>

          <textarea
            className="w-3/4 mt-6 border p-3 rounded-lg"
            rows="4"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Your answer will appear here..."
          />

          <button
            onClick={handleSave}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Save Answer
          </button>
        </div>
      </div>

      <div className="flex justify-center items-center gap-8 py-4 bg-white">

        <button
          onClick={toggleMic}
          className={`w-14 h-14 rounded-full text-white transition
          ${micOn ? "bg-green-600" : "bg-gray-600"}`}
        >
          🎤
        </button>

        <button
          onClick={endCall}
          className="w-16 h-16 rounded-full bg-red-600 text-white"
        >
          📞
        </button>

        <button
          onClick={toggleCamera}
          className={`w-14 h-14 rounded-full text-white transition
          ${cameraOn ? "bg-green-600" : "bg-gray-600"}`}
        >
          🎥
        </button>

      </div>
    </div>
  );
}