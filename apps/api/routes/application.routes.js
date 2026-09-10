/* ============================================================
   CAMPUSLINK — Application Routes
   Track and update student job applications with RBAC.
   ============================================================ */

const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const appRepo = require('../repositories/application.repository');
const demoData = require('../data/demo-data');

// GET /api/v1/applications — list applications (filtered by student or all for admin/recruiter)
router.get('/', authenticate, async (req, res) => {
  try {
    let apps;
    if (req.user.role === 'student') {
      apps = await appRepo.listByStudent(req.user.id);
    } else {
      apps = await appRepo.listAll();
    }
    res.json({
      success: true,
      data: apps.length ? apps : demoData.student.applications,
      meta: { total: apps.length || demoData.student.applications.length }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// POST /api/v1/applications — submit job application (Student only)
router.post('/', authenticate, authorize('student'), async (req, res) => {
  try {
    const { jobId, jobTitle, company } = req.body;
    if (!jobTitle || !company) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Job title and company are required to apply' }
      });
    }

    const app = await appRepo.createApplication({
      student_id: req.user.id,
      job_id: jobId,
      job: jobTitle,
      company: company,
      status: 'applied',
      round: 'Initial Screening',
    });

    res.status(201).json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// PATCH /api/v1/applications/:id/status — update round/status (Recruiter / Admin only)
router.patch('/:id/status', authenticate, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const { status, round } = req.body;
    const updated = await appRepo.updateStatus(req.params.id, status, round);
    if (!updated) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Application not found' } });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

module.exports = router;
