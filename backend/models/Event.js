const pool = require("./db");

// Function to generate next event ID in format e001, e002, etc.
const generateNextEventId = async () => {
  try {
    const [results] = await pool.query(
      "SELECT event_id FROM events WHERE event_id LIKE 'e%' ORDER BY CAST(SUBSTRING(event_id, 2) AS UNSIGNED) DESC LIMIT 1"
    );

    let nextNumber = 1;
    if (results.length > 0) {
      const lastEventId = results[0].event_id;
      const lastNumber = parseInt(lastEventId.substring(1));
      nextNumber = lastNumber + 1;
    }

    // Format as e001, e002, etc.
    const newEventId = `e${nextNumber.toString().padStart(3, "0")}`;
    return newEventId;
  } catch (err) {
    throw new Error(`Failed to generate event ID: ${err.message}`);
  }
};

module.exports = {
  async createEvent({ title, description, date, venue, coordinator_id }) {
    const event_id = await generateNextEventId(); // Generate event ID in e001 format
    const sql =
      "INSERT INTO events (event_id, title, description, date, venue, coordinator_id) VALUES (?, ?, ?, ?, ?, ?)";
    const [result] = await pool.query(sql, [
      event_id,
      title,
      description,
      date,
      venue,
      coordinator_id,
    ]);
    return { event_id, ...result };
  },
  async getEvents() {
    const [rows] = await pool.query("SELECT * FROM events");
    return rows;
  },
  async getEventById(event_id) {
    const [rows] = await pool.query("SELECT * FROM events WHERE event_id = ?", [
      event_id,
    ]);
    return rows;
  },
  async updateEvent(event_id, fields) {
    const { title, description, date, venue, coordinator_id } = fields;
    const sql =
      "UPDATE events SET title=?, description=?, date=?, venue=?, coordinator_id=? WHERE event_id=?";
    await pool.query(sql, [
      title,
      description,
      date,
      venue,
      coordinator_id,
      event_id,
    ]);
  },
  async deleteEvent(event_id) {
    await pool.query("DELETE FROM events WHERE event_id = ?", [event_id]);
  },
  async getEventsByCoordinator(coordinator_id) {
    const [rows] = await pool.query(
      "SELECT * FROM events WHERE coordinator_id = ?",
      [coordinator_id]
    );
    return rows;
  },
};
