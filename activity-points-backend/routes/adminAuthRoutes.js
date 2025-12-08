// const express = require("express");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const Admin = require("../models/Admin");

// const router = express.Router();

// // 👉 Register Admin (only once - later disable)
// router.post("/register", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const admin = await Admin.create({ email, password });
//     res.json({ success: true, admin });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // 👉 Admin Login
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const admin = await Admin.findOne({ email });
//     if (!admin) return res.status(404).json({ error: "Admin not found" });

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) return res.status(400).json({ error: "Invalid password" });

//     const token = jwt.sign(
//       { id: admin._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.json({ success: true, token });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
