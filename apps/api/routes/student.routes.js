/* ============================================================
   CAMPUSGRID — Student Routes
   Protected endpoints for student profiles, readiness, and applications.
   All data comes from the database — no demo data fallbacks.
   ============================================================ */

const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const studentRepo = require('../repositories/student.repository');
const appRepo = require('../repositories/application.repository');
const notifService = require('../services/notification.service');
const { query } = require('../db/pool');

// GET /api/v1/students — list students (Admin / Mentor / Recruiter with role protection)
router.get('/', authenticate, authorize('admin', 'mentor', 'recruiter'), async (req, res) => {
  try {
    const result = await studentRepo.listStudents({
      search: req.query.search,
      branch: req.query.branch,
      page: req.query.page,
      limit: req.query.limit,
    });
    const students = result.students || [];
    const isRecruiter = req.user.role === 'recruiter';

    const formatted = students.map(s => {
      const skills = Array.isArray(s.skills) ? s.skills : (typeof s.skills === 'string' && s.skills ? s.skills.split(',').map(x=>x.trim()).filter(Boolean) : []);
      const cgpa = s.cgpa ? parseFloat(s.cgpa) : null;
      
      let readiness = Number(s.readiness || s.readiness_score) || 0;
      if (readiness === 0 && (skills.length > 0 || cgpa)) {
        const skillsPts = Math.min(50, skills.length * 10);
        const academicPts = cgpa ? Math.min(30, Math.round((cgpa / 10) * 30)) : 0;
        const profilePts = 20;
        readiness = Math.min(100, skillsPts + academicPts + profilePts);
      }

      const status = readiness === 0 ? 'pending' : (readiness < 60 ? 'at-risk' : readiness < 75 ? 'needs-support' : 'active');

      return {
        id: s.id,
        name: isRecruiter ? (s.name ? s.name.split(' ')[0] + ' ' + (s.name.split(' ')[1] ? s.name.split(' ')[1][0] + '.' : '') : 'Candidate') : (s.name || 'Student'),
        email: isRecruiter ? undefined : (s.email || ''),
        branch: s.branch || '',
        cgpa: cgpa,
        readiness: readiness,
        target_role: s.target_role || '',
        skills: skills,
        phone: isRecruiter ? undefined : (s.phone || ''),
        linkedin: isRecruiter ? undefined : (s.linkedin || ''),
        github: isRecruiter ? undefined : (s.github || ''),
        year: s.year || 2026,
        reg_no: isRecruiter ? undefined : (s.reg_no || ''),
        applications: 0,
        status: status,
      };
    });

    res.json({
      success: true,
      data: formatted,
      meta: { total: result.pagination.total, pagination: result.pagination }
    });
  } catch (err) {
    console.error('[Students List Error]:', err);
    res.json({
      success: true,
      data: [],
      meta: { total: 0, error: err.message }
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
    if (!profile) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Profile not found' } });
    }
    res.json({ success: true, data: profile });
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
  try {
    const targetUserId = req.params.id === 'me' ? req.user.id : req.params.id;
    const profile = await studentRepo.getProfileByUserId(targetUserId);
    
    if (!profile) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Profile not found' } });
    }

    // Load role-specific weight config
    const configResult = await query(
      'SELECT * FROM readiness_configs WHERE role_name = $1',
      [profile.target_role || 'Software Engineer']
    );
    const weights = configResult.rows[0]?.weights || { technical: 0.25, projects: 0.15, academics: 0.15, aptitude: 0.15, certifications: 0.10, communication: 0.10, interview: 0.10 };

    // Compute 7 readiness factors from real profile data
    const skillCount = Array.isArray(profile.skills) ? profile.skills.length : 0;
    const certCount = Array.isArray(profile.certifications) ? profile.certifications.length : 0;
    const cgpa = parseFloat(profile.cgpa) || 0;
    const projectCount = profile.projects_count || 0;

    const factors = [
      { label: 'Technical Skills', value: Math.min(100, skillCount * 12), weight: weights.technical },
      { label: 'Projects & Portfolio', value: Math.min(100, projectCount * 25), weight: weights.projects },
      { label: 'Academics (CGPA)', value: Math.min(100, Math.round((cgpa / 10) * 100)), weight: weights.academics },
      { label: 'Aptitude & Reasoning', value: profile.aptitude_score || 0, weight: weights.aptitude },
      { label: 'Certifications', value: Math.min(100, certCount * 35), weight: weights.certifications },
      { label: 'Communication', value: profile.communication_score || 0, weight: weights.communication },
      { label: 'Interview Performance', value: profile.interview_score || 0, weight: weights.interview },
    ];

    // Weighted score
    const score = Math.round(factors.reduce((sum, f) => sum + (f.value * f.weight), 0));

    // Status band
    let statusBand;
    if (score >= 80) statusBand = { label: 'Highly Employable', color: 'success', emoji: '🟢' };
    else if (score >= 60) statusBand = { label: 'Ready', color: 'accent', emoji: '🔵' };
    else if (score >= 40) statusBand = { label: 'Developing', color: 'warning', emoji: '🟡' };
    else statusBand = { label: 'Not Ready', color: 'danger', emoji: '🔴' };

    // Recommendations from lowest-scoring factors
    const sortedFactors = [...factors].sort((a, b) => a.value - b.value);
    const recommendations = sortedFactors.slice(0, 3).map(f => ({
      area: f.label,
      score: f.value,
      action: f.value < 40 ? `Urgently improve ${f.label} — currently at ${f.value}%` : `Continue building ${f.label} (currently ${f.value}%)`,
      priority: f.value < 40 ? 'high' : f.value < 60 ? 'medium' : 'low',
    }));

    res.json({
      success: true,
      data: {
        score,
        statusBand,
        factors: factors.map(f => ({ label: f.label, value: f.value })),
        weights,
        targetRole: profile.target_role || 'Software Engineer',
        recommendations,
        updated_at: new Date().toISOString(),
      }
    });
  } catch (err) {
    console.error('[Readiness Error]:', err);
    res.status(500).json({ success: false, error: { code: 'READINESS_ERROR', message: err.message } });
  }
});

// GET /api/v1/students/:id/applications
router.get('/:id/applications', authenticate, async (req, res) => {
  try {
    const targetId = req.params.id === 'me' ? req.user.id : req.params.id;
    const apps = await appRepo.listByStudent(targetId);
    res.json({ success: true, data: apps || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// GET /api/v1/students/:id/roadmap
router.get('/:id/roadmap', authenticate, async (req, res) => {
  try {
    const result = await query('SELECT * FROM roadmap_milestones WHERE student_id = $1', [req.params.id === 'me' ? req.user.id : req.params.id]);
    res.json({ success: true, data: result.rows || [] });
  } catch (err) {
    res.json({ success: true, data: [] });
  }
});

// ─── Mentor Intervention Engine (Database-backed) ──────────────────

// GET /api/v1/students/:id/interventions — list interventions
router.get('/:id/interventions', authenticate, async (req, res) => {
  try {
    const studentId = req.params.id;
    let sql, params;
    if (studentId === 'all') {
      sql = 'SELECT * FROM interventions ORDER BY created_at DESC';
      params = [];
    } else {
      sql = 'SELECT * FROM interventions WHERE student_id = $1 ORDER BY created_at DESC';
      params = [studentId];
    }
    const result = await query(sql, params);
    res.json({ success: true, data: result.rows || [] });
  } catch (err) {
    console.error('[Interventions List Error]:', err);
    res.json({ success: true, data: [] });
  }
});

// POST /api/v1/students/:id/interventions — create intervention
router.post('/:id/interventions', authenticate, authorize('admin', 'mentor'), async (req, res) => {
  try {
    const studentId = req.params.id;
    const { title, type, priority, notes } = req.body;
    if (!title) return res.status(400).json({ success: false, error: { message: 'Title is required' } });

    const result = await query(
      `INSERT INTO interventions (student_id, mentor_id, mentor_name, title, type, priority, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
       RETURNING *`,
      [
        studentId,
        req.user.id,
        req.user.name || 'Faculty Mentor',
        title,
        type || 'coaching',
        priority || 'high',
        notes || '',
      ]
    );
    const newInt = result.rows[0];

    // Dispatch real-time notice to student
    notifService.createNotification({
      userId: studentId,
      type: 'mentor_feedback',
      title: `📝 Mentor Guidance: ${title}`,
      message: `${req.user.name || 'Your mentor'} created an intervention for you: "${notes || title}". Priority: ${priority || 'high'}.`,
      metadata: { interventionId: newInt?.id, mentorName: req.user.name },
    }).catch(err => console.warn('[Notif] Mentor notification error:', err.message));

    res.status(201).json({ success: true, data: newInt });
  } catch (err) {
    console.error('[Intervention Create Error]:', err);
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// PATCH /api/v1/students/:id/interventions/:intId — update status
router.patch('/:id/interventions/:intId', authenticate, authorize('admin', 'mentor'), async (req, res) => {
  try {
    const result = await query(
      `UPDATE interventions
       SET status = COALESCE($1, status),
           notes = COALESCE($2, notes),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [req.body.status, req.body.notes, req.params.intId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { message: 'Intervention not found' } });
    }
    const item = result.rows[0];

    // Dispatch notice on update
    notifService.createNotification({
      userId: req.params.id,
      type: 'mentor_feedback',
      title: `✅ Mentor Update: ${item.title}`,
      message: `${req.user.name || 'Your mentor'} marked your action item as "${item.status}": "${item.notes || ''}"`,
      metadata: { interventionId: item.id },
    }).catch(err => console.warn('[Notif] Mentor update notice error:', err.message));

    res.json({ success: true, data: item });
  } catch (err) {
    console.error('[Intervention Update Error]:', err);
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

module.exports = router;
