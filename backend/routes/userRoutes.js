const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUser,
} = require("../controllers/userController");

router.get("/", getUsers);
router.get("/profile", authenticateToken, getCurrentUser);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", authenticateToken, updateUser);
router.delete("/:id", authenticateToken, deleteUser);

module.exports = router;
