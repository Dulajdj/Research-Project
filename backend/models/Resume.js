import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  startDate: String,
  endDate: String,
  current: Boolean,
  description: String,
});

const educationSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  startDate: String,
  endDate: String,
  current: Boolean,
  description: String,
});

const projectSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  startDate: String,
  endDate: String,
  current: Boolean,
  description: String,
  url: String,
  stars: Number,
  forks: Number,
  language: String,
  topics: [String],
  topicDescriptions: [String],
  size: Number,
  watchers: Number,
});

const certificationSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  startDate: String,
  endDate: String,
  current: Boolean,
  description: String,
});

// අලුතින් එකතු කරන ලද Reference Schema එක
const referenceSchema = new mongoose.Schema({
  title: String,       // Name
  company: String,     // Position & Company
  location: String,    // Email or Location
  description: String, // Contact Info
  current: Boolean,    // Optional check
});

const resumeSchema = new mongoose.Schema({
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    linkedin: String,
    github: String,
    website: String,
    // Base64 or URL to user profile photo (shown only in Modern template)
    photo: String,
  },
  summary: String,
  skills: String,
  
  // අලුතින් එකතු කරන ලද Technical Skills Field එක
  technicalSkills: String,

  experience: [experienceSchema],
  education: [educationSchema],
  projects: [projectSchema],
  certifications: [certificationSchema],
  
  // අලුතින් එකතු කරන ලද References Array එක
  references: [referenceSchema],

  selectedTemplate: { type: String, default: 'modern' },
  createdAt: { type: Date, default: Date.now },
  // Add userId: String, later for auth
});

const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);

export default Resume;