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
    } else if (req.user.role === 'admin' || req.user.role === 'recruiter') {
      apps = await appRepo.listAll();
    } else {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Mentors cannot access cross-company application pipelines' }
      });
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
    const targetJobId = req.body.jobId || req.body.job_id;
    if (!targetJobId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Job ID is required to apply' }
      });
    }

    const app = await appRepo.createApplication({
      student_id: req.user.id,
      job_id: targetJobId,
      status: 'applied',
      current_round: 'Resume Screening',
    });

    res.status(201).json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// PATCH /api/v1/applications/:id/status — update round/status (Recruiter / Admin only)
router.patch('/:id/status', authenticate, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const { status, round, current_round } = req.body;
    const targetRound = current_round || round;
    const updated = await appRepo.updateStatus(req.params.id, status, targetRound);
    if (!updated) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Application not found' } });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

module.exports = router;
