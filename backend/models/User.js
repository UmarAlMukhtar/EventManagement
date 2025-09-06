const pool = require("./db").promise();

module.exports = {
  async getUsers() {
    const [rows] = await pool.query("SELECT * FROM users");
    return rows;
  },
  async getUserById(user_id) {
    const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [
      user_id,
    ]);
    return rows;
  },
  async createUser({ user_id, name, email, password, role }) {
    const sql =
      "INSERT INTO users (user_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)";
    await pool.query(sql, [user_id, name, email, password, role]);
  },
  async getUserByEmail(email) {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows;
  },
  async updateUser(user_id, fields) {
    const { name, email, password, role } = fields;
    const sql =
      "UPDATE users SET name=?, email=?, password=?, role=? WHERE user_id=?";
    await pool.query(sql, [name, email, password, role, user_id]);
  },
  async deleteUser(user_id) {
    await pool.query("DELETE FROM users WHERE user_id = ?", [user_id]);
  },
};
