const mongoose = require('mongoose');

// 1. මේ තියෙන්නේ එක Step එකක structure එක 
// (උදා: YouTube video එක බැලුවද නැද්ද කියලා track කරන්න)
const stepSchema = new mongoose.Schema({
  stepId: { type: Number, required: true }, // Step එකේ අංකය (1, 2, 3...)
  title: { type: String, required: true },  // Step එකේ නම (උදා: "Learn React Basics")
  type: { type: String },                   // මොන platform එකේද? (YouTube, Udemy, Coursera)
  url: { type: String },                    // Course එකේ Link එක
  completed: { type: Boolean, default: false } // Default අගය false. User click කරාම මේක true වෙනවා.
});

// 2. මේ තියෙන්නේ සම්පූර්ණ Skill එකේ Progress එක save කරන ප්‍රධාන structure එක
const courseProgressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, // ඔයාගේ ප්‍රධාන User model එකට link කරනවා
    ref: 'User', 
    required: true 
  },
  skill: { 
    type: String, 
    required: true // මොන Skill එකට අදාල progress එකද? (උදා: "React")
  },
  progressPercentage: { 
    type: Number, 
    default: 0 // මුලින්ම progress එක 0% යි.
  },
  steps: [stepSchema] // උඩින් හදපු steps ටික මෙතනට array එකක් විදිහට (ලිස්ට් එකක් වගේ) එකතු කරනවා
}, 
{ 
  timestamps: true // මේක දැම්මම record එක හැදුන වෙලාව (createdAt) සහ අන්තිමට update කරපු වෙලාව (updatedAt) auto save වෙනවා.
});

// 3. Model එක Export කිරීම (වෙන files වලට පාවිච්චි කරන්න පුළුවන් වෙන්න)
module.exports = mongoose.model('CourseProgress', courseProgressSchema);