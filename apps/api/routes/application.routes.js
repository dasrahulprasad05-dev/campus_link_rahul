/* ============================================================
   CAMPUSGRID — Application Routes
   Track and update student job applications with RBAC.
   All data comes from the database — no demo data fallbacks.
   ============================================================ */

const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const appRepo = require('../repositories/application.repository');
const notifService = require('../services/notification.service');
const { logAudit } = require('../middleware/audit');

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
      data: apps || [],
      meta: { total: (apps || []).length }
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

    // Audit log
    logAudit({ userId: req.user.id, userRole: req.user.role, action: 'application.create', entityType: 'application', entityId: app?.id, newValue: { job_id: targetJobId, status: 'applied' } });

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

    // Audit log
    logAudit({ userId: req.user.id, userRole: req.user.role, action: 'application.status_change', entityType: 'application', entityId: req.params.id, oldValue: { status: 'previous' }, newValue: { status, round: targetRound } });

    // Real-time notification to candidate
    const studentTargetId = updated.user_id || updated.student_id;
    if (studentTargetId) {
      notifService.createNotification({
        userId: studentTargetId,
        type: status === 'shortlisted' ? 'shortlisted' : 'application_status_change',
        title: status === 'shortlisted' 
          ? `🎉 Shortlisted: ${updated.company || 'Recruiter'}` 
          : `Application Update: ${updated.job_title || 'Position'}`,
        message: `Your application at ${updated.company || 'the company'} for ${updated.job_title || 'role'} is now at "${targetRound || status}".`,
        metadata: { applicationId: updated.id, status, round: targetRound, company: updated.company },
      }).catch(err => console.warn('[Notif] Application update notice error:', err.message));
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

const hiringStageService = require('../services/hiring-stage.service');

// GET /api/v1/applications/:id/stages — Get multi-round hiring pipeline progress
router.get('/:id/stages', authenticate, async (req, res) => {
  try {
    const app = await appRepo.getById(req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Application not found' } });
    }

    const stages = await hiringStageService.getApplicationStageProgress(
      app.id,
      app.job_id || 'default-job',
      app.company_id || 'default-company',
      app.user_id || app.student_id
    );

    res.json({
      success: true,
      data: {
        application: {
          id: app.id,
          company: app.company,
          job_title: app.job_title,
          status: app.status,
          current_round: app.current_round,
        },
        stages,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// PATCH /api/v1/applications/:id/stages/:stageOrder — Update candidate round status & feedback (Recruiter / Admin)
router.patch('/:id/stages/:stageOrder', authenticate, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const app = await appRepo.getById(req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Application not found' } });
    }

    const updatedStage = await hiringStageService.updateStageProgress(
      app.id,
      req.params.stageOrder,
      req.body,
      app.user_id || app.student_id,
      app.company
    );

    // If passed or status changed, sync current_round on application
    if (req.body.status === 'passed') {
      const nextRoundNum = parseInt(req.params.stageOrder, 10) + 1;
      const nextRoundName = nextRoundNum <= 4 ? `Round ${nextRoundNum}` : 'Offer Stage';
      await appRepo.updateStatus(app.id, nextRoundNum > 4 ? 'offered' : 'interview', nextRoundName);
    } else if (req.body.status === 'failed') {
      await appRepo.updateStatus(app.id, 'rejected', `Eliminated in Round ${req.params.stageOrder}`);
    }

    res.json({ success: true, data: updatedStage });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

module.exports = router;
