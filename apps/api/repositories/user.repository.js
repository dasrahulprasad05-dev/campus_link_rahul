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
  const res = await query('SELECT id, name, email, role, avatar_url, email_verified, created_at FROM users WHERE id = $1', [id]);
  return res.rows[0] || null;
}

async function create({ name, email, passwordHash, role = 'student', verificationToken = null }) {
  const id = uuidv4();
  const res = await query(
    `INSERT INTO users (id, name, email, password_hash, role, email_verified, verification_token)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, email, role, email_verified, created_at`,
    [id, name.trim(), email.toLowerCase().trim(), passwordHash, role, false, verificationToken]
  );
  return res.rows[0];
}

async function findByVerificationToken(token) {
  if (!token) return null;
  const res = await query('SELECT * FROM users WHERE verification_token = $1', [token]);
  return res.rows[0] || null;
}

async function markEmailVerified(userId) {
  const res = await query(
    `UPDATE users 
     SET email_verified = true, verification_token = NULL, updated_at = NOW() 
     WHERE id = $1 
     RETURNING id, name, email, role, email_verified`,
    [userId]
  );
  return res.rows[0] || null;
}

async function setVerificationToken(userId, token) {
  const res = await query(
    `UPDATE users 
     SET verification_token = $1, updated_at = NOW() 
     WHERE id = $2 
     RETURNING id, email, verification_token`,
    [token, userId]
  );
  return res.rows[0] || null;
}

async function setResetPasswordToken(email, token, expiresAt) {
  const res = await query(
    `UPDATE users 
     SET reset_password_token = $1, reset_password_expires = $2, updated_at = NOW() 
     WHERE email = $3 
     RETURNING id, name, email`,
    [token, expiresAt, email.toLowerCase().trim()]
  );
  return res.rows[0] || null;
}

async function findByResetToken(token) {
  if (!token) return null;
  const res = await query(
    `SELECT * FROM users 
     WHERE reset_password_token = $1 AND reset_password_expires > NOW()`,
    [token]
  );
  return res.rows[0] || null;
}

async function updatePassword(userId, newPasswordHash) {
  const res = await query(
    `UPDATE users 
     SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL, updated_at = NOW() 
     WHERE id = $2 
     RETURNING id, name, email, role`,
    [newPasswordHash, userId]
  );
  return res.rows[0] || null;
}

async function listUsers() {
  const res = await query('SELECT id, name, email, role, email_verified, created_at FROM users ORDER BY created_at DESC');
  return res.rows;
}

module.exports = {
  findByEmail,
  findById,
  create,
  findByVerificationToken,
  markEmailVerified,
  setVerificationToken,
  setResetPasswordToken,
  findByResetToken,
  updatePassword,
  listUsers,
};
