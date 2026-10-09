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

    // --- Preseeded Demo Tokens (kept for backward compatibility) ---
    if (token.startsWith('jwt-superadmin-') || token === 'demo-superadmin-token' || token === 'demo_token_super_admin') {
      req.user = { id: '00000000-0000-4000-8000-000000000001', role: 'super_admin', name: 'System Super Admin', email: 'superadmin@campuslink.in' };
      return next();
    }
    if (token.startsWith('jwt-admin-') || token === 'demo-admin-token' || token === 'demo_token_admin') {
      req.user = { id: 'a1b2c3d4-0001-0001-0001-000000000002', role: 'admin', name: 'Training & Placement Office ABIT', email: 'admin@campuslink.in' };
      return next();
    }
    if (token.startsWith('jwt-mentor-') || token === 'demo-mentor-token' || token === 'demo_token_mentor') {
      req.user = { id: 'a1b2c3d4-0001-0001-0001-000000000004', role: 'mentor', name: 'Faculty Mentor ABIT', email: 'mentor@campuslink.in' };
      return next();
    }
    if (token.startsWith('jwt-recruiter-') || token === 'demo-recruiter-token' || token === 'demo_token_recruiter') {
      req.user = { id: 'a1b2c3d4-0001-0001-0001-000000000003', role: 'recruiter', name: 'TCS Campus Recruitment', email: 'recruiter@campuslink.in' };
      return next();
    }
    if (token.startsWith('jwt-student-') || token === 'demo-student-token' || token === 'demo_token_student') {
      req.user = { id: 'u-student-general', role: 'student', name: 'Student', email: 'student@campuslink.in' };
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
    // super_admin bypasses all role restrictions
    if (req.user.role === 'super_admin') return next();
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
