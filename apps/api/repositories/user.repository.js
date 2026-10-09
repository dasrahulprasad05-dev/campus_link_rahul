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
  const res = await query('SELECT id, name, email, role, avatar_url, email_verified, admin_verified, created_at FROM users WHERE id = $1', [id]);
  return res.rows[0] || null;
}

async function create({ name, email, passwordHash, role = 'student', verificationToken = null }) {
  const id = uuidv4();
  // Students are admin_verified by default (no staff approval needed)
  // Staff roles (admin, recruiter, mentor, super_admin) require super_admin verification
  const adminVerified = (role === 'student');
  const res = await query(
    `INSERT INTO users (id, name, email, password_hash, role, email_verified, verification_token, admin_verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, name, email, role, email_verified, admin_verified, created_at`,
    [id, name.trim(), email.toLowerCase().trim(), passwordHash, role, false, verificationToken, adminVerified]
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
     RETURNING id, name, email, role, email_verified, admin_verified`,
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
     SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL, email_verified = TRUE, updated_at = NOW() 
     WHERE id = $2 
     RETURNING id, name, email, role`,
    [newPasswordHash, userId]
  );
  return res.rows[0] || null;
}

async function listUsers() {
  const res = await query('SELECT id, name, email, role, email_verified, admin_verified, created_at FROM users ORDER BY created_at DESC');
  return res.rows;
}

/**
 * Admin Verification: Approve a staff user's account (super_admin only)
 */
async function adminVerifyUser(userId) {
  const res = await query(
    `UPDATE users 
     SET admin_verified = true, updated_at = NOW() 
     WHERE id = $1 
     RETURNING id, name, email, role, email_verified, admin_verified`,
    [userId]
  );
  return res.rows[0] || null;
}

/**
 * Admin Verification: Reject/revoke a staff user (super_admin only)
 */
async function adminRejectUser(userId) {
  const res = await query(
    `UPDATE users 
     SET admin_verified = false, updated_at = NOW() 
     WHERE id = $1 
     RETURNING id, name, email, role, email_verified, admin_verified`,
    [userId]
  );
  return res.rows[0] || null;
}

/**
 * List staff users pending admin verification (email_verified=true, admin_verified=false)
 */
async function listPendingVerifications() {
  const res = await query(
    `SELECT id, name, email, role, email_verified, admin_verified, created_at 
     FROM users 
     WHERE role IN ('admin','recruiter','mentor') 
       AND email_verified = true 
       AND admin_verified = false 
     ORDER BY created_at ASC`
  );
  return res.rows;
}

/**
 * List all staff (non-student, non-super_admin) users for super_admin management
 */
async function listAllStaff() {
  const res = await query(
    `SELECT id, name, email, role, email_verified, admin_verified, created_at 
     FROM users 
     WHERE role IN ('admin','recruiter','mentor') 
     ORDER BY created_at DESC`
  );
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
  adminVerifyUser,
  adminRejectUser,
  listPendingVerifications,
  listAllStaff,
};
