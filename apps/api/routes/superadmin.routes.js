/* ============================================================
   CAMPUSLINK — Super Admin Routes
   Endpoints for super_admin to manage and verify staff accounts.
   Only accessible to users with role 'super_admin'.
   ============================================================ */

const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const userRepo = require('../repositories/user.repository');
const { sendAdminApprovedEmail } = require('../services/email.service');
const { query } = require('../db/pool');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// All routes require super_admin role
router.use(authenticate, authorize('super_admin'));

// GET /api/v1/superadmin/dashboard — stats for super_admin home
router.get('/dashboard', async (req, res) => {
  try {
    const allUsers = await userRepo.listUsers();
    const pending = allUsers.filter(u => ['admin','recruiter','mentor'].includes(u.role) && u.email_verified && !u.admin_verified);
    const approved = allUsers.filter(u => ['admin','recruiter','mentor'].includes(u.role) && u.admin_verified);
    const students = allUsers.filter(u => u.role === 'student');

    res.json({
      success: true,
      data: {
        kpis: [
          { label: 'Pending Approvals', value: String(pending.length), icon: '⏳', color: 'orange' },
          { label: 'Approved Staff', value: String(approved.length), icon: '✅', color: 'green' },
          { label: 'Total Students', value: String(students.length), icon: '🎓', color: 'blue' },
          { label: 'Total Users', value: String(allUsers.length), icon: '👥', color: 'purple' },
        ],
        pending,
        approved,
      }
    });
  } catch (err) {
    console.error('[SuperAdmin Dashboard Error]:', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// GET /api/v1/superadmin/pending — list staff pending verification
router.get('/pending', async (req, res) => {
  try {
    const pending = await userRepo.listPendingVerifications();
    res.json({ success: true, data: pending });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// GET /api/v1/superadmin/staff — list all staff accounts
router.get('/staff', async (req, res) => {
  try {
    const staff = await userRepo.listAllStaff();
    res.json({ success: true, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// POST /api/v1/superadmin/verify/:id — approve a staff account
router.post('/verify/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const verified = await userRepo.adminVerifyUser(id);
    if (!verified) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    // Send approval email in background
    sendAdminApprovedEmail(verified).catch(err => {
      console.warn('[SuperAdmin] Approval email error:', err.message);
    });

    res.json({
      success: true,
      message: `${verified.name} has been approved and can now log in.`,
      data: verified
    });
  } catch (err) {
    console.error('[SuperAdmin Verify Error]:', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// POST /api/v1/superadmin/reject/:id — reject/revoke a staff account
router.post('/reject/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rejected = await userRepo.adminRejectUser(id);
    if (!rejected) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }
    res.json({
      success: true,
      message: `${rejected.name}'s access has been revoked.`,
      data: rejected
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// POST /api/v1/superadmin/create-staff — super_admin creates a staff account
router.post('/create-staff', async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name, email, and role are required' }
      });
    }

    const validStaffRoles = ['admin', 'recruiter', 'mentor'];
    if (!validStaffRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ROLE', message: 'Role must be admin, recruiter, or mentor' }
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await userRepo.findByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'An account with this email already exists' }
      });
    }

    const tempPassword = password || crypto.randomBytes(8).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Staff created by super_admin: email_verified=false (they get a verification email), admin_verified=true (already approved)
    const { v4: uuidv4 } = require('uuid');
    const id = uuidv4();
    const res2 = await query(
      `INSERT INTO users (id, name, email, password_hash, role, email_verified, verification_token, admin_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, email, role, email_verified, admin_verified, created_at`,
      [id, name.trim(), cleanEmail, passwordHash, role, false, verificationToken, true]
    );
    const newStaff = res2.rows[0];

    // Send verification email
    const { sendVerificationEmail } = require('../services/email.service');
    sendVerificationEmail({ ...newStaff, name: name.trim() }, verificationToken).catch(err => {
      console.warn('[SuperAdmin] Verification email error:', err.message);
    });

    res.status(201).json({
      success: true,
      message: `Staff account created for ${name}. Verification email sent to ${cleanEmail}.`,
      data: newStaff,
      tempPassword: process.env.NODE_ENV !== 'production' ? tempPassword : undefined,
    });
  } catch (err) {
    console.error('[SuperAdmin CreateStaff Error]:', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

module.exports = router;
