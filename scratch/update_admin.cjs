const { Client } = require('pg');
const bcrypt = require('bcrypt'); // or bcryptjs depending on what's installed
// let's try requiring both to be safe
let bcryptLib;
try {
  bcryptLib = require('bcryptjs');
} catch (e) {
  bcryptLib = require('bcrypt');
}

const c = new Client('postgresql://postgres:990338613ooga@localhost:5432/uzwork_db');

async function run() {
  try {
    await c.connect();
    const hash = await bcryptLib.hash('admin123', 10);
    console.log("Generated hash:", hash);
    const query = `UPDATE users SET password_hash = $1 WHERE email = 'super@uzwork.uz' RETURNING *;`;
    const r = await c.query(query, [hash]);
    console.log("Updated user:", r.rows[0].email);
  } catch (err) {
    console.error(err);
  } finally {
    c.end();
  }
}
run();
