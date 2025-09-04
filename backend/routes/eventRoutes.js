const express = require("express");
const router = express.Router();
const { getEvents } = require("../models/Event");

// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await getEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
