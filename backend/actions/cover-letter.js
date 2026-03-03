// actions/cover-letter.js
"use server";

import connectDB from "../config/db.js";
import CoverLetter from "../models/CoverLetter.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Oyage API key ekata galapena model eka methana use karanawa (gemini-2.5-flash)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateCoverLetter(formData) {
  await connectDB();

  const prompt = `
    Write a professional, ATS-friendly cover letter in clean HTML format.
    Use only <p>, <strong>, <br> tags.
    
    Candidate: ${formData.personalInfo.fullName}
    Job Title: ${formData.jobInfo.jobTitle}
    Company: ${formData.jobInfo.companyName}
    Hiring Manager: ${formData.jobInfo.hiringManager || "Hiring Manager"}
    
    Job Description:
    ${formData.jobInfo.jobDescription}
    
    Keep it under 300 words. Be enthusiastic and tailored.
    Return ONLY the HTML content.
  `;

  try {
    const result = await model.generateContent(prompt);
    const aiContent = result.response.text().replace(/```html|```/gi, "").trim();

    const newLetter = await CoverLetter.create({
      personalInfo: formData.personalInfo,
      jobInfo: formData.jobInfo,
      coverLetter: aiContent,
    });

    return { id: newLetter._id.toString() };
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw error;
  }
}

export async function getCoverLetters() {
  await connectDB();
  const letters = await CoverLetter.find({}).sort({ createdAt: -1 }).limit(50).lean();
  return {
    coverLetters: letters.map(l => ({
      id: l._id.toString(),
      jobTitle: l.jobInfo.jobTitle,
      companyName: l.jobInfo.companyName,
      jobDescription: l.jobInfo.jobDescription,
      createdAt: l.createdAt,
    })),
  };
}

export async function getCoverLetter(id) {
  if (!id) return null;
  await connectDB();
  try {
    const letter = await CoverLetter.findById(id).lean();
    return letter ? {
      id: letter._id.toString(),
      jobTitle: letter.jobInfo.jobTitle,
      companyName: letter.jobInfo.companyName,
      content: letter.coverLetter,
    } : null;
  } catch (error) {
    console.error("Error fetching cover letter:", error);
    return null;
  }
}

// ✅ Updated Save Function
export async function saveCoverLetter(id, content) {
  await connectDB();
  try {
    await CoverLetter.findByIdAndUpdate(id, { 
      coverLetter: content, 
      updatedAt: new Date() 
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving cover letter:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCoverLetter(id) {
  await connectDB();
  await CoverLetter.findByIdAndDelete(id);
}