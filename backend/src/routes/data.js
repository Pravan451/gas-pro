const express = require('express');
const router = express.Router();
const Sensor = require('../models/Sensor');
const SensorData = require('../models/SensorData');
const Log = require('../models/Log');

// POST new sensor data (from ESP/NodeMCU or Postman)
router.post('/', async (req, res) => {
  try {
    const { sensorId, gasPPM, temperature } = req.body;

    if (!sensorId || gasPPM === undefined || temperature === undefined) {
      return res.status(400).json({ message: 'sensorId, gasPPM, and temperature are required' });
    }

    // find or auto-create sensor
    let sensor = await Sensor.findOne({ sensorId });
    if (!sensor) {
      sensor = new Sensor({ sensorId, name: `Sensor-${sensorId}` });
      await sensor.save();
    }

    // save sensor data
    const data = new SensorData({
      sensor: sensor._id,
      gasPPM,
      temperature,
    });
    await data.save();

    // log entry
    await Log.create({
      type: 'sensor_reading',
      sensor: sensor._id,
      message: `New data: Gas ${gasPPM} ppm, Temp ${temperature}°C`,
      severity: gasPPM >= 100 ? 'critical' : gasPPM >= 50 ? 'warning' : 'info',
      source: sensor.name,
    });

    res.json({ message: 'Data stored successfully', data });
  } catch (err) {
    console.error('POST /data error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET latest sensor data (for dashboard/logs)
router.get('/', async (req, res) => {
  try {
    const sensors = await Sensor.find().lean();

    const latestData = await Promise.all(
      sensors.map(async (s) => {
        const latest = await SensorData.findOne({ sensor: s._id }).sort({ timestamp: -1 });
        return {
          sensorId: s.sensorId,
          name: s.name,
          gasPPM: latest?.gasPPM || 0,
          temperature: latest?.temperature || 0,
          timestamp: latest?.timestamp || new Date(),
          threshold: { warning: 50, danger: 100 },
          level: latest?.gasPPM || 0,
          unit: 'ppm',
        };
      })
    );

    res.json(latestData);
  } catch (err) {
    console.error('GET /data error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
