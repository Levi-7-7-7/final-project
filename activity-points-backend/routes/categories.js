const express = require('express');
const router = express.Router();
const Category = require('../models/Category'); // import Category model

// GET /api/categories - fetch all categories from MongoDB
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }); // fetch all categories sorted by name
    res.json({ categories }); // send categories wrapped in an object
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
});

module.exports = router;
