const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

const categories = [

  // =========================
  // NCC
  // =========================
  {
    name: 'NCC',
    description: 'National Cadet Corps activities',
    maxPoints: 50,
    subcategories: [
      { name: "Eligible for 'B' Certificate", fixedPoints: 30 },
      { name: "NCC 'C' Certificate", fixedPoints: 10 },
      { name: 'NIC / National Trekking / Pre-RD', fixedPoints: 10 },
      { name: 'Republic Day Parade / Youth Exchange', fixedPoints: 20 }
    ]
  },

  // =========================
  // NSS
  // =========================
  {
    name: 'NSS',
    description: 'National Service Scheme activities',
    maxPoints: 50,
    subcategories: [
      { name: 'NSS Certificate (Authenticated)', fixedPoints: 30 },
      { name: 'NSS State / Regional Camps', fixedPoints: 10 },
      { name: 'NIC / Pre-RD Camp', fixedPoints: 10 },
      { name: 'RD Parade / Youth Exchange', fixedPoints: 20 }
    ]
  },

  // =========================
  // Professional Societies
  // =========================
  {
    name: 'Professional Societies',
    description: 'IEEE, CSI, ISTE and similar societies',
    subcategories: [
      { name: 'Member (2 years)', fixedPoints: 10 },
      { name: 'Committee Member (2 years)', fixedPoints: 10 },
      { name: 'Student Secretary (2 years)', fixedPoints: 15 }
    ]
  },

  // =========================
  // Hackathon
  // =========================
  {
    name: 'Hackathon',
    description: 'Hackathon participation and prizes',
    subcategories: [
      {
        name: 'Hackathon',
        levels: [
          {
            name: 'Regional',
            prizes: [
              { type: 'Participation', points: 10 },
              { type: 'First', points: 20 },
              { type: 'Second', points: 15 },
              { type: 'Third', points: 12 }
            ]
          },
          {
            name: 'State',
            prizes: [
              { type: 'Participation', points: 10 },
              { type: 'First', points: 30 },
              { type: 'Second', points: 25 },
              { type: 'Third', points: 20 }
            ]
          },
          {
            name: 'National',
            prizes: [
              { type: 'Participation', points: 10 },
              { type: 'First', points: 40 },
              { type: 'Second', points: 30 },
              { type: 'Third', points: 25 }
            ]
          }
        ]
      }
    ]
  },

  // =========================
  // Online Courses
  // =========================
  {
    name: 'Online Courses',
    description: 'SWAYAM, Coursera, NPTEL etc.',
    subcategories: [
      { name: 'Accredited Online Course', fixedPoints: 30 }
    ]
  },

  // =========================
  // Paper / Poster Presentation
  // =========================
  {
    name: 'Paper / Poster Presentation',
    subcategories: [
      {
        name: 'Paper / Poster Presentation',
        levels: [
          {
            name: 'State',
            prizes: [{ type: 'Participation', points: 20 }]
          },
          {
            name: 'National',
            prizes: [{ type: 'Participation', points: 30 }]
          },
          {
            name: 'International',
            prizes: [{ type: 'Participation', points: 40 }]
          }
        ]
      }
    ]
  },

  // =========================
  // Seminars / Workshops
  // =========================
  {
    name: 'Seminars / Workshops',
    subcategories: [
      {
        name: 'Seminar / Workshop',
        levels: [
          {
            name: 'State',
            prizes: [{ type: 'Participation', points: 10 }]
          },
          {
            name: 'National',
            prizes: [{ type: 'Participation', points: 20 }]
          },
          {
            name: 'International',
            prizes: [{ type: 'Participation', points: 30 }]
          }
        ]
      }
    ]
  },

  // =========================
  // Industrial Training & Visit
  // =========================
  {
    name: 'Industrial Exposure',
    subcategories: [
      { name: 'Industrial Training (5 full days)', fixedPoints: 20 },
      { name: 'Industrial Visit (Authenticated)', fixedPoints: 10 },
      { name: 'Solving Industrial Problems', fixedPoints: 30 }
    ]
  },

  // =========================
  // Innovation & Entrepreneurship
  // =========================
  {
    name: 'Innovation & Entrepreneurship',
    subcategories: [
      { name: 'IEDC Participation (2 years)', fixedPoints: 10 },
      { name: 'Product Development Award', fixedPoints: 30 },
      {
        name: 'Innovative Technologies',
        fixedPoints: 30
      },
      {
        name: 'Venture Capital / Funding',
        fixedPoints: 30
      }
    ]
  },

  // =========================
  // Leadership & Responsibility
  // =========================
  {
    name: 'Leadership & Responsibility',
    subcategories: [
      { name: 'College Council Chairman / General Secretary', fixedPoints: 20 },
      { name: 'Vice Chairman / Treasurer', fixedPoints: 15 },
      { name: 'Other Council Members', fixedPoints: 10 },
      { name: 'Class Representative', fixedPoints: 5 },
      {
        name: 'Event Coordinator',
        levels: [
          {
            name: 'Institution',
            prizes: [{ type: 'Participation', points: 5 }]
          },
          {
            name: 'State',
            prizes: [{ type: 'Participation', points: 10 }]
          },
          {
            name: 'National',
            prizes: [{ type: 'Participation', points: 20 }]
          }
        ]
      }
    ]
  },

  // =========================
  // Social Service
  // =========================
  {
    name: 'Social Service',
    subcategories: [
      { name: 'Disaster Relief / Rescue (Min 40 hrs)', fixedPoints: 20 }
    ]
  }

];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Category.deleteMany({});
    await Category.insertMany(categories);
    console.log('✅ Categories seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
