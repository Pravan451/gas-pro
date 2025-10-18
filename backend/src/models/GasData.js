const mongoose = require("mongoose");

const GasDataSchema = new mongoose.Schema({
  gasLevel: { type: Number, required: true },
  temperature: { type: Number, required: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("GasData", GasDataSchema);
