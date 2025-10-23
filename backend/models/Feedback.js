const pool = require("./db");

// Function to generate next feedback ID in format f001, f002, etc.
const generateNextFbId = async () => {
  try {
    const [results] = await pool.query(
      "SELECT fb_id FROM feedback WHERE fb_id LIKE 'f%' ORDER BY CAST(SUBSTRING(fb_id, 2) AS UNSIGNED) DESC LIMIT 1"
    );

    let nextNumber = 1;
    if (results.length > 0) {
      const lastFbId = results[0].fb_id;
      const lastNumber = parseInt(lastFbId.substring(1));
      nextNumber = lastNumber + 1;
    }

    // Format as f001, f002, etc.
    const newFbId = `f${nextNumber.toString().padStart(3, "0")}`;
    return newFbId;
  } catch (err) {
    throw new Error(`Failed to generate feedback ID: ${err.message}`);
  }
};

module.exports = {
  async submitFeedback({ reg_id, rating, comment }) {
    const fb_id = await generateNextFbId(); // Generate feedback ID in f001 format
    const sql =
      "INSERT INTO feedback (fb_id, reg_id, rating, comment) VALUES (?, ?, ?, ?)";
    const [result] = await pool.query(sql, [fb_id, reg_id, rating, comment]);
    return { fb_id, ...result };
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
