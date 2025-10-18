const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Sensor = require('../models/Sensor');
const SensorData = require('../models/SensorData');
const Log = require('../models/Log');
const { sendNotification } = require("./push"); // OK to require

// add sensor
router.post('/', auth, async (req, res) => {
  const { sensorId, name, location, meta } = req.body;
  try {
    let s = await Sensor.findOne({ sensorId });
    if(s) return res.status(400).json({ message: 'SensorId exists' });
    s = new Sensor({ sensorId, name, location, meta });
    await s.save();
    await Log.create({ type: 'system', message: 'Sensor added', sensor: s._id });
    res.json(s);
  } catch(err){ console.error(err); res.status(500).send('Server error'); }
});

// list sensors
router.get('/', auth, async (req, res) => {
  const sensors = await Sensor.find().lean();
  res.json(sensors);
});

// sensor history
router.get('/:id/history', auth, async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id);
    if(!sensor) return res.status(404).json({ message: 'Sensor not found' });
    const since = new Date(Date.now() - (60*60*1000)); // 1 hour
    const data = await SensorData.find({ sensor: sensor._id, timestamp: { $gte: since } }).sort({ timestamp: 1 });
    res.json(data);
  } catch(err){ console.error(err); res.status(500).send('Server error'); }
});

module.exports = router;
