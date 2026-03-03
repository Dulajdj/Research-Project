import { GoogleGenerativeAI } from "@google/generative-ai";
import PDFParser from "pdf2json";
import connectDB from "./config/db.js";
import CoverLetter from "./models/CoverLetter.js";
import Resume from "./models/Resume.js";

// Response helpers for backends that call these functions directly.
// The original Next.js version used NextResponse.json(); here we simply
// return a plain object with `{ status, body }` so the caller (e.g. an
// Express route) can translate it into a response.
function makeResponse(body, status = 200) {
  return { status, body };
}

function makeError(message, status = 500) {
  return { status, body: { error: message } };
}

// NOTE: this file was originally designed for Next.js API routes and
// used NextResponse from "next/server". When running under a plain
// Express/Node backend this module should not import NextResponse
// (Next.js isn't installed in this project). The handler functions
// currently return plain objects; the Express server can wrap them
// into res.json() responses as needed.

// Reusable model fallback utility
async function generateWithFallback(genAIInstance, prompt) {
  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash"
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAIInstance.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error("Empty response from model");
      }

      return text;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`All AI models failed. Last error: ${lastError?.message || 'Unknown'}`);
}

// Simple fallback parser when AI is unavailable or returns invalid JSON.
function simpleFallbackParse(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const emailMatch = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  const phoneMatch = text.match(/(\+?\d[\d\s().-]{6,}\d)/);
  const linkedinMatch = text.match(/https?:\/\/([\w.-]*\.)?linkedin\.com\/[\w\/-]*/i);
  const githubMatch = text.match(/https?:\/\/([\w.-]*\.)?github\.com\/[\w\/-]*/i);

  // Heuristic name: first line with 2-4 words and no email/phone and contains letters
  let name = '';
  for (let i = 0; i < Math.min(6, lines.length); i++) {
    const l = lines[i];
    if (/[A-Za-z]/.test(l) && !emailMatch?.[0] && !phoneMatch?.[0]) {
      const words = l.split(/\s+/);
      if (words.length >= 2 && words.length <= 4 && words[0][0] === words[0][0]?.toUpperCase()) {
        name = l;
        break;
      }
    }
  }

  // Extract sections by common headings
  function extractSection(headings) {
    const idx = lines.findIndex(l => headings.some(h => l.toLowerCase().startsWith(h)));
    if (idx === -1) return '';
    let content = [];
    for (let j = idx + 1; j < lines.length; j++) {
      const line = lines[j];
      // stop if we encounter another heading-like line
      if (/^[A-Z][A-Za-z\s]{1,60}:?$/.test(line) && line.split(' ').length <= 3) break;
      content.push(line);
    }
    return content.join('\n');
  }

  const summary = extractSection(['summary', 'professional summary', 'profile', 'about']);
  const skillsText = extractSection(['skills', 'technical skills', 'skillset', 'technical']);

  // Simple experience parsing: find Experience heading and split by double-newline in original text
  let experience = [];
  const expHeadingIdx = lines.findIndex(l => /experience/i.test(l));
  if (expHeadingIdx !== -1) {
    const expBlock = [];
    for (let j = expHeadingIdx + 1; j < lines.length; j++) {
      const line = lines[j];
      if (/^(education|projects|skills|certifications|references)/i.test(line)) break;
      expBlock.push(line);
    }
    const rawExp = expBlock.join('\n');
    const expEntries = rawExp.split(/\n\s*\n/).filter(Boolean);
    experience = expEntries.map(entry => {
      const firstLine = entry.split('\n')[0];
      // Try to split title and company with at or comma
      let title = firstLine;
      let company = '';
      const atIdx = firstLine.indexOf('@');
      if (atIdx !== -1) {
        title = firstLine.slice(0, atIdx).trim();
        company = firstLine.slice(atIdx + 1).trim();
      } else if (firstLine.includes(' - ')) {
        const parts = firstLine.split(' - ');
        title = parts[0]; company = parts[1] || '';
      }
      return {
        title: title || '',
        company: company || '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: entry
      };
    });
  }

  // Education: similar approach
  let education = [];
  const eduHeadingIdx = lines.findIndex(l => /education/i.test(l));
  if (eduHeadingIdx !== -1) {
    const eduBlock = [];
    for (let j = eduHeadingIdx + 1; j < lines.length; j++) {
      const line = lines[j];
      if (/^(experience|projects|skills|certifications|references)/i.test(line)) break;
      eduBlock.push(line);
    }
    const eduEntries = eduBlock.join('\n').split(/\n\s*\n/).filter(Boolean);
    education = eduEntries.map(entry => ({ degree: entry.split('\n')[0] || '', institution: entry.split('\n')[1] || '', startDate: '', endDate: '', description: entry }));
  }

  // Projects simple: find Projects section
  let projects = [];
  const projHeadingIdx = lines.findIndex(l => /projects?/i.test(l));
  if (projHeadingIdx !== -1) {
    const projBlock = [];
    for (let j = projHeadingIdx + 1; j < lines.length; j++) {
      const line = lines[j];
      if (/^(experience|education|skills|certifications|references)/i.test(line)) break;
      projBlock.push(line);
    }
    const projEntries = projBlock.join('\n').split(/\n\s*\n/).filter(Boolean);
    projects = projEntries.map(entry => ({ title: entry.split('\n')[0] || '', description: entry, link: '' }));
  }

  return {
    personalInfo: {
      fullName: name || lines[0] || '',
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      address: '',
      linkedin: linkedinMatch ? linkedinMatch[0] : '',
      github: githubMatch ? githubMatch[0] : '',
      website: ''
    },
    summary: summary || '',
    skills: skillsText || '',
    technicalSkills: skillsText ? skillsText.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean) : [],
    experience,
    education,
    projects,
    certifications: [],
    references: [],
    selectedTemplate: 'modern',
    _parsedBy: 'fallback'
  };
}

// --- Handlers ---
export async function handleCheckResumePOST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY_ATS;
    if (!apiKey) {
      return makeError("Gemini ATS API key missing", 500);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const formData = await req.formData();
    const file = formData.get("file");
    const jobDescription = formData.get("jobDescription");
    const manualText = formData.get("resumeText");

    let resumeText = "";

    if (file && typeof file !== "string") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (file.type === "application/pdf") {
        try {
          const parser = new PDFParser(null, 1);
          resumeText = await new Promise((resolve, reject) => {
            parser.on("pdfParser_dataError", (errData) => reject(errData.parserError));
            parser.on("pdfParser_dataReady", () => {
              resolve(parser.getRawTextContent());
            });
            parser.parseBuffer(buffer);
          });
        } catch (pdfError) {
          console.error("PDF Parsing Error:", pdfError);
          return makeError("Failed to parse PDF. Please try a different file or text.", 500);
        }
      } else {
        resumeText = buffer.toString("utf-8");
      }
    } else if (manualText) {
      resumeText = manualText;
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return makeError("Resume text is empty.", 400);
    }

    const prompt = `
      Act as an expert ATS (Applicant Tracking System) Scanner.
      Analyze the following resume text against the job description.

      RESUME TEXT:
      ${resumeText.slice(0, 30000)} 

      JOB DESCRIPTION:
      ${jobDescription || "General Software Engineering"}

      INSTRUCTIONS:
      Return ONLY a VALID JSON object. Do not use Markdown blocks (no ${'```'}).
      JSON Format:
      {
        "atsScore": (number 0-100),
        "grammarScore": (number 0-100),
        "keywordMatch": (number 0-100),
        "strengths": ["point 1", "point 2", "point 3"],
        "improvements": ["point 1", "point 2", "point 3"],
        "suggestions": ["point 1", "point 2", "point 3"]
      }
    `;

    const text = await generateWithFallback(genAI, prompt);
    const cleanedText = text.replace(/```json|```/g, "").trim();

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(cleanedText);
    } catch (e) {
      console.error("JSON Error:", text);
      return makeError("AI Response was not valid JSON.", 500);
    }

    return makeResponse(jsonResponse);

  } catch (error) {
    console.error("Server Error:", error);
    return makeError(`Analysis Error: ${error.message}`, 500);
  }
}

// Parse uploaded resume (PDF or plain text) into structured resume JSON for import/edit
export async function handleParseResumePOST(req) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const formData = await req.formData();
    const file = formData.get("file");
    const manualText = formData.get("resumeText");

    let resumeText = "";

    if (file && typeof file !== "string") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (file.type === "application/pdf") {
        try {
          const parser = new PDFParser(null, 1);

          resumeText = await new Promise((resolve, reject) => {
            // Temporarily suppress benign pdf2json warnings about Link fields so logs stay clean
            const originalWarn = console.warn;
            console.warn = (...args) => {
              try {
                const msg = String(args[0] || '');
                if (msg.includes('Unsupported: field.type of Link')) return;
              } catch (e) {}
              originalWarn.apply(console, args);
            };

            parser.on("pdfParser_dataError", (errData) => {
              // restore warn
              console.warn = originalWarn;
              reject(errData.parserError);
            });
            parser.on("pdfParser_dataReady", () => {
              // restore warn
              console.warn = originalWarn;
              resolve(parser.getRawTextContent());
            });
            parser.parseBuffer(buffer);
          });
        } catch (pdfError) {
          console.error("PDF Parsing Error:", pdfError);
          return makeError("Failed to parse PDF. Please try a different file or text.", 500);
        }
      } else {
        resumeText = buffer.toString("utf-8");
      }
    } else if (manualText) {
      resumeText = manualText;
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return makeError("Resume text is empty.", 400);
    }

    const prompt = `
      Act as an expert resume parser.
      Convert the following resume text into a VALID JSON object matching this schema exactly (do not return any extra text):
      {
        "personalInfo": {
          "fullName": "",
          "email": "",
          "phone": "",
          "address": "",
          "linkedin": "",
          "github": "",
          "website": "",
          "photo": "" // optional
        },
        "summary": "",
        "skills": "",
        "technicalSkills": [],
        "experience": [ { "title":"","company":"","location":"","startDate":"","endDate":"","current":false,"description":"" } ],
        "education": [ { "degree":"","institution":"","startDate":"","endDate":"","description":"" } ],
        "projects": [ { "title":"","description":"","link":"" } ],
        "certifications": [],
        "references": [],
        "selectedTemplate": "modern"
      }

      RESUME_TEXT:
      ${resumeText.slice(0, 30000)}
    `;

    let parsed;
    try {
      const text = await generateWithFallback(genAI, prompt);
      const cleanedText = text.replace(/```json|```/g, "").trim();

      try {
        parsed = JSON.parse(cleanedText);
        // mark source
        parsed._parsedBy = 'ai';
      } catch (e) {
        console.error("AI JSON Parse Error:", text);
        // Fall back to simple parser when AI returns invalid JSON
        parsed = simpleFallbackParse(resumeText);
        parsed._parsedBy = parsed._parsedBy || 'fallback';
      }

    } catch (aiErr) {
      console.error("AI parse failed, falling back to simple parser:", aiErr);
      parsed = simpleFallbackParse(resumeText);
      parsed._parsedBy = parsed._parsedBy || 'fallback';
    }

    // Basic normalization to ensure arrays exist
    parsed.technicalSkills = Array.isArray(parsed.technicalSkills) ? parsed.technicalSkills : (parsed.technicalSkills ? [parsed.technicalSkills] : []);
    parsed.experience = Array.isArray(parsed.experience) ? parsed.experience : [];
    parsed.education = Array.isArray(parsed.education) ? parsed.education : [];
    parsed.projects = Array.isArray(parsed.projects) ? parsed.projects : [];
    parsed.certifications = Array.isArray(parsed.certifications) ? parsed.certifications : [];
    parsed.references = Array.isArray(parsed.references) ? parsed.references : [];

    return makeResponse(parsed);

  } catch (error) {
    console.error("Parse Resume Error:", error);
    return makeError(`Parse Error: ${error.message}`, 500);
  }
}

export async function handleGenerateCoverLetterPOST(req) {
  try {
    const body = await req.json();

    const prompt = `
    Write a professional, ATS-friendly cover letter in clean HTML format.
    Use only <p>, <strong>, <br> tags.
    
    Candidate: ${body.personalInfo.fullName}
    Job Title: ${body.jobInfo.jobTitle}
    Company: ${body.jobInfo.companyName}
    Hiring Manager: ${body.jobInfo.hiringManager || "Hiring Manager"}
    
    Job Description:
    ${body.jobInfo.jobDescription}
    
    Keep it under 300 words. Be enthusiastic and tailored.
    Return ONLY the HTML content.
    `;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const aiContent = result.response.text().replace(/```html|```/gi, "").trim();

    await connectDB();
    const newLetter = await CoverLetter.create({
      personalInfo: body.personalInfo,
      jobInfo: body.jobInfo,
      coverLetter: aiContent,
    });

    return makeResponse({ id: newLetter._id.toString() });

  } catch (error) {
    console.error("Gemini API error:", error);
    return makeError(error.message, 500);
  }
}

export async function handleGenerateSummaryPOST(req) {
  try {
    const { userInput, skills, jobTitle, experience } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return makeError("Groq API Key Missing", 500);
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", 
        messages: [
          {
            role: "system",
            content: "You are an expert professional resume writer. Your summaries are highly impactful, professional, and optimized for Applicant Tracking Systems (ATS)."
          },
          {
            role: "user",
            content: `Write a professional resume summary for a ${jobTitle || 'Professional'}.
                      
                      Details:
                      - Keywords/Experience: ${userInput}
                      - Key Skills: ${skills}
                      - Career History: ${experience}

                      Requirements:
                      - Word Count: Strictly between 40 to 50 words.
                      - Format: One cohesive paragraph.
                      - Content: Highlight achievements and technical expertise professionally.
                      - Note: Do NOT include any introductory text, start directly with the summary.`
          }
        ],
        temperature: 0.6, 
        max_tokens: 150,
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseErr) {
      const text = await response.text().catch(() => null);
      console.error("Groq non-JSON response:", text || parseErr);
      return makeError(`Upstream Groq returned non-JSON response: ${text ? text.slice(0,200) : String(parseErr)}`, 502);
    }

    if (!response.ok) {
      console.error("Groq Error Response:", data);
      return makeError(data.error?.message || "AI Error", response.status);
    }

    const aiText = data.choices[0]?.message?.content?.trim();
    const cleanText = aiText.replace(/^"|"$/g, '');

return makeResponse({ summary: cleanText });

  } catch (error) {
    console.error("Groq Route Error:", error);
    return makeError("Internal Server Error", 500);
  }
}

export async function handleResumeGET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const resume = await Resume.findById(id).lean();
      if (!resume) {
        return makeError('Resume not found', 404);
      }

      // Debug: log if the resume has a photo field
      try {
        console.log('GET /api/resume id=', id, 'photo present?', Boolean(resume.personalInfo?.photo), 'len:', resume.personalInfo?.photo ? resume.personalInfo.photo.length : 0);
      } catch (logErr) {
        console.warn('GET /api/resume: failed to log photo info', logErr);
      }

      return makeResponse(resume);
    }

    const resumes = await Resume.find({}).sort({ createdAt: -1 }).lean();
    return makeResponse(resumes);
  } catch (error) {
    console.error('GET /api/resume error:', error);
    return makeError(`Failed to load resumes: ${error.message}`, 500);
  }
}

export async function handleResumePOST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Debug: log whether photo was included in the incoming payload
    try {
      console.log('POST /api/resume: photo present?', Boolean(body.personalInfo?.photo), 'len:', body.personalInfo?.photo ? body.personalInfo.photo.length : 0);
    } catch (logErr) {
      console.warn('POST /api/resume: failed to log photo info', logErr);
    }

    const resume = await Resume.create({
      personalInfo: body.formData?.personalInfo || body.personalInfo || {},
      summary: body.formData?.summary || body.summary || '',
      skills: body.formData?.skills || body.skills || '',
      technicalSkills: body.formData?.technicalSkills || body.technicalSkills || '',
      experience: body.formData?.experience || body.experience || [],
      education: body.formData?.education || body.education || [],
      projects: body.formData?.projects || body.projects || [],
      certifications: body.formData?.certifications || body.certifications || [],
      references: body.formData?.references || body.references || [],
      selectedTemplate: body.selectedTemplate || 'modern',
    });

    // Debug: log whether the created document actually contains the photo
    try {
      console.log('DB saved resume id=', resume._id?.toString(), 'photo present?', Boolean(resume.personalInfo?.photo), 'len:', resume.personalInfo?.photo ? resume.personalInfo.photo.length : 0);
    } catch (logErr) {
      console.warn('POST save: failed to log saved resume photo info', logErr);
    }

    // If the created doc doesn't have the photo but the incoming body did, try an explicit update to see if that persists
    if (!resume.personalInfo?.photo && body.personalInfo?.photo) {
      try {
        const updated = await Resume.findByIdAndUpdate(
          resume._id,
          { $set: { 'personalInfo.photo': body.personalInfo.photo } },
          { new: true }
        ).lean();

        console.log('After explicit update, photo present?', Boolean(updated.personalInfo?.photo), 'len:', updated.personalInfo?.photo ? updated.personalInfo.photo.length : 0);
      } catch (updErr) {
        console.error('Failed explicit update of photo:', updErr);
      }
    }

    return makeResponse(resume, 201);
  } catch (error) {
    console.error('POST /api/resume error:', error);
    return makeError(`Save failed: ${error.message}`, 500);
  }
}

export async function handleResumePUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return makeError('ID required', 400);
    }

    const updateData = {
      personalInfo: body.personalInfo || body.formData?.personalInfo || {},
      summary: body.summary || body.formData?.summary || '',
      skills: body.skills || body.formData?.skills || '',
      technicalSkills: body.technicalSkills || body.formData?.technicalSkills || '',
      experience: body.experience || body.formData?.experience || [],
      education: body.education || body.formData?.education || [],
      projects: body.projects || body.formData?.projects || [],
      certifications: body.certifications || body.formData?.certifications || [],
      references: body.references || body.formData?.references || [],
      selectedTemplate: body.selectedTemplate || body.formData?.selectedTemplate || 'modern',
    };

    const updated = await Resume.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return makeError('Resume not found', 404);
    }

    return makeResponse(updated);
  } catch (error) {
    console.error('PUT /api/resume error:', error);
    return makeError(`Update failed: ${error.message}`, 500);
  }
}

export async function handleResumeDELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return makeError('ID required', 400);
    }

    const deleted = await Resume.findByIdAndDelete(id);

    if (!deleted) {
      return makeError('Resume not found', 404);
    }

    return makeResponse({ message: 'Resume deleted successfully!' });
  } catch (error) {
    console.error('DELETE /api/resume error:', error);
    return makeError('Delete failed', 500);
  }
}