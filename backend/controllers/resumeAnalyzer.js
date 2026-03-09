import axios from "axios";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

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

export const analyzeResume = async (req, res) => {
  try {
    let { role, questionCount } = req.body;
    questionCount = parseInt(questionCount) || 5;

    let resumeText = "";

    console.log("📄 File:", req.file ? req.file.originalname : "None");
    console.log("🎯 Role:", role, "| Questions:", questionCount);

    if (req.file) {
      try {
        resumeText = await extractPDFText(req.file.buffer);
        console.log("✅ PDF parsed, length:", resumeText.length);
      } catch (pdfErr) {
        return res.status(400).json({ message: "Failed to parse PDF: " + pdfErr.message });
      }
    } else if (req.body.text && req.body.text !== "__PDF__") {
      resumeText = req.body.text;
    }

    if (!resumeText.trim()) {
      return res.status(400).json({ message: "Could not extract resume text. Try pasting text instead." });
    }

    if (!role?.trim()) {
      return res.status(400).json({ message: "Target job role is required." });
    }

    const prompt = `
You are an expert resume reviewer and interview coach.
Analyze this resume for a ${role} position.

Return ONLY valid JSON, no markdown, no extra text:
{
  "overallScore": <number 0-100>,
  "summary": "<2 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "keywords": ["<keyword from resume 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>"],
  "missingKeywords": ["<missing keyword 1>", "<missing 2>", "<missing 3>"],
  "questions": ["<question 1>", "<question 2>"]
}

Rules for questions:
- Generate exactly ${questionCount} questions
- Base questions on the candidate's actual experience from the resume
- Tailor them specifically to the ${role} role
- Mix difficulty naturally
- Questions should feel like a real interviewer who READ this resume is asking them
- Do NOT label or tag questions with type names

Resume:
${resumeText.slice(0, 4000)}
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "VoicePrep AI"
        }
      }
    );

    const raw = response.data.choices[0].message.content;
    console.log("🤖 Response preview:", raw.slice(0, 150));

    let result;
    try {
      result = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) result = JSON.parse(match[0]);
      else return res.status(500).json({ message: "AI returned invalid format. Please try again." });
    }

    console.log("✅ Done — score:", result.overallScore, "| questions:", result.questions?.length);
    res.json(result);

  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    res.status(500).json({
      message: "Error analyzing resume: " + (error.response?.data?.error?.message || error.message)
    });
  }
};