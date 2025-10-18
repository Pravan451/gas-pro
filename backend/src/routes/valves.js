const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Valve = require('../models/Valve');
const Log = require('../models/Log');
const notify = require('../utils/notify');

// get all valves
router.get('/', auth, async (req, res) => {
  try {
    const valves = await Valve.find();
    res.json(valves);
  } catch(err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// create valve
router.post('/', auth, async (req, res) => {
  const { valveId, location } = req.body;
  try {
    let v = await Valve.findOne({ valveId });
    if(v) return res.status(400).json({ message: 'Valve exists' });
    v = await Valve.create({ valveId, location, status: 'OFF' });
    await Log.create({ type: 'system', message: 'Valve created', details: { valveId, location }});
    res.json(v);
  } catch(err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// control valve (ON/OFF) by valveId
router.post('/:valveId/control', auth, async (req, res) => {
  const { action } = req.body; // 'ON' or 'OFF'
  try {
    const v = await Valve.findOne({ valveId: req.params.valveId });
    if(!v) return res.status(404).json({ message: 'Valve not found' });
    if(!['ON','OFF'].includes(action)) return res.status(400).json({ message: 'Invalid action' });
    v.status = action;
    v.lastUpdated = new Date();
    await v.save();
    await Log.create({ type: 'system', message: `Valve ${action}`, details: { valveId: v.valveId }});
    notify.emit('valve:updated', { valveId: v.valveId, status: v.status, lastUpdated: v.lastUpdated });
    res.json(v);
  } catch(err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
