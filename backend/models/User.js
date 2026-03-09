import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // Shared Fields
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['applicant', 'company'],
    required: true
  },

  // Applicant-Specific Fields (from your signup form)
  fullName: { type: String },
  nameWithInitials: { type: String },
  birthday: { type: Date },
  gender: { type: String },
  contactNumber: { type: String },

  // Company-Specific Fields (from your signup form)
  companyName: { type: String },
  industry: { type: String },
  registrationNumber: { type: String },
  branchLocation: { type: String },

}, { 
  timestamps: true // Automatically creates createdAt and updatedAt fields
});

// Check if the model already exists to prevent errors during hot-reloads (Nodemon)
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;