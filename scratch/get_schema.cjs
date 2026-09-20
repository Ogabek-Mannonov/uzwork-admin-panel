const { Client } = require('pg');
const c = new Client('postgresql://postgres:990338613ooga@localhost:5432/uzwork_db');
c.connect()
  .then(() => c.query("SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name='users'"))
  .then(r => {
      console.log(JSON.stringify(r.rows, null, 2));
      c.end();
  })
  .catch(e => console.error(e));
