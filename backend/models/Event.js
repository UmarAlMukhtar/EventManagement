const pool = require('./db').promise();

module.exports = {
  async createEvent({ event_id, title, description, date, venue, coordinator_id }) {
    const sql = 'INSERT INTO events (event_id, title, description, date, venue, coordinator_id) VALUES (?, ?, ?, ?, ?, ?)';
    await pool.query(sql, [event_id, title, description, date, venue, coordinator_id]);
  },
  async getEvents() {
    const [rows] = await pool.query('SELECT * FROM events');
    return rows;
  },
  async getEventById(event_id) {
    const [rows] = await pool.query('SELECT * FROM events WHERE event_id = ?', [event_id]);
    return rows;
  },
  async updateEvent(event_id, fields) {
    const { title, description, date, venue, coordinator_id } = fields;
    const sql = 'UPDATE events SET title=?, description=?, date=?, venue=?, coordinator_id=? WHERE event_id=?';
    await pool.query(sql, [title, description, date, venue, coordinator_id, event_id]);
  },
  async deleteEvent(event_id) {
    await pool.query('DELETE FROM events WHERE event_id = ?', [event_id]);
  },
  async getEventsByCoordinator(coordinator_id) {
    const [rows] = await pool.query('SELECT * FROM events WHERE coordinator_id = ?', [coordinator_id]);
    return rows;
  }
};
