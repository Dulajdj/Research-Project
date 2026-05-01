import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../../models/User.js'; 
import connectDB from '../../config/db.js';

const router = express.Router();

// Handles POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { role, email, password, ...otherDetails } = req.body;

    // 1. Validation
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 2. Connect to Database
    await connectDB();

    // 3. Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // 4. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create User
    await User.create({
      role,
      email: email.toLowerCase(),
      password: hashedPassword,
      ...otherDetails, 
    });

    res.status(201).json({ message: "Account created successfully" });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;