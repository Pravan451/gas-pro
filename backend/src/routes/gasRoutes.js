const express = require("express");
const router = express.Router();
const { receiveData, getLogs } = require("../../controllers/gasController");

// Routes
router.post("/gas-data", receiveData);   // ESP32 or Postman sends here
router.get("/logs", getLogs);           // Fetch logs

// Test route
router.get("/test", (req, res) => {
  res.send("✅ API is working!");
});

module.exports = router;
