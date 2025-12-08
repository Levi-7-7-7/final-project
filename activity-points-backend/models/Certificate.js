const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: String, required: true },
  prizeLevel: { type: String },
  fileUrl: { type: String, required: true },
  fileId: { type: String, required: true },
  
  // ⭐ Add these fields
  potentialPoints: { type: Number, default: 0 },
  pointsAwarded: { type: Number, default: 0 },
  rejectionReason: { type: String, default: '' },

  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Certificate', CertificateSchema);
