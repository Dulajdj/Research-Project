import express from 'express';
import Enrollment from '../models/Enrollment.js';
const router = express.Router();

// Update manual progress
router.put('/update', async (req, res) => {
  const { enrollmentId, progress } = req.body;
  try {
    const enrollment = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      { progress },
      { new: true }
    );
    res.json({ success: true, data: enrollment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;