const pool = require("./db");

module.exports = {
  async addCoordinator(event_id, coordinator_id) {
    const sql =
      "INSERT INTO event_coordinators (event_id, coordinator_id) VALUES (?, ?)";
    const [result] = await pool.query(sql, [event_id, coordinator_id]);
    return result;
  },

  async removeCoordinator(event_id, coordinator_id) {
    const sql =
      "DELETE FROM event_coordinators WHERE event_id = ? AND coordinator_id = ?";
    const [result] = await pool.query(sql, [event_id, coordinator_id]);
    return result;
  },

  async getEventCoordinators(event_id) {
    const [rows] = await pool.query(
      `SELECT ec.coordinator_id, u.name, u.email, u.role, ec.added_at
       FROM event_coordinators ec
       JOIN users u ON ec.coordinator_id = u.user_id
       WHERE ec.event_id = ?`,
      [event_id]
    );
    return rows;
  },

  async checkCoordinator(event_id, coordinator_id) {
    const [rows] = await pool.query(
      "SELECT * FROM event_coordinators WHERE event_id = ? AND coordinator_id = ?",
      [event_id, coordinator_id]
    );
    return rows.length > 0;
  },
};
