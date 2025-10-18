const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// simple stub: echo or smart replies can be added
router.post('/', auth, async (req, res) => {
  const { message } = req.body;
  // TODO: integrate OpenAI or other LLM here
  const reply = `Assistant stub: I received your message: "${message}". (Integrate OpenAI to make this smart)`;
  res.json({ reply });
});

module.exports = router;
