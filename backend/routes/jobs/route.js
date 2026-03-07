import express from 'express';
import Job from '../../models/Job.js'; 
import connectDB from '../../config/db.js';

const router = express.Router();

// --- GET: Fetch all jobs (Newest First) ---
router.get('/', async (req, res) => {
  try {
    await connectDB();
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- POST: Create a new job (Handles Text + File) ---
router.post('/', async (req, res) => {
  try {
    // 1. Text data is automatically parsed into req.body by express.json and multer
    const jobData = { ...req.body };

    // 2. Handle File Processing (If multer parsed a file)
    if (req.file) {
      const buf = req.file.buffer;
      jobData.fileData = `data:${req.file.mimetype};base64,${buf.toString("base64")}`;
      jobData.fileName = req.file.originalname;
      jobData.fileType = req.file.mimetype;
    }

    // 3. Save to Database
    await connectDB();
    const newJob = await Job.create(jobData);

    res.status(201).json({ success: true, data: newJob });
  } catch (error) {
    console.error("Job Creation Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;