// const express = require("express");
// const adminAuth = require("../middleware/adminAuth");
// const Category = require("../models/Category");

// const router = express.Router();

// /* ----------------------------------
//    ADD CATEGORY
// ---------------------------------- */
// router.post("/", adminAuth, async (req, res) => {
//   try {
//     const { name, description, maxPoints, minDuration, requiredDocuments } = req.body;

//     const category = await Category.create({
//       name,
//       description,
//       maxPoints,
//       minDuration,
//       requiredDocuments
//     });

//     res.json({ success: true, category });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// /* ----------------------------------
//    ADD SUBCATEGORY
// ---------------------------------- */
// router.post("/:categoryId/subcategory", adminAuth, async (req, res) => {
//   try {
//     const { name, points, level } = req.body;

//     const category = await Category.findById(req.params.categoryId);
//     if (!category) return res.status(404).json({ error: "Category not found" });

//     category.subcategories.push({ name, points, level });
//     await category.save();

//     res.json({ success: true, category });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// /* ----------------------------------
//    LIST CATEGORIES
// ---------------------------------- */
// router.get("/", adminAuth, async (req, res) => {
//   const categories = await Category.find();
//   res.json({ success: true, categories });
// });

// /* ----------------------------------
//    DELETE CATEGORY
// ---------------------------------- */
// router.delete("/:id", adminAuth, async (req, res) => {
//   await Category.findByIdAndDelete(req.params.id);
//   res.json({ success: true, message: "Category deleted" });
// });

// /* ----------------------------------
//    DELETE SUBCATEGORY
// ---------------------------------- */
// router.delete("/:categoryId/subcategory/:subId", adminAuth, async (req, res) => {
//   try {
//     const category = await Category.findById(req.params.categoryId);
//     if (!category) return res.status(404).json({ error: "Category not found" });

//     category.subcategories.id(req.params.subId)?.deleteOne();
//     await category.save();

//     res.json({ success: true, message: "Subcategory deleted" });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// module.exports = router;
