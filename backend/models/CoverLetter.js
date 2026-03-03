// models/CoverLetter.js
import mongoose from 'mongoose';

const CoverLetterSchema = new mongoose.Schema({
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
  },
  jobInfo: {
    companyName: String,
    jobTitle: String,
    hiringManager: String,
    jobDescription: String,
  },
  coverLetter: String,
}, { timestamps: true });

export default mongoose.models.CoverLetter || mongoose.model('CoverLetter', CoverLetterSchema);