const pool = require("./db");
const promisePool = pool.promise();

async function getEvents() {
  const [rows] = await promisePool.query("SELECT * FROM events");
  return rows;
}
module.exports = { getEvents };
