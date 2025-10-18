// routes/settings.js
const express = require("express");
const router = express.Router();
const Setting = require("../models/Setting");
const auth = require("../middleware/auth");

// Get thresholds
router.get("/thresholds", auth, async (req, res) => {
  try {
    const setting = await Setting.findOne({ user: req.user.id, key: "thresholds" });
    if (!setting) return res.json(null); // no thresholds saved yet
    res.json(setting.value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Save/update thresholds
router.post("/thresholds", auth, async (req, res) => {
  try {
    const data = req.body; // this is thresholds object
    let setting = await Setting.findOne({ user: req.user.id, key: "thresholds" });
    if (setting) {
      setting.value = data;
      await setting.save();
    } else {
      setting = new Setting({ user: req.user.id, key: "thresholds", value: data });
      await setting.save();
    }
    res.json(setting);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save thresholds" });
  }
});

module.exports = router;
