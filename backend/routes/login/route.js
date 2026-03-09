import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../../models/User.js'; 
import connectDB from '../../config/db.js';

const router = express.Router();

// Handles POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Basic Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 2. Ensure Database Connection
    await connectDB();

    // 3. Find user in MongoDB (Search by lowercase email)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4. Compare Hashed Passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 5. Send Success Response
    // We send the role so the frontend can redirect to the correct dashboard
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.fullName || user.companyName 
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;