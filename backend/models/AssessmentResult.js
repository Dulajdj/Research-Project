import mongoose from "mongoose";

const AssessmentResultSchema = new mongoose.Schema(
  {
    studentName: { type: String, default: "Guest User" },
    skillsSelected: [String],
    quizScore: { type: Number, required: true },
    confidenceScore: { type: Number, required: true },
    totalScore: { type: Number },
    rank: { type: String },
  },
  { timestamps: true },
);

export default mongoose.models.AssessmentResult ||
  mongoose.model("AssessmentResult", AssessmentResultSchema);
