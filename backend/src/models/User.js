const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, default: '' },
  department: { type: String, default: '' },
  role: { type: String, default: '' },
  clearanceLevel: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

// Check if model already exists, if yes use it, else create new
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
