// // routes/adminRoutes.js
// const express = require("express");
// const multer = require("multer");
// const fs = require("fs");
// const csv = require("csv-parser");

// const Admin = require("../models/Admin"); // optional
// const Tutor = require("../models/Tutor");
// const Batch = require("../models/Batch");
// const Branch = require("../models/Branch");
// const Category = require("../models/Category");

// const adminAuth = require("../middleware/adminAuth"); // create or reuse

// const router = express.Router();
// const upload = multer({ dest: "uploads/" });

// // -------------------- TUTORS --------------------
// // create tutor
// router.post("/admin/tutors", adminAuth, async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const tutor = await Tutor.create({ name, email, password });
//     res.json({ success: true, tutor });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // list tutors
// router.get("/admin/tutors", adminAuth, async (req, res) => {
//   try {
//     const tutors = await Tutor.find().select("name email createdAt");
//     res.json({ success: true, tutors });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // delete tutor
// router.delete("/admin/tutors/:id", adminAuth, async (req, res) => {
//   try {
//     await Tutor.findByIdAndDelete(req.params.id);
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // upload tutors via CSV (name,email,password)
// router.post("/admin/tutors/upload", adminAuth, upload.single("file"), (req, res) => {
//   if (!req.file) return res.status(400).json({ error: "No file uploaded" });
//   const results = [];
//   fs.createReadStream(req.file.path)
//     .pipe(csv())
//     .on("data", (data) => results.push(data))
//     .on("end", async () => {
//       try {
//         const docs = results.map(r => ({
//           name: r.name,
//           email: r.email,
//           password: r.password,
//         }));
//         await Tutor.insertMany(docs, { ordered: false });
//         fs.unlinkSync(req.file.path);
//         res.json({ success: true, message: "Tutors uploaded" });
//       } catch (err) {
//         fs.unlinkSync(req.file.path);
//         console.error(err);
//         res.status(400).json({ error: err.message });
//       }
//     });
// });

// // -------------------- BATCH --------------------
// router.post("/admin/batches", adminAuth, async (req, res) => {
//   try {
//     const { name } = req.body;
//     const b = await Batch.create({ name });
//     res.json({ success: true, batch: b });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// router.get("/admin/batches", adminAuth, async (req, res) => {
//   try {
//     const batches = await Batch.find();
//     res.json({ success: true, batches });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // -------------------- BRANCH --------------------
// router.post("/admin/branches", adminAuth, async (req, res) => {
//   try {
//     const { name } = req.body;
//     const br = await Branch.create({ name });
//     res.json({ success: true, branch: br });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// router.get("/admin/branches", adminAuth, async (req, res) => {
//   try {
//     const branches = await Branch.find();
//     res.json({ success: true, branches });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // -------------------- CATEGORIES --------------------
// router.post("/admin/categories", adminAuth, async (req, res) => {
//   try {
//     const { name, description, maxPoints, minDuration, requiredDocuments } = req.body;
//     const cat = await Category.create({
//       name,
//       description,
//       maxPoints,
//       minDuration,
//       requiredDocuments,
//       subcategories: [],
//     });
//     res.json({ success: true, category: cat });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// router.get("/admin/categories", adminAuth, async (req, res) => {
//   try {
//     const categories = await Category.find();
//     res.json({ success: true, categories });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // update category (basic)
// router.put("/admin/categories/:id", adminAuth, async (req, res) => {
//   try {
//     const upd = req.body;
//     const cat = await Category.findByIdAndUpdate(req.params.id, upd, { new: true });
//     res.json({ success: true, category: cat });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // add subcategory
// router.post("/admin/categories/:id/subcategory", adminAuth, async (req, res) => {
//   try {
//     const { name, points, level } = req.body;
//     const cat = await Category.findById(req.params.id);
//     if (!cat) return res.status(404).json({ error: "Category not found" });
//     cat.subcategories.push({ name, points, level });
//     await cat.save();
//     res.json({ success: true, category: cat });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // delete subcategory
// router.delete("/admin/categories/:categoryId/subcategory/:subId", adminAuth, async (req, res) => {
//   try {
//     const cat = await Category.findById(req.params.categoryId);
//     if (!cat) return res.status(404).json({ error: "Category not found" });
//     cat.subcategories.id(req.params.subId)?.remove();
//     await cat.save();
//     res.json({ success: true });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // delete category
// router.delete("/admin/categories/:id", adminAuth, async (req, res) => {
//   try {
//     await Category.findByIdAndDelete(req.params.id);
//     res.json({ success: true });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// module.exports = router;