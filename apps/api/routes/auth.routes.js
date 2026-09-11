/* ============================================================
   CAMPUSLINK — Production Authentication Routes
   Database-backed user registration, login, and session validation.
   ============================================================ */

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { generateToken, authenticate } = require('../middleware/auth');
const userRepo = require('../repositories/user.repository');
const studentRepo = require('../repositories/student.repository');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../services/email.service');

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

    // Strict Role Protection: Staff/Recruiter/TPO emails cannot be registered as student accounts
    const RESERVED_STAFF_EMAILS = [
      'rahulprasaddas9@gmail.com',
      'ommprasadd363@gmail.com',
      'rahulprsaddas@gmail.com'
    ];
    if (RESERVED_STAFF_EMAILS.includes(cleanEmail)) {
      return res.status(403).json({
        success: false,
        error: { code: 'RESERVED_EMAIL', message: 'This email is reserved for institutional/recruiter access and cannot be registered as a student account.' }
      });
    }

    const existing = await userRepo.findByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'An account with this email already exists' }
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    // Architecture Freeze Rule 4: Public registration strictly creates STUDENT accounts only.
    // Any role parameter in request body is intentionally ignored to prevent privilege escalation.
    const assignedRole = 'student';
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = await userRepo.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: assignedRole,
      verificationToken,
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

    // Trigger verification email in background (non-blocking)
    sendVerificationEmail(newUser, verificationToken).catch(err => {
      console.warn('[Auth] Verification email dispatch note:', err.message);
    });

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      email_verified: false,
    };

    // Do not issue auth token until email is verified!
    res.status(201).json({
      success: true,
      user: safeUser,
      requiresVerification: true,
      message: 'Account created! Please check your email inbox and spam folder and click the verification link before logging in.'
    });
  } catch (err) {
    console.error('[Auth Register Error]:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create account. Please try again.' }
    });
  }
});

// GET /api/v1/auth/verify-email?token=...
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_TOKEN', message: 'Verification token is required' }
      });
    }

    const user = await userRepo.findByVerificationToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Verification link is invalid or has already been used' }
      });
    }

    const verifiedUser = await userRepo.markEmailVerified(user.id);

    // Send Welcome Email upon successful email verification!
    sendWelcomeEmail(user).catch(err => {
      console.warn('[Auth] Welcome email dispatch note:', err.message);
    });

    res.json({
      success: true,
      message: 'Email successfully verified! Your account is active. A welcome email has been sent.',
      user: verifiedUser,
    });
  } catch (err) {
    console.error('[Auth Verify Email Error]:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Verification failed. Please try again.' }
    });
  }
});

// POST /api/v1/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email is required' }
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await userRepo.findByEmail(cleanEmail);

    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, a verification link has been sent. Please check your spam folder.'
      });
    }

    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_VERIFIED', message: 'This account email is already verified. You can log in.' }
      });
    }

    const newToken = crypto.randomBytes(32).toString('hex');
    await userRepo.setVerificationToken(user.id, newToken);
    await sendVerificationEmail(user, newToken);

    res.json({
      success: true,
      message: 'A new verification email has been sent. Please check your inbox and spam folder.'
    });
  } catch (err) {
    console.error('[Auth Resend Verification Error]:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to resend verification email' }
    });
  }
});

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email address is required' }
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await userRepo.findByEmail(cleanEmail);

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiration
      await userRepo.setResetPasswordToken(cleanEmail, resetToken, expiresAt);
      sendPasswordResetEmail(user, resetToken).catch(err => {
        console.warn('[Auth] Reset email dispatch note:', err.message);
      });
    }

    // Always respond with success to prevent email enumeration attacks
    res.json({
      success: true,
      message: 'If your email is registered with CAMPUSLINK, you will receive password reset instructions. Please check your inbox and spam folder.'
    });
  } catch (err) {
    console.error('[Auth Forgot Password Error]:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to process password reset request' }
    });
  }
});

// POST /api/v1/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Reset token and new password are required' }
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 6 characters' }
      });
    }

    const user = await userRepo.findByResetToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_OR_EXPIRED_TOKEN', message: 'Password reset link is invalid or has expired. Please request a new one.' }
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await userRepo.updatePassword(user.id, newHash);

    res.json({
      success: true,
      message: 'Your password has been successfully reset! You can now log in with your new password.'
    });
  } catch (err) {
    console.error('[Auth Reset Password Error]:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to reset password' }
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

    // Architecture & User Rule: Students must click email verification before logging in
    if (user.role === 'student' && !user.email_verified) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Your email address is not verified yet. Please check your inbox (and spam folder) and click the verification link to activate your account.',
          email: user.email,
        }
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      email_verified: user.email_verified || false,
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
