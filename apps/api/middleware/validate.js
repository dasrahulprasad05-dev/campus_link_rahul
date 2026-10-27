/* ============================================================
   CAMPUSGRID — Input Validation Middleware
   Centralized validation rules for all API endpoints using
   express-validator. Prevents malformed data from reaching DB.
   ============================================================ */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware that checks for validation errors and returns 400 if found.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: errors.array().map(e => e.msg).join('; '),
        details: errors.array(),
      },
    });
  }
  next();
}

/* ---------- Auth Validations ---------- */
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }).withMessage('Name must be under 120 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['student', 'admin', 'recruiter', 'mentor']).withMessage('Invalid role'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

/* ---------- Job Validations ---------- */
const createJobRules = [
  body('title').trim().notEmpty().withMessage('Job title is required').isLength({ max: 200 }).withMessage('Title must be under 200 characters'),
  body('company').optional().trim().isLength({ max: 150 }),
  body('location').optional().trim().isLength({ max: 100 }),
  body('type').optional().isIn(['Full-time', 'Internship', 'Part-time', 'Contract']).withMessage('Invalid job type'),
  body('min_cgpa').optional().isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0 and 10'),
  body('deadline').optional().isISO8601().withMessage('Deadline must be a valid date'),
];

/* ---------- Application Validations ---------- */
const createApplicationRules = [
  body('jobId').optional().isUUID().withMessage('Job ID must be a valid UUID'),
  body('job_id').optional().isUUID().withMessage('Job ID must be a valid UUID'),
];

/* ---------- Drive Validations ---------- */
const createDriveRules = [
  body('role').trim().notEmpty().withMessage('Drive role/position is required'),
  body('company').optional().trim().isLength({ max: 150 }),
  body('venue').optional().trim().isLength({ max: 200 }),
  body('min_cgpa').optional().isFloat({ min: 0, max: 10 }),
  body('drive_date').optional().isISO8601().withMessage('Drive date must be a valid date'),
];

/* ---------- Intervention Validations ---------- */
const createInterventionRules = [
  body('title').trim().notEmpty().withMessage('Intervention title is required').isLength({ max: 255 }),
  body('type').optional().isIn(['coaching', 'meeting', 'assignment', 'mock-interview', 'mentor_review']).withMessage('Invalid intervention type'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
  body('notes').optional().trim().isLength({ max: 2000 }),
];

/* ---------- Offer Validations ---------- */
const createOfferRules = [
  body('role').trim().notEmpty().withMessage('Offer role is required'),
  body('ctc_lpa').optional().isFloat({ min: 0 }).withMessage('CTC must be a positive number'),
  body('status').optional().isIn(['pending', 'accepted', 'declined', 'revoked']).withMessage('Invalid offer status'),
];

/* ---------- Pagination Query Validation ---------- */
const paginationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
  query('search').optional().trim().isLength({ max: 200 }),
];

/* ---------- UUID Param Validation ---------- */
const uuidParam = (paramName = 'id') => [
  param(paramName).isUUID().withMessage(`${paramName} must be a valid UUID`),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  createJobRules,
  createApplicationRules,
  createDriveRules,
  createInterventionRules,
  createOfferRules,
  paginationRules,
  uuidParam,
};
