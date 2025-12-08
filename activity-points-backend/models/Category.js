const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  maxPoints: { type: Number },
  minDuration: { type: String },
  requiredDocuments: { type: [String] },
  subcategories: [
    {
      name: { type: String, required: true },
      points: { type: Number, required: true },
      level: { type: String },
    }
  ],
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
