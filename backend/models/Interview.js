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

  // Stores the meeting style based on interview type selected
  meetingStyle: {
    type: String,
    default: "standard"
  },

  // Extra AI greeting instruction based on interview type
  aiGreetingExtra: {
    type: String,
    default: ""
  },

  introPrompt: {
    type: String,
    default: ""
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Interview", interviewSchema);