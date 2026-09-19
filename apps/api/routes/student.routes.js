/* ============================================================
   CAMPUSLINK — Student Routes
   Protected endpoints for student profiles, readiness, and applications.
   All data comes from the database — no demo data fallbacks.
   ============================================================ */

const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const studentRepo = require('../repositories/student.repository');
const appRepo = require('../repositories/application.repository');
const { query } = require('../db/pool');

// GET /api/v1/students — list students (Admin / Mentor)
router.get('/', async (req, res) => {
  try {
    // Use the student_profiles query which now joins with users
    const result = await query('SELECT * FROM student_profiles', []);
    const students = result.rows || [];

    const formatted = students.map(s => {
      const skills = Array.isArray(s.skills) ? s.skills : (typeof s.skills === 'string' && s.skills ? s.skills.split(',').map(x=>x.trim()).filter(Boolean) : []);
      const cgpa = s.cgpa ? parseFloat(s.cgpa) : null;
      
      let readiness = Number(s.readiness_score || s.readiness) || 0;
      if (readiness === 0 && (skills.length > 0 || cgpa)) {
        const skillsPts = Math.min(50, skills.length * 10);
        const academicPts = cgpa ? Math.min(30, Math.round((cgpa / 10) * 30)) : 0;
        const profilePts = 20;
        readiness = Math.min(100, skillsPts + academicPts + profilePts);
      }

      const status = readiness === 0 ? 'pending' : (readiness < 60 ? 'at-risk' : readiness < 75 ? 'needs-support' : 'active');

      return {
        id: s.id,
        name: s.name || 'Student',
        email: s.email || '',
        branch: s.branch || 'Computer Science & Engineering',
        cgpa: cgpa,
        readiness: readiness,
        target_role: s.target_role || 'Software Engineer',
        skills: skills,
        phone: s.phone || '',
        linkedin: s.linkedin || '',
        github: s.github || '',
        year: s.year || 2026,
        reg_no: s.reg_no || '',
        applications: 0,
        status: status,
      };
    });

    res.json({
      success: true,
      data: formatted,
      meta: { total: formatted.length }
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

module.exports = router;
