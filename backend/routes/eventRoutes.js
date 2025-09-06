const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByCoordinator,
} = require("../controllers/eventController");

router.post("/", authenticateToken, authorizeRoles("admin"), createEvent);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.get("/coordinator/:coordinatorId", getEventsByCoordinator);
router.put("/:id", authenticateToken, authorizeRoles("admin"), updateEvent);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), deleteEvent);

module.exports = router;
