import express from 'express';
import connectDB from '../../config/db.js';
import Application from '../../models/Application.js';
// import fetch from 'node-fetch'; // Only needed if node version < 18

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { jobId, jobTitle, companyName, applicantName, applicantEmail, requiredSkills } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: "No CV uploaded" });
    }

    // --- 1. Python ML Connection ---
    let missingSkillsList = [];
    let identifiedSkillsList = []; // NEW: Variable for matched skills
    let detectedExperience = 0;    // NEW: Variable for years of experience
    
    try {
      const pythonFormData = new FormData();
      const blob = new Blob([file.buffer], { type: file.mimetype });
      pythonFormData.append('cv', blob, file.originalname);
      pythonFormData.append('jobTitle', jobTitle);
      pythonFormData.append('required_skills', requiredSkills || "");

      const pythonRes = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        body: pythonFormData
      });

      if (pythonRes.ok) {
        const mlResult = await pythonRes.json();
        
        // CATCHING THE DATA FROM PYTHON
        missingSkillsList = mlResult.missing_skills || [];
        identifiedSkillsList = mlResult.identified_skills || []; // NEW
        detectedExperience = mlResult.years_of_experience || 0;  // NEW
      }
    } catch (mlError) {
      console.error("⚠️ AI Model Connection Failed:", mlError.message);
    }

    // --- 2. Process File for MongoDB (Base64) ---
    const cvDataBase64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    // --- 3. Save to Database ---
    await connectDB();
    
    const newApplication = await Application.create({
      jobId,
      jobTitle,
      companyName,
      applicantName,
      applicantEmail,
      cvName: file.originalname,
      cvData: cvDataBase64,
      missingSkills: missingSkillsList,
      identifiedSkills: identifiedSkillsList, // SAVING TO NEW MONGODB FIELD
      yearsOfExperience: detectedExperience   // SAVING TO NEW MONGODB FIELD
    });

    // --- 4. Return EVERYTHING to React ---
    return res.status(201).json({ 
      success: true, 
      message: "Application Submitted",
      missingSkills: missingSkillsList,
      identified_skills: identifiedSkillsList, // SENDING TO REACT
      yearsOfExperience: detectedExperience    // SENDING TO REACT
    });

  } catch (error) {
    console.error("❌ Server Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;