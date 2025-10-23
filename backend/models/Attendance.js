const pool = require("./db");

// Function to generate next attendance ID in format a001, a002, etc.
const generateNextAttId = async () => {
  try {
    const [results] = await pool.query(
      "SELECT att_id FROM attendance WHERE att_id LIKE 'a%' ORDER BY CAST(SUBSTRING(att_id, 2) AS UNSIGNED) DESC LIMIT 1"
    );

    let nextNumber = 1;
    if (results.length > 0) {
      const lastAttId = results[0].att_id;
      const lastNumber = parseInt(lastAttId.substring(1));
      nextNumber = lastNumber + 1;
    }

    // Format as a001, a002, etc.
    const newAttId = `a${nextNumber.toString().padStart(3, "0")}`;
    return newAttId;
  } catch (err) {
    throw new Error(`Failed to generate attendance ID: ${err.message}`);
  }
};

module.exports = {
  async markAttendance({ status, reg_id }) {
    // Check if attendance already exists for this registration
    const [existingRecords] = await pool.query(
      "SELECT att_id FROM attendance WHERE reg_id = ?",
      [reg_id]
    );

    if (existingRecords.length > 0) {
      // Update existing attendance record
      const att_id = existingRecords[0].att_id;
      const sql = "UPDATE attendance SET status=?, updated_at=NOW() WHERE att_id=?";
      await pool.query(sql, [status, att_id]);
      return { att_id, updated: true };
    } else {
      // Create new attendance record
      const att_id = await generateNextAttId();
      const sql =
        "INSERT INTO attendance (att_id, status, reg_id) VALUES (?, ?, ?)";
      const [result] = await pool.query(sql, [att_id, status, reg_id]);
      return { att_id, created: true, ...result };
    }
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
