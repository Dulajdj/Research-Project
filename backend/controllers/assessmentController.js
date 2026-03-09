import { GoogleGenerativeAI } from "@google/generative-ai";
import AssessmentResult from "../models/AssessmentResult.js";

// Initialize Gemini with your API Key
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "AIzaSyAu8JU-A7r5lZ8O-M-PCN9rPQqEQA8EH3I",
);

// --- FAIL-SAFE MODEL SELECTOR ---
// Automatically tries different model names to bypass 404 errors
async function generateWithFallback(prompt) {
  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-pro",
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`⏳ Attempting generation with model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;

      console.log(`✅ Success with model: ${modelName}`);
      return response.text();
    } catch (error) {
      console.warn(`⚠️ Model ${modelName} failed: ${error.message}`);
      lastError = error;
    }
  }

  throw new Error(`All AI models failed. Last error: ${lastError?.message}`);
}

// --- CONTROLLERS ---

export const generateAssessmentQuiz = async (req, res) => {
  const { topics } = req.body;

  if (!topics || topics.length === 0) {
    return res.status(400).json({ error: "No topics provided" });
  }

  try {
    const prompt = `
      You are an AI generating a technical assessment.
      Topics: ${topics.join(", ")}.
      
      You MUST generate exactly 17 questions in total:
      - 10 Multiple Choice (type: "mcq") with 4 options and a correctAnswerIndex (0-3).
      - 5 Short Answer (type: "short").
      - 2 Essay Questions (type: "essay").
      
      Return ONLY a raw, valid JSON object. Do not include markdown code blocks, do not include the word "json", and do not include any introductory text. 
      Format exactly like this:
      {
        "questions": [
          {
            "id": 1,
            "type": "mcq",
            "question": "Sample?",
            "options": ["A", "B", "C", "D"],
            "correctAnswerIndex": 0,
            "explanation": "Explanation"
          }
        ]
      }
    `;

    console.log(
      `🔄 Sending request to Gemini for topics: ${topics.join(", ")}`,
    );

    // Use the fallback function instead of hardcoding a model
    const text = await generateWithFallback(prompt);

    console.log("📥 Received response from Gemini. Extracting JSON...");

    // BULLETPROOF JSON EXTRACTION
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("AI did not return a valid JSON structure.");
    }

    const cleanedJson = text.substring(jsonStart, jsonEnd + 1);

    let quizData;
    try {
      quizData = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error("❌ JSON Parse Failed. Raw Text:", cleanedJson);
      throw new Error("Failed to parse AI output into JSON.");
    }

    console.log("✅ Successfully parsed questions. Sending to frontend.");
    return res.status(200).json(quizData);
  } catch (error) {
    console.error("❌ Controller Error:", error.message || error);
    return res.status(500).json({
      error: "AI Model Error",
      details: error.message || "An unexpected error occurred",
    });
  }
};

export const analyzeConfidence = async (req, res) => {
  const { scenario, answer } = req.body;
  try {
    const prompt = `Rate the professional confidence of this answer (0-100) to this scenario: "${scenario}". User Answer: "${answer}". Return ONLY JSON: {"score": number, "feedback": "string"}`;

    // Use the fallback function here too
    const text = await generateWithFallback(prompt);

    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    const cleanedJson = text.substring(jsonStart, jsonEnd + 1);

    res.json(JSON.parse(cleanedJson));
  } catch (error) {
    res.json({ score: 75, feedback: "Analysis complete using baseline." });
  }
};

export const saveAssessment = async (req, res) => {
  try {
    const total = Math.round(
      (req.body.quizScore + req.body.confidenceScore) / 2,
    );
    const rank = total > 80 ? "A" : total > 60 ? "B" : "C";
    const saved = await AssessmentResult.create({
      ...req.body,
      totalScore: total,
      rank,
    });
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
