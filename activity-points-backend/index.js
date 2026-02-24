// Normal Method Backend and Frontend Seperated by LPT

require('dotenv').config();

const express = require('express');
const app = express();

const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');

app.set('trust proxy', 1);


// Route imports
//const adminBatchRoutes = require('./routes/adminBatchRoutes');
//const adminBranchRoutes = require('./routes/adminBranchRoutes');
//const adminAuthRoutes = require('./routes/adminAuthRoutes');
//const adminTutorRoutes = require('./routes/adminTutorRoutes');
// const adminCategoryRoutes = require('./routes/adminCategoryRoutes');
// const adminRoutes = require('./routes/adminRoutes');

const tutorStudentRoutes = require('./routes/tutorStudentRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes');
const metaRoutes = require('./routes/metaRoutes');
const categoriesRoutes = require('./routes/categories');





// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Connect to DB
connectDB();



// // ===============================
// // ✅ Seed categories if not present
// // ===============================
// const categories = require('./seedCategories').categories || [
//   // fallback in case you want to define inline
// ];

// async function seedCategories() {
//   try {
//     const count = await Category.countDocuments();
//     if (count === 0) {
//       console.log('Seeding default categories...');
//       await Category.insertMany(categories);
//       console.log('✅ Categories seeded successfully');
//     } else {
//       console.log('Categories already exist. Skipping seeding.');
//     }
//   } catch (err) {
//     console.error('❌ Category seeding failed:', err);
//   }
// }

// // Call seeding
// seedCategories();




// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Activity Points API is running' });
});


app.use('/api/tutor/students', tutorStudentRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/meta', metaRoutes);

// app.use("/api/admin/auth", require("./routes/adminAuthRoutes"));
// app.use("/api/admin/tutors", require("./routes/adminTutorRoutes"));
// app.use("/api/admin/batches", require("./routes/adminBatchRoutes"));
// app.use("/api/admin/branches", require("./routes/adminBranchRoutes"));

// app.use("/api/admin/categories", require("./routes/adminCategoryRoutes"));

// app.use("/api", require("./routes/adminRoutes"));


app.use('/api/categories', categoriesRoutes);

app.use('/api/certificates', require('./routes/certificateRoutes'));




// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});















// require('dotenv').config();

// const express = require('express');
// const path = require('path');
// const fs = require('fs');
// const cors = require('cors');
// const morgan = require('morgan');
// const helmet = require('helmet');
// const cookieParser = require('cookie-parser');
// const rateLimit = require('express-rate-limit');

// const connectDB = require('./config/db');

// // Route imports
// const tutorStudentRoutes = require('./routes/tutorStudentRoutes');
// const tutorRoutes = require('./routes/tutorRoutes');
// const studentRoutes = require('./routes/studentRoutes');
// const authRoutes = require('./routes/authRoutes');
// const metaRoutes = require('./routes/metaRoutes');
// const categoriesRoutes = require('./routes/categories');
// const certificateRoutes = require('./routes/certificateRoutes');

// const app = express();

// // ===== Middleware =====
// app.use(helmet());
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(morgan('dev'));

// // ===== Trust proxy (needed if behind reverse proxy) =====
// app.set('trust proxy', 1);

// // ===== Rate limiting =====
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100,
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use(limiter);

// // ===== Connect to MongoDB =====
// connectDB();

// // ===== API Routes =====
// app.use('/api/tutor/students', tutorStudentRoutes);
// app.use('/api/tutors', tutorRoutes);
// app.use('/api/students', studentRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/meta', metaRoutes);
// app.use('/api/categories', categoriesRoutes);
// app.use('/api/certificates', certificateRoutes);

// // ===== Root API check =====
// app.get('/api', (req, res) => {
//   res.json({ message: 'Activity Points API is running' });
// });

// // ===== Serve frontend (React build) if exists =====
// const buildPath = path.join(__dirname, 'frontend-build');
// if (fs.existsSync(buildPath)) {
//   app.use(express.static(buildPath));

//   // Serve index.html for all non-API routes
//   app.get(/^\/(?!api).*/, (req, res) => {
//     res.sendFile(path.join(buildPath, 'index.html'));
//   });
// }

// // ===== Start Server =====
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });