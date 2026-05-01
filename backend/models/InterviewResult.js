import mongoose from "mongoose";

const InterviewResultSchema = new mongoose.Schema({
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" },
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
  feedback: String,
  // NEW FIELDS
  questionReviews: [
    {
      questionIndex: Number,
      score: Number,
      idealAnswer: String,
      comment: String
    }
  ],
  voiceAnalysis: {
    hasVoiceAnswers: Boolean,
    voiceFlags: [Boolean]
  }
}, { timestamps: true });

export default mongoose.model("InterviewResult", InterviewResultSchema);