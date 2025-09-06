const pool = require("./db").promise();

module.exports = {
  async submitFeedback({ fb_id, reg_id, rating, comment }) {
    const sql =
      "INSERT INTO feedback (fb_id, reg_id, rating, comment) VALUES (?, ?, ?, ?)";
    await pool.query(sql, [fb_id, reg_id, rating, comment]);
  },
  async getFeedbackByReg(reg_id) {
    const [rows] = await pool.query("SELECT * FROM feedback WHERE reg_id = ?", [
      reg_id,
    ]);
    return rows;
  },
  async getFeedbackByEvent(event_id) {
    const sql = `
      SELECT feedback.* FROM feedback
      JOIN registrations ON feedback.reg_id = registrations.reg_id
      WHERE registrations.event_id = ?`;
    const [rows] = await pool.query(sql, [event_id]);
    return rows;
  },
  async getFeedbackByUser(user_id) {
    const sql = `
      SELECT feedback.* FROM feedback
      JOIN registrations ON feedback.reg_id = registrations.reg_id
      WHERE registrations.user_id = ?`;
    const [rows] = await pool.query(sql, [user_id]);
    return rows;
  },
};
