import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  jobRole: {
    type: String,
    required: true
  },

  experienceLevel: {
    type: String,
    required: true
  },

  jobDescription: {
    type: String
  },

  questionCount: {
    type: Number,
  },

  interviewTypes: [
    {
      type: String
    }
  ],

  questions: [
    {
      type: String
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Interview", interviewSchema);