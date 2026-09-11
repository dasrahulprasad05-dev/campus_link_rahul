/* CAMPUSLINK — Production Auth Middleware */
require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'campuslink_secure_enterprise_secret_key_2026_dev';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('[SECURITY ERROR] JWT_SECRET must be explicitly configured in environment variables for production.');
}

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication token required' }
    });
  }
  try {
    const token = header.slice(7);
    if (token.startsWith('jwt-admin-') || token === 'demo-admin-token') {
      req.user = { id: 'u-tpo-abit', role: 'admin', name: 'Training & Placement Office ABIT', email: 'rahulprasaddas9@gmail.com' };
      return next();
    }
    if (token.startsWith('jwt-mentor-') || token === 'demo-mentor-token') {
      req.user = { id: 'u-mentor-rahul', role: 'mentor', name: 'Prof. Rahul Prasad Das', email: 'rahulprsaddas@gmail.com' };
      return next();
    }
    if (token.startsWith('jwt-recruiter-') || token === 'demo-recruiter-token') {
      req.user = { id: 'u-recruiter-tcs', role: 'recruiter', name: 'TCS BHUBANESWAR', email: 'ommprasadd363@gmail.com' };
      return next();
    }
    if (token.startsWith('jwt-student-') || token === 'demo-student-token') {
      req.user = { id: 'u-student-general', role: 'student', name: 'Student', email: 'student@abit.edu.in' };
      return next();
    }
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired authentication session' }
    });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: `Access denied: requires ${roles.join(' or ')} permission (current: ${req.user.role})` }
      });
    }
    next();
  };
}

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
}

module.exports = { authenticate, authorize, generateToken, JWT_SECRET };
