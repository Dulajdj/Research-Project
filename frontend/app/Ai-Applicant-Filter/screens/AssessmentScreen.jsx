import React, { useState, useEffect, useRef } from "react";
import {
  Brain,
  Mic,
  MicOff,
  Trophy,
  RefreshCw,
  FileText,
  Activity,
  Lightbulb,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Save,
} from "lucide-react";
import Leaderboard from "./leaderboard"; // NEW IMPORT

const styles = `
  .mic-wave { display: flex; align-items: center; justify-content: center; gap: 4px; height: 30px; }
  .bar { width: 4px; background: #06b6d4; animation: wave 1s ease-in-out infinite; }
  .bar:nth-child(odd) { animation-duration: 0.8s; }
  .bar:nth-child(2n) { animation-duration: 1.1s; }
  .bar:nth-child(3n) { animation-duration: 1.3s; }
  @keyframes wave { 0%, 100% { height: 10px; } 50% { height: 25px; } }
`;

const PREDEFINED_SKILLS = [
  "React",
  "Node.js",
  "Python",
  "Java",
  "SQL",
  "Spring Boot",
  "Machine Learning",
  "AWS",
  "UI/UX Design",
  "Cybersecurity",
];

const CONFIDENCE_SCENARIOS = [
  "You realize you pushed a critical bug to production on a Friday evening. What is your immediate reaction?",
  "A senior developer strongly disagrees with your solution, but you are sure you are correct. How do you handle it?",
  "You are given a task with a deadline of tomorrow using a tech stack you don't know. What do you do?",
];

export default function AssessmentScreen() {
  const [view, setView] = useState("menu");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customTopic, setCustomTopic] = useState("");
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizData, setQuizData] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answerStatus, setAnswerStatus] = useState(null);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");

  const [confIndex, setConfIndex] = useState(0);
  const [confScore, setConfScore] = useState(0);
  const [confFeedback, setConfFeedback] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const recognitionRef = useRef(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let currentInterim = "";
        let finalAppended = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalAppended += event.results[i][0].transcript + " ";
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalAppended) setTranscript((prev) => prev + finalAppended);
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event) => {
        if (event.error === "not-allowed") {
          alert(
            "Microphone access denied! Please check your URL bar settings.",
          );
        } else if (event.error === "no-speech") {
          console.log("🎤 No speech detected. Microphone turned off.");
        } else {
          console.log("🎤 Speech Recognition Log:", event.error);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimTranscript("");
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current)
      return alert(
        "Speech recognition is not supported in this browser. Please use Google Chrome.",
      );

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript("");
      setInterimTranscript("");
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.log("Error starting mic:", error);
      }
    }
  };

  const handleGenerateQuiz = async () => {
    const finalTopicList = [...selectedSkills];
    if (customTopic.trim()) finalTopicList.push(customTopic.trim());

    if (finalTopicList.length === 0) return alert("Please select a skill.");

    setIsGeneratingQuiz(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/assessment/generate-quiz",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topics: finalTopicList }),
        },
      );

      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        throw new Error("Server returned an invalid response.");
      }

      if (!response.ok) {
        alert(`Failed to generate: ${data.details || data.error}`);
        return;
      }

      if (data && data.questions) {
        setQuizData(data.questions);
        setView("quiz");
      } else {
        alert("AI did not return questions properly. Please try again.");
      }
    } catch (error) {
      console.log("Quiz Generation Error:", error);
      alert(
        `Network Error: Ensure your backend server is running on port 5000.`,
      );
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleAnalyzeResponse = async () => {
    const fullText = transcript + " " + interimTranscript;

    if (fullText.trim().length < 10)
      return alert(
        "Please speak a little more so the AI can accurately analyze your confidence.",
      );

    setIsProcessing(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/assessment/analyze-confidence",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenario: CONFIDENCE_SCENARIOS[confIndex],
            answer: fullText,
          }),
        },
      );
      const data = await response.json();

      setConfScore((prev) => prev + (data.score || 70));
      setConfFeedback(data.feedback);
    } catch (error) {
      alert("Error analyzing response.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextScenario = () => {
    setConfFeedback(null);
    setTranscript("");
    setInterimTranscript("");

    if (confIndex < CONFIDENCE_SCENARIOS.length - 1) {
      setConfIndex((prev) => prev + 1);
    } else {
      setView("final_results");
    }
  };

  const handleSaveResult = async () => {
    setIsSaving(true);
    const finalQuizScore = isQuizCompleted
      ? Math.min(100, Math.round(quizScore))
      : 0;
    const finalConfScore = Math.round(confScore / CONFIDENCE_SCENARIOS.length);

    try {
      const response = await fetch(
        "http://localhost:5000/api/assessment/save-result",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentName: "Current User",
            skillsSelected: [...selectedSkills, customTopic].filter(Boolean),
            quizScore: finalQuizScore,
            confidenceScore: finalConfScore,
          }),
        },
      );

      if (response.ok) setSaveStatus("success");
      else setSaveStatus("error");
    } catch (error) {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(
      selectedSkills.includes(skill)
        ? selectedSkills.filter((s) => s !== skill)
        : [...selectedSkills, skill],
    );
  };

  const handleQuizAnswer = (optionIndex) => {
    const isCorrect =
      optionIndex === quizData[currentQuizIndex].correctAnswerIndex;
    setAnswerStatus(isCorrect ? "correct" : "wrong");
    if (isCorrect) setQuizScore((prev) => prev + 4.4);
    setShowExplanation(true);
  };

  const handleTextSubmit = () => {
    if (textAnswer.trim().length < 5)
      return alert("Please provide a longer answer.");
    setAnswerStatus("answered");
    setQuizScore((prev) => prev + 8.0);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex < quizData.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
      setAnswerStatus(null);
      setShowExplanation(false);
      setTextAnswer("");
    } else {
      setIsQuizCompleted(true);
      setView("quiz_summary");
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-slate-950 font-sans text-slate-100 pb-10">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black -z-10"></div>

        {/* UPDATED NAVBAR WITH LEADERBOARD BUTTON */}
        <nav className="fixed w-full bg-slate-900/80 backdrop-blur-lg z-50 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setView("menu")}
            >
              <Brain className="w-8 h-8 text-purple-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Career Guide
              </span>
            </div>

            <button
              onClick={() => setView("leaderboard")}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all"
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              Leaderboard
            </button>
          </div>
        </nav>

        <main className="pt-24">
          {/* LEADERBOARD VIEW */}
          {view === "leaderboard" && (
            <Leaderboard onBack={() => setView("menu")} />
          )}

          {view === "menu" && (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 text-center">
                Select Assessment Mode
              </h1>
              <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                <div
                  onClick={() => !isQuizCompleted && setView("topic_selection")}
                  className={`p-8 rounded-3xl border ${isQuizCompleted ? "border-green-500 bg-green-900/10 cursor-default" : "border-purple-500/30 hover:border-purple-500 bg-slate-800/50 cursor-pointer"}`}
                >
                  <FileText
                    className={`w-12 h-12 mb-4 ${isQuizCompleted ? "text-green-400" : "text-purple-400"}`}
                  />
                  <h2 className="text-2xl font-bold mb-2">
                    1. Comprehensive Assessment
                  </h2>
                  <p className="text-gray-400">
                    Mixed questions (MCQ, Short, Essay) based on your skills.
                  </p>
                </div>
                <div
                  onClick={() => setView("confidence_intro")}
                  className="bg-slate-800/50 p-8 rounded-3xl cursor-pointer hover:border-cyan-500 border border-cyan-500/30"
                >
                  <Activity className="w-12 h-12 text-cyan-400 mb-4" />
                  <h2 className="text-2xl font-bold mb-2">
                    2. Confidence Check
                  </h2>
                  <p className="text-gray-400">
                    Voice-based scenario analysis and professional confidence
                    scoring.
                  </p>
                </div>
              </div>
            </div>
          )}

          {view === "topic_selection" && (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
              <div className="w-full max-w-2xl bg-slate-800/50 rounded-3xl p-8 border border-purple-500/30">
                <h2 className="text-2xl font-bold mb-6 text-center">
                  Select Your Skills
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                  {PREDEFINED_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`p-3 rounded-xl border text-sm ${selectedSkills.includes(skill) ? "bg-purple-600 border-purple-500" : "bg-white/5 border-white/10 text-gray-300"}`}
                    >
                      {skill}{" "}
                      {selectedSkills.includes(skill) && (
                        <CheckCircle2 className="w-4 h-4 ml-2 inline" />
                      )}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl p-4 mb-6 outline-none text-white"
                  placeholder="Ex: Rust, Go, Docker..."
                />
                <button
                  onClick={handleGenerateQuiz}
                  disabled={isGeneratingQuiz}
                  className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold flex items-center justify-center gap-2 text-white"
                >
                  {isGeneratingQuiz ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" /> Generating
                      Assessment...
                    </>
                  ) : (
                    "Generate Questions"
                  )}
                </button>
              </div>
            </div>
          )}

          {view === "quiz" && (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
              <div className="w-full max-w-2xl bg-slate-800/50 rounded-3xl p-8 border border-purple-500/30">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-purple-400 font-semibold uppercase">
                    {quizData[currentQuizIndex].type} | {currentQuizIndex + 1}/
                    {quizData.length}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-8">
                  {quizData[currentQuizIndex].question}
                </h2>

                <div className="space-y-4 mb-8">
                  {quizData[currentQuizIndex].type === "mcq" ? (
                    quizData[currentQuizIndex].options.map((opt, idx) => {
                      let btnClass = "bg-white/5 border-white/10";
                      if (answerStatus !== null) {
                        if (
                          idx === quizData[currentQuizIndex].correctAnswerIndex
                        )
                          btnClass =
                            "bg-green-500/20 border-green-500 text-green-300";
                        else if (answerStatus === "wrong")
                          btnClass = "opacity-50";
                      }
                      return (
                        <button
                          key={idx}
                          onClick={() =>
                            answerStatus === null && handleQuizAnswer(idx)
                          }
                          disabled={answerStatus !== null}
                          className={`w-full text-left p-4 rounded-xl border transition-all text-white ${btnClass}`}
                        >
                          {opt}
                        </button>
                      );
                    })
                  ) : (
                    <div className="flex flex-col gap-4">
                      <textarea
                        value={textAnswer}
                        onChange={(e) => setTextAnswer(e.target.value)}
                        disabled={answerStatus !== null}
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-4 h-32 outline-none text-white"
                        placeholder="Type your answer here..."
                      />
                      {answerStatus === null && (
                        <button
                          onClick={handleTextSubmit}
                          className="self-end px-6 py-3 bg-purple-600 rounded-xl font-bold text-white"
                        >
                          Submit
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {showExplanation && (
                  <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <p className="text-yellow-200 text-sm">
                      <span className="font-bold">AI Feedback:</span>{" "}
                      {quizData[currentQuizIndex].explanation}
                    </p>
                  </div>
                )}

                {answerStatus !== null && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-3 bg-white text-purple-900 font-bold rounded-xl flex items-center gap-2"
                    >
                      {currentQuizIndex < quizData.length - 1
                        ? "Next Question"
                        : "Finish"}{" "}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "quiz_summary" && (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
              <div className="w-full max-w-lg bg-slate-800/50 rounded-3xl p-8 border border-purple-500/30 text-center">
                <Trophy className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">
                  Assessment Completed!
                </h2>
                <div className="text-4xl font-bold mt-4 mb-8 text-white">
                  {Math.min(100, Math.round(quizScore))}%
                </div>
                <button
                  onClick={() => setView("menu")}
                  className="w-full py-4 rounded-xl bg-purple-600 font-bold text-white"
                >
                  Back to Main Menu
                </button>
              </div>
            </div>
          )}

          {view === "confidence_intro" && (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Phase 2: Confidence Check
              </h2>
              <p className="text-gray-400 max-w-lg mb-8">
                Click the microphone to start. We will show your text in
                real-time as you speak!
              </p>
              <button
                onClick={() => setView("confidence")}
                className="bg-cyan-500 px-8 py-3 rounded-full font-bold mt-4 text-white"
              >
                Start Scenarios
              </button>
            </div>
          )}

          {view === "confidence" && (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
              <div className="w-full max-w-3xl bg-slate-800/50 rounded-3xl p-8 border border-cyan-500/30 text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 mb-4">
                  Scenario {confIndex + 1} of {CONFIDENCE_SCENARIOS.length}
                </span>
                <h2 className="text-2xl font-bold mb-6 text-white">
                  "{CONFIDENCE_SCENARIOS[confIndex]}"
                </h2>

                {confFeedback ? (
                  <div className="flex flex-col items-center space-y-6 animate-in fade-in zoom-in">
                    <div className="w-full bg-cyan-900/20 border border-cyan-500/50 rounded-xl p-6 text-left">
                      <h3 className="text-xl font-bold text-cyan-300 mb-2 flex items-center gap-2">
                        <Brain className="w-6 h-6" /> AI Confidence Analysis
                      </h3>
                      <p className="text-gray-200 text-lg leading-relaxed">
                        {confFeedback}
                      </p>
                    </div>
                    <button
                      onClick={handleNextScenario}
                      className="bg-cyan-500 hover:bg-cyan-400 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition"
                    >
                      {confIndex < CONFIDENCE_SCENARIOS.length - 1
                        ? "Next Scenario"
                        : "View Final Results"}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-6">
                    {!isProcessing ? (
                      <button
                        onClick={toggleRecording}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording ? "bg-red-500 animate-pulse shadow-lg shadow-red-500/50" : "bg-cyan-500 hover:bg-cyan-400 hover:scale-105"}`}
                      >
                        {isRecording ? (
                          <MicOff className="w-8 h-8 text-white" />
                        ) : (
                          <Mic className="w-8 h-8 text-white" />
                        )}
                      </button>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
                        <span className="text-cyan-400 font-medium animate-pulse">
                          Analyzing tone & confidence...
                        </span>
                      </div>
                    )}

                    <div className="w-full bg-black/30 rounded-xl p-4 min-h-[120px] border border-white/10 text-left relative">
                      {isRecording && (
                        <div className="absolute top-2 right-4 flex gap-1 items-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                          <span className="text-red-400 text-xs font-bold">
                            REC
                          </span>
                        </div>
                      )}

                      <p className="text-gray-200 text-lg leading-relaxed">
                        {transcript}
                        <span className="text-gray-400 italic">
                          {interimTranscript}
                        </span>
                      </p>

                      {!(transcript || interimTranscript) && (
                        <p className="text-gray-500 italic text-center mt-6">
                          {isProcessing
                            ? "Sending audio transcript to AI..."
                            : "Click the mic and speak your answer clearly. Text will appear here in real-time."}
                        </p>
                      )}
                    </div>

                    {(transcript || interimTranscript) &&
                      !isRecording &&
                      !isProcessing && (
                        <button
                          onClick={handleAnalyzeResponse}
                          className="bg-white text-cyan-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition"
                        >
                          Analyze Answer
                        </button>
                      )}
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "final_results" && (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
              <div className="w-full max-w-2xl bg-slate-800/50 rounded-3xl p-8 text-center border border-white/20">
                <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-2">Final Results!</h2>
                <div className="flex justify-center gap-4 mt-8">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 rounded-full border border-white/20 text-white"
                  >
                    Start New
                  </button>
                  <button
                    onClick={handleSaveResult}
                    disabled={isSaving || saveStatus === "success"}
                    className={`px-8 py-3 rounded-full font-bold flex items-center gap-2 text-white ${saveStatus === "success" ? "bg-green-500" : "bg-purple-600"}`}
                  >
                    {isSaving ? (
                      <Loader2 className="animate-spin" />
                    ) : saveStatus === "success" ? (
                      <CheckCircle2 />
                    ) : (
                      <Save />
                    )}
                    {saveStatus === "success" ? "Saved" : "Save Results"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
