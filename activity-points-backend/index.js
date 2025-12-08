require('dotenv').config();

const express = require('express');
const app = express();

const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');



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