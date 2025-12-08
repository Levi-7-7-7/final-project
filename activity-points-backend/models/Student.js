const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registerNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  firstLoginCompleted: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  totalPoints: { type: Number, default: 0 },  // <-- Add this
}, { timestamps: true });


module.exports = mongoose.model('Student', StudentSchema);
