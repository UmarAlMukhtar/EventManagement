const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  createRegistration,
  getMyRegistrations,
  getRegistrationsByUser,
  getRegistrationsByEvent,
  checkRegistrationStatus,
  updateRegistration,
  deleteRegistration,
} = require("../controllers/registrationController");

// Protected routes - require authentication
router.use(authenticateToken);

// User can register for events and get their own registrations
router.post("/", createRegistration);
router.get("/my-registrations", getMyRegistrations);
router.get("/check/:event_id", checkRegistrationStatus);

// Admin routes - require admin role
router.get("/user/:user_id", authorizeRoles("admin"), getRegistrationsByUser);
router.get(
  "/event/:event_id",
  authorizeRoles("admin", "coordinator"),
  getRegistrationsByEvent
);
router.put("/:reg_id", authorizeRoles("admin"), updateRegistration);
router.delete("/:reg_id", authorizeRoles("admin"), deleteRegistration);

module.exports = router;
