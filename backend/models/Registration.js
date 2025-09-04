const pool = require("./db");
const promisePool = pool.promise();

async function getRegistrations() {
  const [rows] = await promisePool.query("SELECT * FROM registrations");
  return rows;
}
module.exports = { getRegistrations };
