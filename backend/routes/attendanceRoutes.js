const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getAttendanceByReg,
  getAttendanceByUser,
  updateAttendanceStatus,
} = require("../controllers/attendanceController");

router.post("/", markAttendance);
router.get("/registration/:reg_id", getAttendanceByReg);
router.get("/user/:user_id", getAttendanceByUser);
router.put("/:att_id", updateAttendanceStatus);

module.exports = router;
