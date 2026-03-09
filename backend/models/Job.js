import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    // These field names match your frontend state and API route exactly
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    companyWebsite: { type: String },
    jobDescription: { type: String, required: true },
    requiredQualifications: { type: String, required: true },
    requiredSkills: { type: String, required: true },
    experienceLevel: { type: String, required: true },
    employmentType: { type: String, required: true },
    workLocation: { type: String, required: true },
    salaryRange: { type: String },
    workingHours: { type: String },
    postingDate: { type: Date, default: Date.now },
    closingDate: { type: Date },
    
    // File fields for storing the Base64 string of the PDF/Image
    fileData: { type: String },
    fileName: { type: String },
    fileType: { type: String },
  },
  { timestamps: true }
);

// Standard Mongoose check to prevent recompilation errors during Nodemon restarts
const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);

export default Job;