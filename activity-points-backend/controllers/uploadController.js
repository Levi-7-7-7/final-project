const multer = require('multer');
const ImageKit = require('imagekit');
const Certificate = require('../models/Certificate');
const Category = require('../models/Category');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// ✅ Memory storage so req.file.buffer is available
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype === 'application/pdf'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'));
    }
  },
}).single('file');

// ===============================
// Upload Certificate
// ===============================
exports.uploadCertificate = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const {
      categoryId,
      subcategoryName,
      level,        // 👈 NEW
      prizeType     // 👈 NEW (Participation / First / Second / Third)
    } = req.body;

    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ message: 'Unauthorized' });

    try {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({ message: 'Invalid category' });
      }

      const subcategory = category.subcategories.find(
        (s) => s.name === subcategoryName
      );

      if (!subcategory) {
        return res.status(400).json({ message: 'Invalid subcategory' });
      }

      // ===============================
      // 🎯 POINT CALCULATION
      // ===============================
      let potentialPoints = 0;

      // CASE 1: Fixed-point subcategory
      if (subcategory.fixedPoints !== undefined) {
        potentialPoints = subcategory.fixedPoints;
      }

      // CASE 2: Level + Prize based subcategory
      else if (subcategory.levels?.length) {
        if (!level || !prizeType) {
          return res.status(400).json({
            message: 'Level and prize type are required for this activity'
          });
        }

        const levelObj = subcategory.levels.find(l => l.name === level);
        if (!levelObj) {
          return res.status(400).json({ message: 'Invalid level selected' });
        }

        const prizeObj = levelObj.prizes.find(p => p.type === prizeType);
        if (!prizeObj) {
          return res.status(400).json({ message: 'Invalid prize type selected' });
        }

        potentialPoints = prizeObj.points;
      }

      else {
        return res.status(400).json({
          message: 'Unable to calculate points for selected activity'
        });
      }

      // ===============================
      // 📤 Upload to ImageKit
      // ===============================
      const uploadResult = await imagekit.upload({
        file: req.file.buffer.toString('base64'),
        fileName: req.file.originalname,
        folder: '/certificates',
        useUniqueFileName: true, // optional but recommended
      });

      // ===============================
      // 🧾 Save Certificate
      // ===============================
      const certificate = new Certificate({
        student: studentId,
        category: categoryId,
        subcategory: subcategoryName,
        level: level || null,
        prizeType: prizeType || null,
        fileUrl: uploadResult.url,
        fileId: uploadResult.fileId,
        potentialPoints,
        status: 'pending',
      });

      await certificate.save();

      res.status(201).json({
        message: 'Certificate uploaded successfully',
        certificate,
      });

    } catch (error) {
      console.error('UPLOAD ERROR:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

// ===============================
// Get Logged-in Student Certificates
// ===============================
exports.getMyCertificates = async (req, res) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ message: 'Unauthorized' });

    const certificates = await Certificate.find({ student: studentId })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ certificates });
  } catch (error) {
    console.error('Failed to fetch certificates:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
