import express from "express";
import {
  generateInterview,
  scoreInterview,
  getHistory,
  downloadReport,
  getInterview,
  getDashboardStats
} from "../controllers/interviewController.js";

const router = express.Router();

router.post("/generate", generateInterview);
router.post("/score", scoreInterview);
router.get("/history/all", getHistory);
router.get("/report/:id", downloadReport);
router.get("/:id", getInterview);
router.get("/dashboard/stats", getDashboardStats);

export default router;