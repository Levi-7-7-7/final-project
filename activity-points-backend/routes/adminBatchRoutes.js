// const express = require('express');
// const Batch = require('../models/Batch');

// const router = express.Router();

// // Create batch
// router.post('/', async (req, res) => {
//   try {
//     const batch = new Batch(req.body);
//     await batch.save();
//     res.json(batch);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Get all batches
// router.get('/', async (req, res) => {
//   try {
//     const batches = await Batch.find();
//     res.json(batches);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Delete batch
// router.delete('/:id', async (req, res) => {
//   try {
//     await Batch.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Batch deleted' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
