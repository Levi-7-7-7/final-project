const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const Student = require('../models/Student');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Bulk upload students (Tutors only provide name, registerNumber, email)
const { tutorAuth } = require('./tutorRoutes');

router.post('/upload', tutorAuth, upload.single('file'), async (req, res) => {

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const studentsToInsert = results.map(student => ({
          name: student.name,
          registerNumber: student.registerNumber,
          email: student.email,
          firstLoginCompleted: false,
          isVerified: false
        }));

        await Student.insertMany(studentsToInsert);
        fs.unlinkSync(req.file.path);

        res.json({ message: 'Students uploaded successfully' });
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });
});

module.exports = router;
