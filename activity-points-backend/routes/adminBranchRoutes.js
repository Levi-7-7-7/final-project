// const express = require('express');
// const Branch = require('../models/Branch');

// const router = express.Router();

// // Create branch
// router.post('/', async (req, res) => {
//   try {
//     const branch = new Branch(req.body);
//     await branch.save();
//     res.json(branch);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Get all branches
// router.get('/', async (req, res) => {
//   try {
//     const branches = await Branch.find();
//     res.json(branches);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Delete branch
// router.delete('/:id', async (req, res) => {
//   try {
//     await Branch.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Branch deleted' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
