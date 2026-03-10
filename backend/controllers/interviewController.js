import axios from "axios";
import Interview from "../models/Interview.js";
import InterviewResult from "../models/InterviewResult.js";
import { generatePDF } from "../utils/pdfGenerator.js";


// =============================
// INTERVIEW TYPE CONFIGURATIONS
// =============================
const interviewTypeConfigs = {
  "Structured": {
    questionStyle: `
- All questions must be fixed, formal, and standardized
- Every question should be clear, direct and measurable
- Use the same question format that would be asked to ALL candidates equally
- Include rating-scale style questions (e.g. "On a scale of 1-10, how would you rate your skill in X and why?")
- Questions should follow a strict logical order: background → skills → situational → goals
- NO follow-up style questions — each question must stand alone
`,
    meetingStyle: "formal_structured",
    aiGreetingExtra: "This is a formal structured interview. I will ask each question one by one in a fixed order."
  },
  "Unstructured": {
    questionStyle: `
- Questions must be open-ended, conversational, and exploratory
- Allow the candidate to guide the direction of answers
- Include broad, thought-provoking questions like "Tell me about yourself in your own way"
- Avoid yes/no questions — focus on storytelling and free expression
- Questions should feel like a natural conversation, not a rigid interview
- Mix personal, professional and hypothetical questions freely
`,
    meetingStyle: "casual_conversational",
    aiGreetingExtra: "This will be a relaxed, conversational interview. Feel free to speak openly and take your time."
  },
  "Panel": {
    questionStyle: `
- Questions should come from MULTIPLE perspectives (HR, Technical Lead, Manager)
- Label each question with the panel member asking it, e.g. [HR]: ... or [Tech Lead]: ... or [Manager]: ...
- Include diverse question types: HR asks about culture fit, Tech Lead asks technical depth, Manager asks about leadership
- Questions should challenge the candidate from different angles simultaneously
- Include at least one cross-functional question that requires multiple skills to answer
`,
    meetingStyle: "panel_multi_perspective",
    aiGreetingExtra: "You are being interviewed by a panel today. Questions will come from different interviewers including HR, a Technical Lead, and a Manager."
  },
  "One-on-One": {
    questionStyle: `
- Questions should be personal, direct and conversational between one interviewer and one candidate
- Build progressively — each question should naturally lead into the next topic
- Include a mix of personal background, professional achievements, and role-specific skills
- Use follow-up style phrasing like "Can you elaborate on..." or "Walk me through..."
- Create a comfortable but professional tone throughout
`,
    meetingStyle: "personal_direct",
    aiGreetingExtra: "This is a personal one-on-one interview. We will have a direct and focused conversation today."
  },
  "Competency-Based": {
    questionStyle: `
- ALL questions must follow the STAR method format (Situation, Task, Action, Result)
- Every question must start with "Tell me about a time when..." or "Describe a situation where..." or "Give me an example of..."
- Focus on specific competencies: leadership, teamwork, problem-solving, communication, adaptability
- Each question must target a DIFFERENT competency — no repetition
- Questions should require the candidate to provide real past examples with measurable outcomes
`,
    meetingStyle: "star_method",
    aiGreetingExtra: "This is a competency-based interview. Please answer each question using the STAR method — describe the Situation, Task, Action you took, and the Result."
  },
  "Stress Interview": {
    questionStyle: `
- Questions must be intentionally challenging, pressured, and sometimes confrontational
- Include rapid-fire questions that require quick thinking
- Add hypothetical crisis scenarios: "Your system goes down 1 hour before launch — what do you do?"
- Include questions that challenge the candidate's decisions: "Why should we hire you over someone with more experience?"
- Add trick or unexpected questions to test composure under pressure
- Include at least one question that seems impossible to answer correctly
`,
    meetingStyle: "high_pressure",
    aiGreetingExtra: "This is a stress interview designed to test how you perform under pressure. Expect challenging and direct questions. Stay calm and composed."
  },
  "Phone/Video Screening": {
    questionStyle: `
- Questions must be short, screening-level, and designed to quickly assess basic fit
- Focus on: availability, salary expectations, basic qualifications, location/remote preferences
- Include quick skill-check questions (not deep technical — just surface level verification)
- Questions should be answerable in 1-2 minutes each
- Include at least one question about why they applied and what they know about the role
- Keep it to essential screening criteria only — this is a first-round filter
`,
    meetingStyle: "quick_screening",
    aiGreetingExtra: "This is a quick screening call to check your basic qualifications and fit. Questions will be short and direct."
  },
  "Group Interview": {
    questionStyle: `
- Questions must be designed for group dynamics and collaboration assessment
- Include scenario-based team challenges: "If you and your team disagreed on an approach, how would you handle it?"
- Focus on: leadership emergence, conflict resolution, collaboration, communication in groups
- Include questions about how the candidate behaves in team settings vs individually
- Add role-play style questions: "Imagine you are leading a team of 5 people and one member is underperforming..."
- Questions should reveal how the candidate competes AND cooperates simultaneously
`,
    meetingStyle: "group_dynamics",
    aiGreetingExtra: "This is a group interview format assessing your teamwork, leadership, and collaboration skills. Answer with group dynamics in mind."
  }
};

const defaultConfig = {
  questionStyle: `- Mix behavioral and technical questions\n- Make questions progressively deeper\n- Include situational and role-specific questions`,
  meetingStyle: "standard",
  aiGreetingExtra: ""
};

const getConfigForTypes = (interviewTypes) => {
  const matchedConfigs = interviewTypes.map(t => interviewTypeConfigs[t]).filter(Boolean);
  if (matchedConfigs.length === 0) return defaultConfig;
  return {
    questionStyle: matchedConfigs.map(c => c.questionStyle).join("\n"),
    meetingStyle: matchedConfigs[0].meetingStyle,
    aiGreetingExtra: matchedConfigs.map(c => c.aiGreetingExtra).filter(Boolean).join(" ")
  };
};


// =============================
// GENERATE QUESTIONS
// =============================
export const generateInterview = async (req, res) => {
  try {
    const { jobRole, experienceLevel, jobDescription, questionCount, interviewTypes } = req.body;

    if (!jobRole || !experienceLevel || interviewTypes.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const config = getConfigForTypes(interviewTypes);

    const prompt = `
You are a professional interview question generator. Generate exactly ${questionCount} interview questions.

Job Role: ${jobRole}
Experience Level: ${experienceLevel}
Job Description: ${jobDescription}
Interview Format/Type: ${interviewTypes.join(", ")}

STRICT QUESTION STYLE RULES based on the interview type selected:
${config.questionStyle}

ADDITIONAL RULES:
- Do NOT include greetings or introductions
- Questions must be specifically tailored to the interview TYPE/FORMAT above, not just the job role
- The question style, tone, and format must CLEARLY reflect the interview type chosen
- Return ONLY numbered questions, no extra text, no explanations

Generate exactly ${questionCount} questions now:
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      { model: "openai/gpt-3.5-turbo", messages: [{ role: "user", content: prompt }], temperature: 0.7 },
      { headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" } }
    );

    const content = response.data.choices[0].message.content;
    const questions = content.split("\n").map(q => q.replace(/^\d+[\).\s-]*/, "").trim()).filter(Boolean);

    const interview = await Interview.create({
      jobRole, experienceLevel, jobDescription, questionCount,
      interviewTypes, questions,
      meetingStyle: config.meetingStyle,
      aiGreetingExtra: config.aiGreetingExtra
    });

    res.json(interview);

  } catch (error) {
    console.log("❌ Generate Interview Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Error generating interview" });
  }
};


// =============================
// GET INTERVIEW
// =============================
export const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    res.json(interview);
  } catch {
    res.status(500).json({ message: "Error" });
  }
};


// =============================
// SCORE INTERVIEW
// =============================
export const scoreInterview = async (req, res) => {
  try {
    const { interviewId, answers, voiceFlags, introAnswer } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const hasVoiceAnswers = voiceFlags && voiceFlags.some((v) => v === true);

    const questionsAndAnswers = interview.questions.map((q, i) => (
      `Q${i + 1}: ${q}\nCandidate Answer: ${answers[i] || "No answer provided"}`
    )).join("\n\n");

    const prompt = `
You are a professional interview evaluator. Evaluate the following interview answers strictly and fairly.

Job Role: ${interview.jobRole}
Experience Level: ${interview.experienceLevel}
Interview Type: ${interview.interviewTypes?.join(", ") || "Standard"}

${questionsAndAnswers}

Return your evaluation as a valid JSON object (no markdown, no extra text):
{
  "totalScore": <number 0-100>,
  "technicalScore": <number 0-100>,
  ${hasVoiceAnswers ? `"communicationScore": <number 0-100>, "confidenceScore": <number 0-100>,` : `"communicationScore": null, "confidenceScore": null,`}
  "overallFeedback": "<2-3 sentence overall feedback>",
  "questionReviews": [
    { "questionIndex": 0, "score": <0-10>, "idealAnswer": "<ideal answer>", "comment": "<one sentence feedback>" }
  ]
}

RULES: Score ONLY on answer quality. Blank/irrelevant = 0-2/10. Be strict.
${hasVoiceAnswers ? "- Include communication/confidence scores (voice used)" : "- Exclude communication/confidence scores (typed answers)"}
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      { model: "openai/gpt-3.5-turbo", messages: [{ role: "user", content: prompt }], temperature: 0.3 },
      { headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" } }
    );

    const rawText = response.data.choices[0].message.content;
    let parsed;
    try {
      parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim());
    } catch {
      const m = rawText.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
      else throw new Error("Could not parse AI response");
    }

    const breakdown = {
      technical: parsed.technicalScore ?? 0,
      communication: hasVoiceAnswers ? (parsed.communicationScore ?? 0) : 0,
      confidence: hasVoiceAnswers ? (parsed.confidenceScore ?? 0) : 0
    };

    const result = await InterviewResult.create({
      interviewId, title: interview.jobRole, experienceLevel: interview.experienceLevel,
      description: interview.jobDescription, questionCount: interview.questionCount,
      type: interview.interviewTypes.join(", "), answers, introAnswer,
      score: parsed.totalScore, breakdown, feedback: parsed.overallFeedback,
      questionReviews: parsed.questionReviews,
      voiceAnalysis: { hasVoiceAnswers, voiceFlags: voiceFlags || [] }
    });

    res.json(result);

  } catch (error) {
    console.error("Score error:", error.response?.data || error.message);
    res.status(500).json({ message: "Error scoring interview" });
  }
};


// =============================
// GET HISTORY
// =============================
export const getHistory = async (req, res) => {
  try {
    const history = await InterviewResult.find().populate("interviewId").sort({ createdAt: -1 });
    const formatted = history.map(item => ({
      _id: item._id,
      title: item.title || item.interviewId?.jobRole,
      description: item.description || item.interviewId?.jobDescription,
      experienceLevel: item.experienceLevel || item.interviewId?.experienceLevel,
      questionCount: item.questionCount || item.interviewId?.questionCount || item.interviewId?.questions?.length,
      type: item.type || item.interviewId?.interviewTypes?.join(", "),
      score: item.score,
      createdAt: item.createdAt
    }));
    res.json({ success: true, interviews: formatted });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching history" });
  }
};


// =============================
// DOWNLOAD PDF REPORT
// =============================
export const downloadReport = async (req, res) => {
  try {
    const result = await InterviewResult.findById(req.params.id);
    if (!result) return res.status(404).json({ message: "Result not found" });
    generatePDF(result, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error generating PDF" });
  }
};


// ===============================
// DASHBOARD ANALYTICS
// ===============================
export const getDashboardStats = async (req, res) => {
  try {
    const interviews = await Interview.find();
    const results = await InterviewResult.find();
    const totalInterviews = interviews.length;
    const scoresArray = results.map(r => r.score).filter(s => typeof s === "number");
    const totalScore = scoresArray.reduce((sum, s) => sum + s, 0);
    const averageScore = scoresArray.length > 0 ? parseFloat((totalScore / scoresArray.length).toFixed(1)) : 0;
    const bestScore = scoresArray.length > 0 ? Math.max(...scoresArray) : 0;
    const roleCount = {};
    interviews.forEach((i) => { if (i.jobRole) roleCount[i.jobRole] = (roleCount[i.jobRole] || 0) + 1; });
    const mostPracticedRole = Object.keys(roleCount).length > 0
      ? Object.keys(roleCount).reduce((a, b) => roleCount[a] > roleCount[b] ? a : b) : "N/A";
    res.json({ totalInterviews, averageScore, bestScore, mostPracticedRole });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};


// =============================
// ✅ PRACTICE MODE — GENERATE QUESTIONS
// =============================
export const generatePracticeQuestions = async (req, res) => {
  try {
    const { jobRole, questionCount } = req.body;

    if (!jobRole || !questionCount) {
      return res.status(400).json({ message: "Job role and question count are required" });
    }

    const prompt = `Generate exactly ${questionCount} practice interview questions for a ${jobRole} position.

Rules:
- Questions must be directly relevant to the ${jobRole} role
- Mix different question styles: some technical/skill-based, some situational, some about past experience
- Questions should be realistic and commonly asked in real interviews for this specific role
- Do NOT include greetings or numbering explanations
- Return ONLY the questions, numbered like: 1. question text
- No extra text, no headers, just the numbered questions`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      { model: "openai/gpt-3.5-turbo", messages: [{ role: "user", content: prompt }], temperature: 0.7 },
      { headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" } }
    );

    const content = response.data.choices[0].message.content;
    const questions = content
      .split("\n")
      .map(q => q.replace(/^\d+[\).\s-]*/, "").trim())
      .filter(Boolean)
      .slice(0, questionCount);

    if (questions.length === 0) {
      return res.status(500).json({ message: "No questions generated" });
    }

    res.json({ questions });

  } catch (error) {
    console.error("Practice generate error:", error.response?.data || error.message);
    res.status(500).json({ message: "Error generating practice questions" });
  }
};


// =============================
// ✅ PRACTICE MODE — SCORE ANSWERS
// =============================
export const scorePracticeAnswers = async (req, res) => {
  try {
    const { jobRole, questions, answers } = req.body;

    if (!jobRole || !questions || !answers) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const qaText = questions.map((q, i) =>
      `Q${i + 1}: ${q}\nAnswer: ${answers[i] || "Skipped"}`
    ).join("\n\n");

    const prompt = `You are an interview evaluator. Score the following practice interview answers for a ${jobRole} role.

${qaText}

Return ONLY valid JSON, no markdown, no extra text:
{
  "totalScore": <number 0-100>,
  "feedback": "<2 sentence overall feedback>",
  "reviews": [
    { "score": <0-10>, "comment": "<one line feedback>", "idealAnswer": "<brief ideal answer>" }
  ]
}

Rules:
- Be strict but fair
- "Skipped" answers get 0
- Score based on relevance and quality for the ${jobRole} role`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      { model: "openai/gpt-3.5-turbo", messages: [{ role: "user", content: prompt }], temperature: 0.3 },
      { headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" } }
    );

    const rawText = response.data.choices[0].message.content;
    let parsed;
    try {
      parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim());
    } catch {
      const m = rawText.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
      else throw new Error("Could not parse scoring response");
    }

    res.json(parsed);

  } catch (error) {
    console.error("Practice score error:", error.response?.data || error.message);
    res.status(500).json({ message: "Error scoring practice answers" });
  }
};