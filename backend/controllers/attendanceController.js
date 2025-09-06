const Attendance = require("../models/attendance");

exports.markAttendance = async (req, res) => {
  try {
    await Attendance.markAttendance(req.body);
    res.status(201).json({ message: "Attendance marked." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAttendanceByReg = async (req, res) => {
  try {
    const attendance = await Attendance.getAttendanceByReg(req.params.reg_id);
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAttendanceByUser = async (req, res) => {
  try {
    const attendance = await Attendance.getAttendanceByUser(req.params.user_id);
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAttendanceStatus = async (req, res) => {
  try {
    await Attendance.updateAttendanceStatus(req.params.att_id, req.body.status);
    res.json({ message: "Attendance updated." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
