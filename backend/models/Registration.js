const pool = require("./db").promise();
const db = require("./db");

// Function to generate next registration ID in format r001, r002, etc.
const generateNextRegId = async () => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT reg_id FROM registrations WHERE reg_id LIKE 'r%' ORDER BY CAST(SUBSTRING(reg_id, 2) AS UNSIGNED) DESC LIMIT 1",
      [],
      (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        let nextNumber = 1;
        if (results.length > 0) {
          const lastRegId = results[0].reg_id;
          const lastNumber = parseInt(lastRegId.substring(1));
          nextNumber = lastNumber + 1;
        }

        // Format as r001, r002, etc.
        const newRegId = `r${nextNumber.toString().padStart(3, "0")}`;
        resolve(newRegId);
      }
    );
  });
};

module.exports = {
  async createRegistration({ event_id, user_id, status = "confirmed" }) {
    const reg_id = await generateNextRegId(); // Generate registration ID in r001 format
    const reg_date = new Date().toISOString().split("T")[0]; // Current date
    const sql =
      "INSERT INTO registrations (reg_id, event_id, reg_date, user_id, status) VALUES (?, ?, ?, ?, ?)";
    const [result] = await pool.query(sql, [
      reg_id,
      event_id,
      reg_date,
      user_id,
      status,
    ]);
    return { reg_id, ...result };
  },
  async getRegistrationsByUser(user_id) {
    const [rows] = await pool.query(
      `SELECT r.*, e.title, e.date, e.venue 
       FROM registrations r 
       JOIN events e ON r.event_id = e.event_id 
       WHERE r.user_id = ?`,
      [user_id]
    );
    return rows;
  },
  async getRegistrationsByEvent(event_id) {
    const [rows] = await pool.query(
      `SELECT r.*, u.name, u.email 
       FROM registrations r 
       JOIN users u ON r.user_id = u.user_id 
       WHERE r.event_id = ?`,
      [event_id]
    );
    return rows;
  },
  async checkRegistration(event_id, user_id) {
    const [rows] = await pool.query(
      "SELECT * FROM registrations WHERE event_id = ? AND user_id = ?",
      [event_id, user_id]
    );
    return rows.length > 0 ? rows[0] : null;
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
