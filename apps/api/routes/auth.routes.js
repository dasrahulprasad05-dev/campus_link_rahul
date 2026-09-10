/* CAMPUSLINK — Auth Routes */
const router = require('express').Router();
const { generateToken } = require('../middleware/auth');

// In-memory user store (demo — replace with PostgreSQL in production)
const users = new Map();

// Seed demo users
const bcrypt = { hashSync: (p) => p, compareSync: (a, b) => a === b }; // Simplified for demo
try { const bc = require('bcryptjs'); bcrypt.hashSync = bc.hashSync; bcrypt.compareSync = bc.compareSync; } catch (e) { /* bcryptjs optional for quick start */ }

[
  { id: 'u-1', name: 'Ananya Sharma', email: 'student@campuslink.in', password: 'demo123', role: 'student' },
  { id: 'u-2', name: 'Dr. Rajesh Nayak', email: 'admin@campuslink.in', password: 'demo123', role: 'admin' },
  { id: 'u-3', name: 'Sneha Patel', email: 'recruiter@campuslink.in', password: 'demo123', role: 'recruiter' },
  { id: 'u-4', name: 'Prof. Suresh Mishra', email: 'mentor@campuslink.in', password: 'demo123', role: 'mentor' },
].forEach(u => { users.set(u.email, { ...u, password: bcrypt.hashSync(u.password, 10) }); });

// POST /api/v1/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION', message: 'Name, email, and password are required' } });
  }
  if (users.has(email)) {
    return res.status(409).json({ success: false, error: { code: 'EXISTS', message: 'Account already exists' } });
  }
  const user = { id: 'u-' + Date.now(), name, email, role: role || 'student', password: bcrypt.hashSync(password, 10) };
  users.set(email, user);
  const { password: _, ...safe } = user;
  const token = generateToken(safe);
  res.status(201).json({ success: true, user: safe, token });
});

// POST /api/v1/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION', message: 'Email and password are required' } });
  }
  const user = users.get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ success: false, error: { code: 'INVALID', message: 'Invalid email or password' } });
  }
  const { password: _, ...safe } = user;
  const token = generateToken(safe);
  res.json({ success: true, user: safe, token });
});

// GET /api/v1/auth/me
router.get('/me', (req, res) => {
  const { authenticate } = require('../middleware/auth');
  authenticate(req, res, () => {
    res.json({ success: true, user: req.user });
  });
});

module.exports = router;
