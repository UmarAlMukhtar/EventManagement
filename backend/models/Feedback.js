const pool = require("./db");
const promisePool = pool.promise();

async function getFeedback() {
  const [rows] = await promisePool.query("SELECT * FROM feedback");
  return rows;
}
module.exports = { getFeedback };
