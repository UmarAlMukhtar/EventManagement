const express = require("express");
const router = express.Router();
const { getRegistrations } = require("../models/Registration");

// Get all registrations
router.get("/", async (req, res) => {
  try {
    const registrations = await getRegistrations();
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
