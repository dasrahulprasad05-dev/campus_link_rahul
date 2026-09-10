/* ============================================================
   CAMPUSLINK — User Repository
   Data access methods for user accounts and authentication.
   ============================================================ */

const { query } = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

async function findByEmail(email) {
  if (!email) return null;
  const res = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
  return res.rows[0] || null;
}

async function findById(id) {
  if (!id) return null;
  const res = await query('SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = $1', [id]);
  return res.rows[0] || null;
}

async function create({ name, email, passwordHash, role = 'student' }) {
  const id = uuidv4();
  const res = await query(
    'INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, created_at',
    [id, name.trim(), email.toLowerCase().trim(), passwordHash, role]
  );
  return res.rows[0];
}

async function listUsers() {
  const res = await query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
  return res.rows;
}

module.exports = {
  findByEmail,
  findById,
  create,
  listUsers,
};
