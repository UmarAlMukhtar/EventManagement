const pool = require("./db");
const promisePool = pool.promise();

async function getUsers() {
  const [rows] = await promisePool.query("SELECT * FROM users");
  return rows;
}
module.exports = { getUsers };
