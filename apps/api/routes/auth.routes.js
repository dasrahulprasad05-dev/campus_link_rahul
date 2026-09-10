/* ============================================================
   CAMPUSLINK — Production Authentication Routes
   Database-backed user registration, login, and session validation.
   ============================================================ */

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { generateToken, authenticate } = require('../middleware/auth');
const userRepo = require('../repositories/user.repository');
const studentRepo = require('../repositories/student.repository');

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name, email, and password are required' }
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 6 characters' }
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

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role && ['student', 'admin', 'recruiter', 'mentor'].includes(role) ? role : 'student';

    const newUser = await userRepo.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: assignedRole,
    });

    // If user is a student, automatically initialize their student profile record
    if (assignedRole === 'student') {
      await studentRepo.createProfile({
        user_id: newUser.id,
        branch: 'Computer Science & Engineering',
        year: 2026,
        target_role: 'Software Engineer',
      }).catch(err => console.warn('[Auth] Auto-profile creation note:', err.message));
    }

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    const token = generateToken(safeUser);
    res.status(201).json({ success: true, user: safeUser, token });
  } catch (err) {
    console.error('[Auth Register Error]:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create account. Please try again.' }
    });
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' }
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await userRepo.findByEmail(cleanEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
    }

    const match = await bcrypt.compare(password, user.password_hash || user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = generateToken(safeUser);
    res.json({ success: true, user: safeUser, token });
  } catch (err) {
    console.error('[Auth Login Error]:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Login failed due to server error' }
    });
  }
});

// GET /api/v1/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await userRepo.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

module.exports = router;
