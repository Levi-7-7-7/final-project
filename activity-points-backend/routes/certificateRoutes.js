const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { uploadCertificate, getMyCertificates } = require('../controllers/uploadController'); // or wherever your controllers are

router.post('/upload', authMiddleware, uploadCertificate);

// Add this route to get the logged-in user's certificates
router.get('/my', authMiddleware, getMyCertificates);

module.exports = router;
