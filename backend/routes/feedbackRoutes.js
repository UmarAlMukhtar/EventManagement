const express = require("express");
const router = express.Router();
const { getFeedback } = require("../models/Feedback");

// Get all feedback
router.get("/", async (req, res) => {
  try {
    const feedback = await getFeedback();
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
