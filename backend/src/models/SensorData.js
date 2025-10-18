const mongoose = require('mongoose');

const SensorDataSchema = new mongoose.Schema({
  sensor: { type: mongoose.Schema.Types.ObjectId, ref: 'Sensor', required: true },
  gasPPM: { type: Number, required: true },
  temperature: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

SensorDataSchema.index({ sensor: 1, timestamp: -1 });

module.exports = mongoose.model('SensorData', SensorDataSchema);
