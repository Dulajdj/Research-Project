import express from "express";
import multer from "multer";
import {
  generateInterview,
  scoreInterview,
  getHistory,
  downloadReport,
  getInterview,
  getDashboardStats,
  generatePracticeQuestions,
  scorePracticeAnswers
} from "../controllers/interviewController.js";

const router = express.Router();

// Multer for resume upload in practice mode (PDF only, 5MB max)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "text/plain", "text/markdown"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF, TXT, or MD files allowed"), false);
  }
});

router.post("/generate", generateInterview);
router.post("/score", scoreInterview);
router.get("/history/all", getHistory);
router.get("/report/:id", downloadReport);
router.get("/:id", getInterview);
router.get("/dashboard/stats", getDashboardStats);
router.post("/practice/generate", upload.single("resume"), generatePracticeQuestions);
router.post("/practice/score", scorePracticeAnswers);

export default router;