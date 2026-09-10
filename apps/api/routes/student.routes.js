/* CAMPUSLINK — Student Routes */
const router = require('express').Router();
const demoData = require('../data/demo-data');

// GET /api/v1/students — list students (admin/mentor)
router.get('/', (req, res) => {
  res.json({ success: true, data: demoData.admin.students, meta: { total: demoData.admin.students.length } });
});

// GET /api/v1/students/:id/readiness
router.get('/:id/readiness', (req, res) => {
  res.json({ success: true, data: demoData.student.readiness });
});

// GET /api/v1/students/:id/profile
router.get('/:id/profile', (req, res) => {
  res.json({ success: true, data: demoData.student.profile });
});

// GET /api/v1/students/:id/applications
router.get('/:id/applications', (req, res) => {
  res.json({ success: true, data: demoData.student.applications });
});

// GET /api/v1/students/:id/roadmap
router.get('/:id/roadmap', (req, res) => {
  res.json({ success: true, data: demoData.student.roadmap });
});

module.exports = router;
