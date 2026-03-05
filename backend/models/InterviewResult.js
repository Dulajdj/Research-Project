import mongoose from "mongoose";

const InterviewResultSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Interview"
  },

  title: String,
  description: String,
  experienceLevel: String,
  questionCount: Number,
  type: String,

  answers: [String],

  score: Number,

  breakdown: {
    communication: Number,
    technical: Number,
    confidence: Number
  },

  feedback: String

}, { timestamps: true });

export default mongoose.model("InterviewResult", InterviewResultSchema);