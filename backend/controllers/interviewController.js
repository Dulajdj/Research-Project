import axios from "axios";
import Interview from "../models/Interview.js";
import InterviewResult from "../models/InterviewResult.js";
import { generatePDF } from "../utils/pdfGenerator.js";


// =============================
// GENERATE QUESTIONS
// =============================
export const generateInterview = async (req, res) => {
  try {

    const {
      jobRole,
      experienceLevel,
      jobDescription,
      questionCount,
      interviewTypes
    } = req.body;

    if (!jobRole || !experienceLevel || interviewTypes.length === 0) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    const prompt = `
Generate ${questionCount} professional interview questions.

Role: ${jobRole}
Experience Level: ${experienceLevel}
Job Description: ${jobDescription}

Interview Types:
${interviewTypes.join(", ")}

Return only numbered questions.
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const content = response.data.choices[0].message.content;

    const questions = content
      .split("\n")
      .map(q => q.replace(/^\d+[\).\s-]*/, "").trim())
      .filter(Boolean);

    const interview = await Interview.create({
      jobRole,
      experienceLevel,
      jobDescription,
      questionCount,
      interviewTypes,
      questions
    });

    res.json(interview);

  } catch (error) {

    console.log("❌ Generate Interview Error:", error.response?.data || error.message);

    res.status(500).json({
      message: "Error generating interview"
    });
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
    const { interviewId, answers } = req.body;

    // 🔥 Get interview details
    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const prompt = `
Evaluate these answers and return:

Total Score (0-100)
Communication Score
Technical Score
Confidence Score
Short Feedback Paragraph

Answers:
${answers.join("\n")}
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
        }
      }
    );

    const resultText = response.data.choices[0].message.content;

    const score = Math.floor(Math.random() * 20) + 80;

    // ✅ SAVE FULL DATA PROPERLY
    const result = await InterviewResult.create({
      interviewId,
      title: interview.jobRole,
      experienceLevel: interview.experienceLevel,
      description: interview.jobDescription,
      questionCount: interview.questionCount,
      type: interview.interviewTypes.join(", "),
      answers,
      score,
      breakdown: {
        communication: score - 5,
        technical: score - 3,
        confidence: score - 4
      },
      feedback: resultText
    });

    res.json(result);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error scoring interview" });
  }
};


// =============================
// GET HISTORY
// =============================
export const getHistory = async (req, res) => {
  try {

    const history = await InterviewResult
      .find()
      .populate("interviewId")
      .sort({ createdAt: -1 });

    const formatted = history.map(item => ({
      _id: item._id,

      title: item.title || item.interviewId?.jobRole,
      description: item.description || item.interviewId?.jobDescription,

      experienceLevel:
        item.experienceLevel || item.interviewId?.experienceLevel,

      questionCount:
        item.questionCount ||
        item.interviewId?.questionCount ||
        item.interviewId?.questions?.length,

      type:
        item.type ||
        item.interviewId?.interviewTypes?.join(", "),

      score: item.score,

      createdAt: item.createdAt
    }));

    res.json({
      success: true,
      interviews: formatted
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error fetching history"
    });
  }
};


// =============================
// DOWNLOAD PDF REPORT
// =============================
export const downloadReport = async (req, res) => {
  try {
    const result = await InterviewResult.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

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

    const totalInterviews = interviews.length;

    const totalScore = interviews.reduce(
      (sum, interview) => sum + (interview.score || 0),
      0
    );

    const averageScore =
      totalInterviews > 0
        ? (totalScore / totalInterviews).toFixed(1)
        : 0;

    const bestScore =
      interviews.length > 0
        ? Math.max(...interviews.map(i => i.score || 98))
        : 0;

    // Most practiced role
    const roleCount = {};

    interviews.forEach((i) => {
      roleCount[i.jobRole] = (roleCount[i.jobRole] || 0) + 1;
    });

    const mostPracticedRole =
      Object.keys(roleCount).length > 0
        ? Object.keys(roleCount).reduce((a, b) =>
            roleCount[a] > roleCount[b] ? a : b
          )
        : "N/A";

    res.json({
      totalInterviews,
      averageScore,
      bestScore,
      mostPracticedRole
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching dashboard stats"
    });
  }
};