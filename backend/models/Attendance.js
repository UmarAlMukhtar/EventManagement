const pool = require("./db");
const promisePool = pool.promise();

async function getAttendance() {
  const [rows] = await promisePool.query("SELECT * FROM attendance");
  return rows;
}
module.exports = { getAttendance };
