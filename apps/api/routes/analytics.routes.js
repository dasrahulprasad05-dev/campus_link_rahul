/* ============================================================
   CAMPUSLINK — Analytics Routes
   Institution placement analytics protected by RBAC.
   ============================================================ */

const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const demoData = require('../data/demo-data');

// Protect all analytics endpoints for Admin and Mentor access only
router.use(authenticate, authorize('admin', 'mentor'));

// GET /api/v1/analytics/kpis
router.get('/kpis', (req, res) => {
  res.json({ success: true, data: demoData.admin.kpis });
});

// GET /api/v1/analytics/funnel
router.get('/funnel', (req, res) => {
  res.json({ success: true, data: demoData.admin.funnel });
});

// GET /api/v1/analytics/readiness-distribution
router.get('/readiness-distribution', (req, res) => {
  res.json({
    success: true,
    data: [
      { range: '90-100', count: 42 },
      { range: '70-89', count: 128 },
      { range: '50-69', count: 286 },
      { range: '30-49', count: 248 },
      { range: '0-29', count: 138 },
    ]
  });
});

// GET /api/v1/analytics/branch-placement
router.get('/branch-placement', (req, res) => {
  res.json({
    success: true,
    data: [
      { branch: 'CSE', rate: 74 },
      { branch: 'IT', rate: 68 },
      { branch: 'ETC', rate: 55 },
      { branch: 'ME', rate: 48 },
      { branch: 'CE', rate: 42 },
    ]
  });
});

// GET /api/v1/analytics/risk
router.get('/risk', (req, res) => {
  res.json({ success: true, data: demoData.admin.risk });
});

module.exports = router;
