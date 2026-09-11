/* ============================================================
   CAMPUSLINK — Student Routes
   Protected endpoints for student profiles, readiness, and applications.
   ============================================================ */

const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const studentRepo = require('../repositories/student.repository');
const appRepo = require('../repositories/application.repository');
const demoData = require('../data/demo-data');

// GET /api/v1/students — list students (Strictly Admin / Mentor only)
router.get('/', authenticate, authorize('admin', 'mentor'), async (req, res) => {
  try {
    const students = await studentRepo.listStudents();
    const realStudents = (students || []).map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      branch: s.branch || 'CSE',
      cgpa: s.cgpa ? parseFloat(s.cgpa) : 8.0,
      readiness: s.readiness ? parseInt(s.readiness) : 75,
      applications: 0,
      status: 'active',
      isReal: true,
    }));

    // Put real registered students at top, followed by sample batch
    const realEmails = new Set(realStudents.map(s => (s.email || '').toLowerCase()));
    const demoUnique = (demoData.admin.students || []).filter(d => !realEmails.has((d.email || '').toLowerCase()) && !realEmails.has((d.name || '').toLowerCase()));
    const combined = [...realStudents, ...demoUnique];

    res.json({
      success: true,
      data: combined,
      meta: { total: combined.length, realCount: realStudents.length }
    });
  } catch (err) {
    console.error('[Students List Error]:', err);
    res.json({
      success: true,
      data: demoData.admin.students,
      meta: { total: demoData.admin.students.length, fallback: true }
    });
  }
});

// GET /api/v1/students/profile or /api/v1/students/:id/profile
router.get('/:id/profile', authenticate, async (req, res) => {
  try {
    const targetUserId = req.params.id === 'me' ? req.user.id : req.params.id;

    // Students can only view their own profile; admins and mentors can view any
    if (req.user.role === 'student' && targetUserId !== req.user.id && req.params.id !== 'me') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Cannot view another student profile' } });
    }

    const profile = await studentRepo.getProfileByUserId(targetUserId);
    res.json({ success: true, data: profile || demoData.student.profile });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// PUT /api/v1/students/profile — update profile
router.put('/profile', authenticate, authorize('student', 'admin'), async (req, res) => {
  try {
    const updated = await studentRepo.updateProfile(req.user.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// GET /api/v1/students/:id/readiness
router.get('/:id/readiness', authenticate, async (req, res) => {
  const profile = await studentRepo.getProfileByUserId(req.params.id === 'me' ? req.user.id : req.params.id);
  const score = profile?.readiness_score || demoData.student.readiness.score;
  res.json({
    success: true,
    data: {
      score,
      factors: demoData.student.readiness.factors,
      updated_at: new Date().toISOString()
    }
  });
});

// GET /api/v1/students/:id/applications
router.get('/:id/applications', authenticate, async (req, res) => {
  const targetId = req.params.id === 'me' ? req.user.id : req.params.id;
  const apps = await appRepo.listByStudent(targetId);
  res.json({ success: true, data: apps.length ? apps : demoData.student.applications });
});

// GET /api/v1/students/:id/roadmap
router.get('/:id/roadmap', authenticate, (req, res) => {
  res.json({ success: true, data: demoData.student.roadmap });
});

module.exports = router;
