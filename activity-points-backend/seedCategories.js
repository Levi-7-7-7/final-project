const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

const categories = [
  {
    name: 'Technical',
    subcategories: [
      { name: 'Hackathon', points: 10 },
      { name: 'Coding Competition', points: 8 },
      { name: 'Research Paper', points: 15 },
      { name: 'Project Exhibition', points: 12 },
    ]
  },
  {
    name: 'Cultural',
    subcategories: [
      { name: 'Dance', points: 5 },
      { name: 'Music', points: 5 },
      { name: 'Drama', points: 7 },
      { name: 'Art', points: 6 },
      { name: 'Literary Events', points: 4 },
    ]
  }
  // Add more categories as needed
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Category.deleteMany({}); // clear old categories
    await Category.insertMany(categories);
    console.log('Categories seeded!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
