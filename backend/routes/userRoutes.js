const express = require("express");
const router = express.Router();
const { getUsers } = require("../models/User");

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
