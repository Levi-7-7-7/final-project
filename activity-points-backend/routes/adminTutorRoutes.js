// const express = require("express");
// const bcrypt = require("bcryptjs");
// const Tutor = require("../models/Tutor");
// const adminAuth = require("../middleware/adminAuth");

// const router = express.Router();

// // Create Tutor
// router.post("/", adminAuth, async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     const tutor = await Tutor.create({ name, email, password });
//     res.json({ success: true, tutor });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Get all tutors
// router.get("/", adminAuth, async (req, res) => {
//   const tutors = await Tutor.find();
//   res.json({ success: true, tutors });
// });

// // Delete tutor
// router.delete("/:id", adminAuth, async (req, res) => {
//   await Tutor.findByIdAndDelete(req.params.id);
//   res.json({ success: true, message: "Tutor removed" });
// });

// module.exports = router;
