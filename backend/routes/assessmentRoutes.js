import express from "express";
import {
  generateAssessmentQuiz,
  analyzeConfidence,
  saveAssessment,
  getLeaderboard, // NEW IMPORT
} from "../controllers/assessmentController.js";

const router = express.Router();

router.post("/generate-quiz", generateAssessmentQuiz);
router.post("/analyze-confidence", analyzeConfidence);
router.post("/save-result", saveAssessment);
router.get("/leaderboard", getLeaderboard); // NEW ROUTE

export default router;
