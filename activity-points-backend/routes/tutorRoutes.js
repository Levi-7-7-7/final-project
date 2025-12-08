const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');

const Tutor = require('../models/Tutor');
const Student = require('../models/Student');
const Certificate = require('../models/Certificate');
const Category = require('../models/Category');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });


// ==================
// Tutor Auth Middleware
// ==================
function tutorAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'tutor') return res.status(403).json({ error: 'Not authorized as tutor' });
    req.tutor = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}


// ==================
// Tutor Register
// ==================
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const tutor = await Tutor.create({ name, email, password }); // let pre-save hash it
    res.json({ message: 'Tutor registered successfully', tutor });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



// ==================
// Tutor Login
// ==================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const tutor = await Tutor.findOne({ email });
    if (!tutor) return res.status(404).json({ error: 'Tutor not found' });

    const isMatch = await bcrypt.compare(password, tutor.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign(
      { id: tutor._id, role: 'tutor' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send token + tutor info
    res.json({
      message: 'Tutor login successful',
      token,
      tutor: {
        id: tutor._id,
        name: tutor.name,
        email: tutor.email,
        avatarUrl: tutor.avatarUrl || '', // if you have avatar
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



// ==================
// Get Pending Certificates
// ==================
router.get('/certificates/pending', tutorAuth, async (req, res) => {
  try {
    const pendingCerts = await Certificate.find({ status: 'pending' })
      .populate('student', 'name registerNumber email batch branch')
      .populate('category', 'name');

    res.json(pendingCerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==================
// Get All Students
// ==================
router.get('/students', tutorAuth, async (req, res) => {
  try {
    const students = await Student.find()
      .select('name registerNumber email batch branch totalPoints')
      .populate('batch', 'name')
      .populate('branch', 'name');

    res.json({
      success: true,
      students,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==================
// Upload Students via CSV
// ==================
router.post('/students/upload', tutorAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const studentsToInsert = results.map((student) => ({
          name: student.name,
          registerNumber: student.registerNumber,
          email: student.email,
          firstLoginCompleted: false,
          isVerified: false,
        }));

        await Student.insertMany(studentsToInsert);
        fs.unlinkSync(req.file.path);
        res.json({ message: 'Students uploaded successfully' });
      } catch (err) {
        fs.unlinkSync(req.file.path);
        res.status(400).json({ error: err.message });
      }
    });
});


// ==================
// Approve Certificate (UPDATED + FIXED)
// ==================

router.post("/certificates/:id/approve", tutorAuth, async (req, res) => {
  try {
    const certId = req.params.id;

    const cert = await Certificate.findById(certId);
    if (!cert) return res.status(404).json({ message: "Certificate not found" });

    const category = await Category.findById(cert.category);
    if (!category) return res.status(404).json({ message: "Category not found" });

    let sub = category.subcategories.find(s => s.name.toLowerCase() === cert.subcategory.toLowerCase());
    if (!sub) return res.status(404).json({ message: "Subcategory not found" });

    const pointsToAdd = Number(sub.points || 0);

    // Update certificate
    cert.status = "approved";
    cert.pointsAwarded = pointsToAdd;
    cert.approvedAt = new Date();
    await cert.save();

    // Update student total points
    const updatedStudent = await Student.findByIdAndUpdate(
      cert.student,
      { $inc: { totalPoints: pointsToAdd } },
      { new: true }
    );

    res.json({
      message: "Certificate approved successfully",
      pointsAdded: pointsToAdd,
      studentTotalPoints: updatedStudent?.totalPoints || 0,
      certificateId: cert._id
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// ==================
// Reject Certificate
// ==================
router.post("/certificates/:id/reject", tutorAuth, async (req, res) => {
  try {
    const certId = req.params.id;

    const cert = await Certificate.findById(certId);
    if (!cert) return res.status(404).json({ message: "Certificate not found" });

    cert.status = "rejected";
    cert.pointsAwarded = 0;
    await cert.save();

    res.json({ message: "Certificate rejected successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ==================
// Export
// ==================
module.exports = router;
module.exports.tutorAuth = tutorAuth;
