const pool = require("./db").promise();

module.exports = {
  async markAttendance({ att_id, status, reg_id }) {
    const sql =
      "INSERT INTO attendance (att_id, status, reg_id) VALUES (?, ?, ?)";
    await pool.query(sql, [att_id, status, reg_id]);
  },
  async getAttendanceByReg(reg_id) {
    const [rows] = await pool.query(
      "SELECT * FROM attendance WHERE reg_id = ?",
      [reg_id]
    );
    return rows;
  },
  async getAttendanceByUser(user_id) {
    const sql = `
      SELECT attendance.* FROM attendance
      JOIN registrations ON attendance.reg_id = registrations.reg_id
      WHERE registrations.user_id = ?`;
    const [rows] = await pool.query(sql, [user_id]);
    return rows;
  },
  async updateAttendanceStatus(att_id, status) {
    const sql = "UPDATE attendance SET status=? WHERE att_id=?";
    await pool.query(sql, [status, att_id]);
  },
};
