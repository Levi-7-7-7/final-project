const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const sendOTPEmail = require('../utils/sendOTPEmail');
const router = express.Router();

// Step 1: Student enters register number, start OTP login
router.post('/start-login', async (req, res) => {
  const { registerNumber } = req.body;
  try {
    const student = await Student.findOne({ registerNumber });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    student.otp = otp;
    student.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 mins
    await student.save();

    const sent = await sendOTPEmail(student.email, otp);
    res.json({ message: 'OTP sent to email', firstLoginCompleted: student.firstLoginCompleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Step 2: Verify OTP and set password (first-time)
router.post('/verify-otp', async (req, res) => {
  const { registerNumber, otp, password, batch, branch } = req.body;
  try {
    const student = await Student.findOne({ registerNumber });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    if (student.otp !== otp || student.otpExpiry < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    student.password = await bcrypt.hash(password, 10);
    student.batch = batch;
    student.branch = branch;
    student.isVerified = true;
    student.firstLoginCompleted = true;
    student.otp = null;
    student.otpExpiry = null;
    await student.save();

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Step 3: Normal login
router.post('/login', async (req, res) => {
  const { registerNumber, password } = req.body;
  try {
    const student = await Student.findOne({ registerNumber });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (!student.isVerified) return res.status(400).json({ error: 'Please verify your email first' });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const {
  requestPasswordReset,
  resetPassword,
  // your other auth controllers...
} = require('../controllers/authController');

router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);



module.exports = router;
