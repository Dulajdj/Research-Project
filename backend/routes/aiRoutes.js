import express from "express";
import multer from "multer";
import { askCoach } from "../controllers/aiCoach.js";
import { analyzeResume } from "../controllers/resumeAnalyzer.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "text/plain", "text/markdown"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF, TXT, or MD files allowed"), false);
  }
});

router.post("/coach", askCoach);
router.post("/resume/analyze", upload.single("resume"), analyzeResume);

export default router;