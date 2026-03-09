import express from "express";
import {
  generateAssessmentQuiz,
  analyzeConfidence,
  saveAssessment,
} from "../controllers/assessmentController.js";

const router = express.Router();

router.post("/generate-quiz", generateAssessmentQuiz);
router.post("/analyze-confidence", analyzeConfidence);
router.post("/save-result", saveAssessment);

export default router;
