const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  type: { type: String, required: true },
  sensor: { type: mongoose.Schema.Types.ObjectId, ref: 'Sensor', required: false },
  message: { type: String },
  details: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now },
  source: { type: String, default: 'system' }, // add default
  severity: { type: String, enum: ['info','warning','error','critical'], default: 'info' },
  user: { type: String, default: 'system' }
});

module.exports = mongoose.model('Log', LogSchema);
