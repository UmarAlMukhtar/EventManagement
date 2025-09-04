const express = require("express");
const router = express.Router();
const { getAttendance } = require("../models/Attendance");

// Get all attendance records
router.get("/", async (req, res) => {
  try {
    const attendance = await getAttendance();
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
