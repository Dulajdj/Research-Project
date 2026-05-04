import axios from "axios";
import Interview from "../models/Interview.js";
import InterviewResult from "../models/InterviewResult.js";
import { generatePDF } from "../utils/pdfGenerator.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";


const HF_API_KEY = process.env.HF_KEY;

const HF_API_URL = `https://api-inference.huggingface.co/models/google/flan-t5-large`;


async function callHF(prompt, maxTokens = 800) {
  try {
    const response = await axios.post(
      HF_API_URL,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: maxTokens,
          temperature: 0.7,
          do_sample: true,
          return_full_text: false,  
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000, 
      }
    );

    // HF returns an array: [{ generated_text: "..." }]
    if (Array.isArray(response.data) && response.data[0]?.generated_text) {
      return response.data[0].generated_text.trim();
    }

    // Some models return { generated_text: "..." } directly
    if (response.data?.generated_text) {
      return response.data.generated_text.trim();
    }

    throw new Error("Unexpected HuggingFace response format: " + JSON.stringify(response.data));

  } catch (error) {
    // HF returns 503 when model is loading (cold start)
    if (error.response?.status === 503) {
      throw new Error("HuggingFace model is loading. Please wait 20-30 seconds and try again.");
    }
    // HF returns 429 when rate limited
    if (error.response?.status === 429) {
      throw new Error("HuggingFace rate limit reached. Please try again shortly.");
    }
    throw new Error("HuggingFace API error: " + (error.response?.data?.error || error.message));
  }
}

function parseJSON(raw) {
  try {
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Could not parse model response as JSON");
  }
}


async function extractPDFText(buffer) {
  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  const pdf = await loadingTask.promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map(item => item.str).join(" ") + "\n";
  }
  return fullText;
}


const interviewTypeConfigs = {
  "Structured": {
    questionStyle: `- All questions must be fixed, formal, and standardized\n- Use the same question format for ALL candidates\n- Questions follow strict order: background → skills → situational → goals`,
    meetingStyle: "formal_structured",
    aiGreetingExtra: "This is a formal structured interview. I will ask each question one by one."
  },
  "Unstructured": {
    questionStyle: `- Questions must be open-ended and conversational\n- Avoid yes/no questions — focus on storytelling\n- Questions should feel like a natural conversation`,
    meetingStyle: "casual_conversational",
    aiGreetingExtra: "This will be a relaxed, conversational interview. Feel free to speak openly."
  },
  "Panel": {
    questionStyle: `- Label each question with panel member: [HR]:, [Tech Lead]:, or [Manager]:\n- HR asks culture fit, Tech Lead asks technical depth, Manager asks leadership`,
    meetingStyle: "panel_multi_perspective",
    aiGreetingExtra: "You are being interviewed by a panel today."
  },
  "One-on-One": {
    questionStyle: `- Personal, direct and conversational\n- Build progressively — each question leads into the next\n- Mix personal background, achievements, and role-specific skills`,
    meetingStyle: "personal_direct",
    aiGreetingExtra: "This is a personal one-on-one interview."
  },
  "Competency-Based": {
    questionStyle: `- ALL questions must follow STAR method\n- Every question starts with "Tell me about a time when..." or "Describe a situation where..."\n- Each question targets a DIFFERENT competency`,
    meetingStyle: "star_method",
    aiGreetingExtra: "This is a competency-based interview. Please answer using the STAR method."
  },
  "Phone/Video Screening": {
    questionStyle: `- Short, screening-level questions only\n- Focus on: availability, basic qualifications, why they applied\n- Questions should be answerable in 1-2 minutes`,
    meetingStyle: "quick_screening",
    aiGreetingExtra: "This is a quick screening call."
  },
  "Group Interview": {
    questionStyle: `- Questions assess group dynamics and collaboration\n- Focus on: leadership, conflict resolution, teamwork\n- Questions reveal how the candidate competes AND cooperates`,
    meetingStyle: "group_dynamics",
    aiGreetingExtra: "This is a group interview assessing teamwork and collaboration."
  }
};

const defaultConfig = {
  questionStyle: "- Mix behavioral and technical questions\n- Make questions progressively deeper",
  meetingStyle: "standard",
  aiGreetingExtra: ""
};

const getConfigForTypes = (interviewTypes) => {
  const matched = interviewTypes.map(t => interviewTypeConfigs[t]).filter(Boolean);
  if (matched.length === 0) return defaultConfig;
  return {
    questionStyle: matched.map(c => c.questionStyle).join("\n"),
    meetingStyle: matched[0].meetingStyle,
    aiGreetingExtra: matched.map(c => c.aiGreetingExtra).filter(Boolean).join(" ")
  };
};


export const generateInterview = async (req, res) => {
  try {
    const { jobRole, experienceLevel, jobDescription, questionCount, interviewTypes } = req.body;

    if (!jobRole || !experienceLevel || interviewTypes.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const config = getConfigForTypes(interviewTypes);

    // HF models work better with explicit instruction format
    const prompt = `[INST] You are a professional interview question generator.

Generate exactly ${questionCount} interview questions for:
- Job Role: ${jobRole}
- Experience Level: ${experienceLevel}
- Job Description: ${jobDescription || "Not provided"}
- Interview Type: ${interviewTypes.join(", ")}

Question style rules:
${config.questionStyle}

Return ONLY the numbered questions, no extra text, no explanations.
Example format:
1. Question here
2. Question here [/INST]`;

    console.log("🤗 HF: Generating interview questions for", jobRole);
    const content = await callHF(prompt, 600);

    const questions = content
      .split("\n")
      .map(q => q.replace(/^\d+[\).\s-]*/, "").trim())
      .filter(q => q.length > 10);

    if (questions.length === 0) {
      return res.status(500).json({ message: "Model did not return valid questions. Try again." });
    }

    const interview = await Interview.create({
      jobRole, experienceLevel, jobDescription, questionCount,
      interviewTypes, questions,
      meetingStyle: config.meetingStyle,
      aiGreetingExtra: config.aiGreetingExtra
    });
     // ── STEP 2: Generate a UNIQUE intro prompt every single time ──────────
    const introPromptRequest = `
You are an AI interview host starting a ${interviewTypes.join(" + ")} interview for a ${jobRole} (${experienceLevel} level) position.

Write a single, natural-sounding introduction request to ask the candidate to introduce themselves.
The tone should be ${config.introStyle}

STRICT RULES:
- Write ONLY the spoken introduction request — no labels, no quotes, no extra text
- It must be between 2 and 4 sentences long
- Make it feel FRESH and DIFFERENT from a standard template — vary the wording, sentence structure, and specific things you ask about
- Naturally reference the job role "${jobRole}" somewhere in the request
- Do NOT start with "Hello", "Hi", "Welcome", or "Good" — jump straight into the request
- The candidate should know exactly what to cover in their introduction

Write the introduction request now:
`;

    const introResponse = await axios.post(
      {
        messages: [{ role: "user", content: introPromptRequest }],
        temperature: 0.95
      },
      { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}`, "Content-Type": "application/json" } }
    );

    const generatedIntroPrompt = introResponse.data.choices[0].message.content.trim();
    console.log("✅ Generated unique introPrompt:", generatedIntroPrompt);


    console.log("✅ HF: Generated", questions.length, "questions");
    res.json(interview);

  } catch (error) {
    console.error("❌ HF Generate Error:", error.message);
    res.status(500).json({ message: error.message || "Error generating interview" });
  }
};



export const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    res.json(interview);
  } catch {
    res.status(500).json({ message: "Error fetching interview" });
  }
};



export const scoreInterview = async (req, res) => {
  try {
    const { interviewId, answers, voiceFlags, introAnswer } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const hasVoiceAnswers = voiceFlags && voiceFlags.some(v => v === true);

    const questionsAndAnswers = interview.questions.map((q, i) =>
      `Q${i + 1}: ${q}\nAnswer: ${answers[i] || "No answer provided"}`
    ).join("\n\n");

    const prompt = `[INST] You are a professional interview evaluator. Evaluate these interview answers strictly and fairly.

Job Role: ${interview.jobRole}
Experience Level: ${interview.experienceLevel}

${questionsAndAnswers}

Return ONLY a valid JSON object (no markdown, no extra text):
{
  "totalScore": <0-100>,
  "technicalScore": <0-100>,
  "communicationScore": ${hasVoiceAnswers ? "<0-100>" : "null"},
  "confidenceScore": ${hasVoiceAnswers ? "<0-100>" : "null"},
  "overallFeedback": "<2-3 sentence feedback>",
  "questionReviews": [
    { "questionIndex": 0, "score": <0-10>, "idealAnswer": "<ideal answer>", "comment": "<one sentence>" }
  ]
}

Rules: Score only on answer quality. Blank or irrelevant answers = 0-2/10. Be strict. [/INST]`;

    console.log("🤗 HF: Scoring interview answers...");
    const rawText = await callHF(prompt, 1000);
    const parsed = parseJSON(rawText);

    const breakdown = {
      technical: parsed.technicalScore ?? 0,
      communication: hasVoiceAnswers ? (parsed.communicationScore ?? 0) : 0,
      confidence: hasVoiceAnswers ? (parsed.confidenceScore ?? 0) : 0
    };

    const result = await InterviewResult.create({
      interviewId,
      title: interview.jobRole,
      experienceLevel: interview.experienceLevel,
      description: interview.jobDescription,
      questionCount: interview.questionCount,
      type: interview.interviewTypes.join(", "),
      answers, introAnswer,
      score: parsed.totalScore,
      breakdown,
      feedback: parsed.overallFeedback,
      questionReviews: parsed.questionReviews,
      voiceAnalysis: { hasVoiceAnswers, voiceFlags: voiceFlags || [] }
    });

    console.log("✅: Score:", parsed.totalScore);
    res.json(result);

  } catch (error) {
    console.error("❌ Score Error:", error.message);
    res.status(500).json({ message: error.message || "Error scoring interview" });
  }
};



export const getHistory = async (req, res) => {
  try {
    const history = await InterviewResult.find().populate("interviewId").sort({ createdAt: -1 });
    const formatted = history.map(item => ({
      _id: item._id,
      title: item.title || item.interviewId?.jobRole,
      description: item.description || item.interviewId?.jobDescription,
      experienceLevel: item.experienceLevel || item.interviewId?.experienceLevel,
      questionCount: item.questionCount || item.interviewId?.questionCount,
      type: item.type || item.interviewId?.interviewTypes?.join(", "),
      score: item.score,
      createdAt: item.createdAt
    }));
    res.json({ success: true, interviews: formatted });
  } catch (error) {
    res.status(500).json({ message: "Error fetching history" });
  }
};



export const downloadReport = async (req, res) => {
  try {
    const result = await InterviewResult.findById(req.params.id);
    if (!result) return res.status(404).json({ message: "Result not found" });
    generatePDF(result, res);
  } catch (error) {
    res.status(500).json({ message: "Error generating PDF" });
  }
};



export const getDashboardStats = async (req, res) => {
  try {
    const interviews = await Interview.find();
    const results = await InterviewResult.find();
    const scoresArray = results.map(r => r.score).filter(s => typeof s === "number");
    const totalScore = scoresArray.reduce((sum, s) => sum + s, 0);
    const averageScore = scoresArray.length > 0 ? parseFloat((totalScore / scoresArray.length).toFixed(1)) : 0;
    const bestScore = scoresArray.length > 0 ? Math.max(...scoresArray) : 0;
    const roleCount = {};
    interviews.forEach(i => { if (i.jobRole) roleCount[i.jobRole] = (roleCount[i.jobRole] || 0) + 1; });
    const mostPracticedRole = Object.keys(roleCount).length > 0
      ? Object.keys(roleCount).reduce((a, b) => roleCount[a] > roleCount[b] ? a : b) : "N/A";
    res.json({ totalInterviews: interviews.length, averageScore, bestScore, mostPracticedRole });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
};


// ============================================================
// PRACTICE MODE — GENERATE 
// ============================================================
export const generatePracticeQuestions = async (req, res) => {
  try {
    const { jobRole, questionCount } = req.body;
    const count = parseInt(questionCount) || 5;

    if (!jobRole?.trim()) {
      return res.status(400).json({ message: "Job role is required." });
    }

    let resumeText = "";
    if (req.file) {
      try {
        resumeText = await extractPDFText(req.file.buffer);
      } catch (pdfErr) {
        return res.status(400).json({ message: "Failed to parse PDF: " + pdfErr.message });
      }
    } else if (req.body.resumeText && req.body.resumeText !== "__PDF__") {
      resumeText = req.body.resumeText;
    }

    if (resumeText.trim()) {
      const checkPrompt = `[INST] Check if this resume matches the target job role.

Target Role: "${jobRole}"
Resume: ${resumeText.slice(0, 2000)}

Reply ONLY with valid JSON:
{ "isRelevant": true or false, "resumeField": "<domain of resume>", "reason": "<one sentence>" } [/INST]`;

      const checkRaw = await callHF(checkPrompt, 150);
      let relevance;
      try { relevance = parseJSON(checkRaw); } catch { relevance = { isRelevant: true }; }

      if (!relevance.isRelevant) {
        return res.status(422).json({
          mismatch: true,
          resumeField: relevance.resumeField || "a different field",
          targetRole: jobRole,
          reason: relevance.reason || "Resume domain does not match the selected role.",
        });
      }
    }

    const prompt = resumeText.trim()
      ? `[INST] Generate exactly ${count} interview questions for a ${jobRole} position based on this resume.

Tailor ALL questions to the candidate's actual experience and projects in the resume.
Return ONLY numbered questions.

Resume: ${resumeText.slice(0, 3000)}

Generate exactly ${count} questions: [/INST]`
      : `[INST] Generate exactly ${count} practice interview questions for a ${jobRole} position.
Return ONLY numbered questions like:
1. Question here
2. Question here [/INST]`;

    console.log("🤗 HF: Generating practice questions for", jobRole);
    const content = await callHF(prompt, 500);

    const questions = content
      .split("\n")
      .map(q => q.replace(/^\d+[\).\s-]*/, "").trim())
      .filter(q => q.length > 10)
      .slice(0, count);

    if (questions.length === 0) {
      return res.status(500).json({ message: "Model did not return valid questions. Try again." });
    }

    res.json({ questions, resumeUsed: !!resumeText.trim() });

  } catch (error) {
    console.error("❌ HF Practice Generate Error:", error.message);
    res.status(500).json({ message: error.message || "Error generating questions" });
  }
};

export const scorePracticeAnswers = async (req, res) => {
  try {
    const { jobRole, questions, answers } = req.body;

    if (!jobRole || !questions || !answers) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const qaText = questions.map((q, i) =>
      `Q${i + 1}: ${q}\nAnswer: ${answers[i] || "Skipped"}`
    ).join("\n\n");

    const prompt = `[INST] Score these practice interview answers for a ${jobRole} role.

${qaText}

Return ONLY valid JSON:
{
  "totalScore": <0-100>,
  "feedback": "<2 sentence overall feedback>",
  "reviews": [
    { "score": <0-10>, "comment": "<one line>", "idealAnswer": "<brief ideal answer>" }
  ]
}

Rules: "Skipped" = 0. Be strict but fair. [/INST]`;

    console.log("🤗 HF: Scoring practice answers for", jobRole);
    const rawText = await callHF(prompt, 800);
    const parsed = parseJSON(rawText);

    res.json(parsed);

  } catch (error) {
    console.error("❌ HF Practice Score Error:", error.message);
    res.status(500).json({ message: error.message || "Error scoring answers" });
  }
};