const GasData = require("../src/models/GasData");

exports.receiveData = async (req, res) => {
  try {
    const { gasLevel, temperature } = req.body;

    if (gasLevel === undefined) {
      return res.status(400).json({ message: "Gas level is required" });
    }

    // Save data to DB
    const newData = new GasData({
      gasLevel,
      temperature: temperature || 0
    });
    await newData.save();

    // Threshold check
    let alertMessage = "✅ Gas levels normal.";
    if (gasLevel > 250) {
      alertMessage = "⚠️ ALERT: Gas leakage detected! Take action immediately!";
    }

    console.log("📩 Data received:", req.body, " | ", alertMessage);

    res.status(201).json({
      message: "Data saved",
      alert: alertMessage,
      data: newData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await GasData.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
