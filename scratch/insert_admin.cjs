const { Client } = require('pg');
const c = new Client('postgresql://postgres:990338613ooga@localhost:5432/uzwork_db');

const query = `
INSERT INTO users (id, username, first_name, last_name, email, password_hash, role, kyc_status, created_at, updated_at, status, is_verified) 
VALUES (
    gen_random_uuid(), 
    'superadmin',
    'Super',
    'Admin',
    'super@uzwork.uz', 
    '$2b$10$w8.1k9.Q.9g.yL8E.GjDMe9XGg8xZ/9n8u0L6F2s7WwF1/m6/4wGq', 
    'admin', 
    'unverified', 
    NOW(), 
    NOW(),
    'active',
    true
)
ON CONFLICT (email) DO UPDATE SET role = 'admin', password_hash = '$2b$10$w8.1k9.Q.9g.yL8E.GjDMe9XGg8xZ/9n8u0L6F2s7WwF1/m6/4wGq'
RETURNING *;
`;

c.connect()
  .then(() => c.query(query))
  .then(r => {
      console.log("Muvaffaqiyatli yaratildi!", r.rows[0]);
      c.end();
  })
  .catch(e => {
      console.error("Xatolik yuz berdi:");
      console.error(e);
      c.end();
  });
