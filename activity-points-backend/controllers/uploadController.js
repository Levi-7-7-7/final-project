const multer = require('multer');
const ImageKit = require('imagekit');
const Certificate = require('../models/Certificate');
const Category = require('../models/Category');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const upload = multer({
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
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

// Upload certificate handler
exports.uploadCertificate = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { categoryId, subcategoryName, prizeLevel } = req.body;
    const studentId = req.user.id;

    try {
      // Validate category
      const categoryDoc = await Category.findById(categoryId);
      if (!categoryDoc) {
        return res.status(400).json({ message: 'Invalid category' });
      }

      // Validate subcategory
      const subcategoryObj = categoryDoc.subcategories.find(
        (sub) => sub.name === subcategoryName
      );

      if (!subcategoryObj) {
        return res.status(400).json({ message: 'Invalid subcategory' });
      }

      // ⭐ AUTO CALCULATE POINTS
      let potentialPoints = subcategoryObj.points;

      // If prizeLevel influences points, add that logic here:
      // Example:
      // if (subcategoryObj.level === prizeLevel) { potentialPoints = subcategoryObj.points }

      // Upload to ImageKit
      const uploadResult = await imagekit.upload({
        file: req.file.buffer.toString('base64'),
        fileName: req.file.originalname,
        folder: '/certificates',
      });

      // Create and save certificate
      const cert = new Certificate({
        student: studentId,
        category: categoryId,
        subcategory: subcategoryName,
        prizeLevel,
        fileUrl: uploadResult.url,
        fileId: uploadResult.fileId,

        // ⭐ NEW FIELD
        potentialPoints,
        status: "pending",
      });

      await cert.save();

      res.json({
        message: 'Certificate uploaded successfully',
        certificate: cert,
      });

    } catch (error) {
      console.error('UPLOAD ERROR:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

// Get student’s certificates
exports.getMyCertificates = async (req, res) => {
  try {
    const studentId = req.user.id;
    const certificates = await Certificate.find({ student: studentId });
    res.json({ certificates });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching certificates' });
  }
};
