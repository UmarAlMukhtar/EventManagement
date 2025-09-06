const pool = require("./db").promise();

module.exports = {
  async createRegistration({ reg_id, event_id, reg_date, user_id, status }) {
    const sql =
      "INSERT INTO registrations (reg_id, event_id, reg_date, user_id, status) VALUES (?, ?, ?, ?, ?)";
    await pool.query(sql, [reg_id, event_id, reg_date, user_id, status]);
  },
  async getRegistrationsByUser(user_id) {
    const [rows] = await pool.query(
      "SELECT * FROM registrations WHERE user_id = ?",
      [user_id]
    );
    return rows;
  },
  async getRegistrationsByEvent(event_id) {
    const [rows] = await pool.query(
      "SELECT * FROM registrations WHERE event_id = ?",
      [event_id]
    );
    return rows;
  },
  async updateRegistration(reg_id, fields) {
    const { status } = fields;
    const sql = "UPDATE registrations SET status=? WHERE reg_id=?";
    await pool.query(sql, [status, reg_id]);
  },
  async deleteRegistration(reg_id) {
    await pool.query("DELETE FROM registrations WHERE reg_id = ?", [reg_id]);
  },
};
