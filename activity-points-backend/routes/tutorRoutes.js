const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const tutorAuth = require('../middleware/tutorAuth');

const Tutor = require('../models/Tutor');
const Student = require('../models/Student');
const Certificate = require('../models/Certificate');
const Category = require('../models/Category');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });


// // ==================
// // Tutor Auth Middleware
// // ==================
// function tutorAuth(req, res, next) {
//   const header = req.headers.authorization;
//   if (!header) return res.status(401).json({ error: 'No token provided' });

//   const token = header.split(' ')[1];
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (decoded.role !== 'tutor') return res.status(403).json({ error: 'Not authorized as tutor' });
//     req.tutor = decoded;
//     next();
//   } catch (err) {
//     res.status(401).json({ error: 'Invalid or expired token' });
//   }
// }


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
// Get Pending Certificates (with potential points)
// ==================
router.get('/certificates/pending', tutorAuth, async (req, res) => {
  try {
    const pendingCerts = await Certificate.find({ status: 'pending' })
      .populate('student', 'name registerNumber email batch branch')
      .populate('category'); // full category needed for points logic

    const formattedCerts = pendingCerts.map(cert => {
      let potentialPoints = 0;

      const category = cert.category;
      if (category) {
        // find matching subcategory
        const sub = category.subcategories.find(
          sc => sc.name.toLowerCase() === cert.subcategory.toLowerCase()
        );

        if (sub) {
          // 🔹 Case 1: Fixed-point activities (Online Course, IV, etc.)
          if (sub.fixedPoints !== null) {
            potentialPoints = sub.fixedPoints;
          }

          // 🔹 Case 2: Level + Prize based activities
          else if (sub.levels.length && cert.level && cert.prizeType) {
            const levelObj = sub.levels.find(
              l => l.name.toLowerCase() === cert.level.toLowerCase()
            );

            if (levelObj) {
              const prizeObj = levelObj.prizes.find(
                p => p.type === cert.prizeType
              );

              if (prizeObj) {
                potentialPoints = prizeObj.points;
              }
            }
          }

          // 🔹 Apply subcategory maxPoints cap if exists
          if (sub.maxPoints !== null) {
            potentialPoints = Math.min(potentialPoints, sub.maxPoints);
          }
        }
      }

      return {
        ...cert.toObject(),
        potentialPoints
      };
    });

    res.json(formattedCerts);
  } catch (err) {
    console.error('Error fetching pending certificates:', err);
    res.status(500).json({ error: err.message });
  }
});




// ==================
// Get ALL Certificates (Tutor)
// ==================
router.get('/certificates', tutorAuth, async (req, res) => {
  try {
    const certs = await Certificate.find()
      .populate('student', 'name registerNumber email batch branch totalPoints')
      .populate({
        path: 'category',
        select: 'name subcategories', // include subcategories for potential front-end logic
      });

    res.json({
      success: true,
      certificates: certs
    });
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


router.post("/certificates/:id/approve", tutorAuth, async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) return res.status(404).json({ message: "Certificate not found" });

    const category = await Category.findById(cert.category);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const sub = category.subcategories.find(
      s => s.name.toLowerCase() === cert.subcategory.toLowerCase()
    );
    if (!sub) return res.status(404).json({ message: "Subcategory not found" });

    let pointsToAdd = 0;

    // =============================
    // CASE 1: Fixed point activity
    // =============================
    if (sub.fixedPoints !== null) {
      pointsToAdd = sub.fixedPoints;
    }

    // ==========================================
    // CASE 2: Level + Prize based activity
    // ==========================================
    else {
      const level = sub.levels.find(
        l => l.name.toLowerCase() === (cert.level || "").toLowerCase()
      );
      if (!level) {
        return res.status(400).json({ message: "Invalid level selected" });
      }

      const prize = level.prizes.find(
        p => p.type === cert.prizeType
      );
      if (!prize) {
        return res.status(400).json({ message: "Invalid prize type selected" });
      }

      pointsToAdd = prize.points;
    }

    // =============================
    // Apply subcategory cap
    // =============================
    if (sub.maxPoints !== null) {
      pointsToAdd = Math.min(pointsToAdd, sub.maxPoints);
    }

    // =============================
    // Apply category cap
    // =============================
    if (category.maxPoints !== null) {
      pointsToAdd = Math.min(pointsToAdd, category.maxPoints);
    }

    // =============================
    // Update certificate
    // =============================
    cert.status = "approved";
    cert.pointsAwarded = pointsToAdd;
    await cert.save();

    // =============================
    // Update student total points
    // =============================
    const student = await Student.findByIdAndUpdate(
      cert.student,
      { $inc: { totalPoints: pointsToAdd } },
      { new: true }
    );

    res.json({
      message: "Certificate approved successfully",
      pointsAdded: pointsToAdd,
      studentTotalPoints: student.totalPoints,
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
