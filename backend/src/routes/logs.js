const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Log = require('../models/Log');

// get logs (pagination)
router.get('/', auth, async (req, res) => {
  const page = parseInt(req.query.page || 1);
  const limit = parseInt(req.query.limit || 50);
  const skip = (page - 1) * limit;
  const logs = await Log.find().populate('sensor').sort({ timestamp: -1 }).skip(skip).limit(limit);
  res.json(logs);
});

module.exports = router;
