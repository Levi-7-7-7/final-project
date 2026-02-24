const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },

  subcategory: {
    type: String,
    required: true
  },

  // 🔹 NEW (for table-based activities)
  level: {
    type: String,
    default: null
  },

  prizeType: {
    type: String,
    enum: ['Participation', 'First', 'Second', 'Third', null],
    default: null
  },

  fileUrl: {
    type: String,
    required: true
  },

  fileId: {
    type: String,
    required: true
  },

  // 🔹 Points logic
  potentialPoints: {
    type: Number,
    default: 0
  },

  pointsAwarded: {
    type: Number,
    default: 0
  },

  rejectionReason: {
    type: String,
    default: ''
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }

}, { timestamps: true });

module.exports = mongoose.model('Certificate', CertificateSchema);
