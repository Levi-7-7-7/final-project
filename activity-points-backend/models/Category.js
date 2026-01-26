const mongoose = require('mongoose');

/**
 * Prize schema (Participation / First / Second / Third)
 */
const prizeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Participation', 'First', 'Second', 'Third'],
    required: true
  },
  points: {
    type: Number,
    required: true
  }
}, { _id: false });

/**
 * Level schema (College / State / National / International)
 */
const levelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  prizes: {
    type: [prizeSchema],
    default: []
  }
}, { _id: false });

/**
 * Subcategory schema
 */
const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  /**
   * For simple activities like:
   * - Online Course
   * - Industrial Visit
   */
  fixedPoints: {
    type: Number,
    default: null
  },

  /**
   * For achievement-based activities:
   * Hackathon, Paper Presentation, etc.
   */
  levels: {
    type: [levelSchema],
    default: []
  },

  /**
   * Optional cap per subcategory
   */
  maxPoints: {
    type: Number,
    default: null
  }
}, { _id: false });

/**
 * Main Category schema
 */
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  /**
   * Category-wide cap (NCC/NSS max 50)
   */
  maxPoints: {
    type: Number,
    default: null
  },

  subcategories: {
    type: [subcategorySchema],
    default: []
  }

}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
