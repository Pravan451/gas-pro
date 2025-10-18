const mongoose = require('mongoose');

const SensorSchema = new mongoose.Schema({
  sensorId: { type: String, required: true, unique: true },
  name: { type: String, default: 'Unnamed Sensor' },
  location: { type: String },
  createdAt: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: null },
  meta: { type: Object, default: {} }
});

module.exports = mongoose.model('Sensor', SensorSchema);
