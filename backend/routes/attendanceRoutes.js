const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  markAttendance,
  getAttendanceByReg,
  getAttendanceByUser,
  updateAttendanceStatus,
} = require("../controllers/attendanceController");

// Protected routes - require authentication
router.use(authenticateToken);

// Mark attendance - allow admin and coordinator
router.post("/", authorizeRoles("admin", "coordinator"), markAttendance);
router.get("/registration/:reg_id", getAttendanceByReg);
router.get("/user/:user_id", getAttendanceByUser);
router.put(
  "/:att_id",
  authorizeRoles("admin", "coordinator"),
  updateAttendanceStatus
);

module.exports = router;
