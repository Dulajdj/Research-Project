import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  // Link to the specific job
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },
  jobTitle: { type: String, required: true },
  companyName: { type: String, required: true },
  
  // Applicant Details
  applicantName: { type: String, required: true },
  applicantEmail: { type: String, required: true },
  
  // File Storage (Base64)
  cvData: { type: String, required: true }, // The actual file content
  cvName: { type: String, required: true }, // The filename (e.g., "resume.pdf")
  
  // --- UPDATED AI RESULTS SECTION ---
  
  // Skills identified in the CV (Matched Skills)
  identifiedSkills: [{ 
    type: String 
  }], 

  // Skills required by job but not found in CV
  missingSkills: [{ 
    type: String 
  }], 

  // Detected years of experience from Python model
  yearsOfExperience: {
    type: Number,
    default: 0
  },
  
  // Metadata
  appliedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Check if the model already exists before creating it
const Application = mongoose.models.Application || mongoose.model("Application", ApplicationSchema);

export default Application;