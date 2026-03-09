import express from 'express';
import Job from '../../models/Job.js'; 
import connectDB from '../../config/db.js';

const router = express.Router();

// --- GET: Fetch all jobs (Newest First) ---
// URL: GET http://localhost:5001/api/jobs
router.get('/', async (req, res) => {
  try {
    await connectDB();
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- GET: Fetch a single job by ID ---
// URL: GET http://localhost:5001/api/jobs/:id
// This replaces the code previously in your [id] folder
router.get('/:id', async (req, res) => {
  try {
    await connectDB();
    
    // In Express, we access the ID via req.params.id
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    console.error("Fetch Job Error:", error);
    res.status(500).json({ success: false, error: "Invalid Job ID format or Server Error" });
  }
});

// --- POST: Create a new job (Handles Text + File) ---
// URL: POST http://localhost:5001/api/jobs
router.post('/', async (req, res) => {
  try {
    const jobData = { ...req.body };

    if (req.file) {
      const buf = req.file.buffer;
      jobData.fileData = `data:${req.file.mimetype};base64,${buf.toString("base64")}`;
      jobData.fileName = req.file.originalname;
      jobData.fileType = req.file.mimetype;
    }

    await connectDB();
    const newJob = await Job.create(jobData);

    res.status(201).json({ success: true, data: newJob });
  } catch (error) {
    console.error("Job Creation Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;