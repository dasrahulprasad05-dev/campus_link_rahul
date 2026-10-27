/* ============================================================
   CAMPUSGRID — Express API Server
   Modular backend with middleware chain, route modules,
   and structured response format.
   ============================================================ */

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Auto-run database migrations when connected to PostgreSQL
const { runMigrations } = require('./db/migrate');
if (process.env.DATABASE_URL) {
  runMigrations().catch(err => console.error('[Startup] Migration note:', err.message));
}

/* ---------- Middleware ---------- */
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://www.campusgrid.online', 'https://campusgrid.online']
  : true; // Allow all origins in development
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    if (!req.url.includes('.')) { // Skip static file logs
      console.log(`${req.method} ${req.url} ${res.statusCode} (${ms}ms)`);
    }
  });
  next();
});

/* ---------- API Routes ---------- */
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const jobRoutes = require('./routes/job.routes');
const applicationRoutes = require('./routes/application.routes');
const companyRoutes = require('./routes/company.routes');
const driveRoutes = require('./routes/drive.routes');
const interviewRoutes = require('./routes/interview.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const schedulerRoutes = require('./routes/scheduler.routes');
const aiRoutes = require('./routes/ai.routes');
const careerFinderRoutes = require('./routes/career-finder.routes');
const offerRoutes = require('./routes/offer.routes');
const superAdminRoutes = require('./routes/superadmin.routes');
const notificationRoutes = require('./routes/notification.routes');
const whatsappRoutes = require('./routes/whatsapp.routes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/drives', driveRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/scheduler', schedulerRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/career-finder', careerFinderRoutes);
app.use('/api/v1/offers', offerRoutes);
app.use('/api/v1/superadmin', superAdminRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/whatsapp', whatsappRoutes);

const { authenticate, authorize } = require('./middleware/auth');
const { query, memoryDb } = require('./db/pool');

// Dashboard endpoint (strictly authenticated; returns role-specific aggregated data from DB)
app.get('/api/v1/dashboard', authenticate, async (req, res) => {
  let role = req.user.role || 'student';
  if (req.user.role === 'admin' && req.query.role) {
    role = req.query.role;
  }

  try {
    if (role === 'student') {
      // Find student profile by user_id
      const profileRes = await query(
        'SELECT * FROM student_profiles WHERE user_id = $1', [req.user.id]
      );
      const profile = profileRes.rows[0];
      const studentProfileId = profile?.id;

      // Applications for this student
      const appsRes = studentProfileId
        ? await query(
            `SELECT a.*, j.title AS job_title, c.name AS company_name
             FROM applications a
             LEFT JOIN jobs j ON a.job_id = j.id
             LEFT JOIN companies c ON j.company_id = c.id
             WHERE a.student_id = $1
             ORDER BY a.applied_at DESC LIMIT 5`, [studentProfileId])
        : { rows: [] };

      // Offers for this student
      const offersRes = studentProfileId
        ? await query('SELECT * FROM offers WHERE student_id = $1', [studentProfileId])
        : { rows: [] };

      // Active jobs count
      const jobsRes = await query(
        "SELECT COUNT(*) AS count FROM jobs WHERE status = 'active'"
      );

      const apps = appsRes.rows;
      const offers = offersRes.rows;
      const activeJobsCount = parseInt(jobsRes.rows[0]?.count || '0', 10);

      const kpis = [
        { label: 'Readiness Score', value: `${profile?.readiness_score || 0}/100`, delta: '', icon: '📊', color: 'blue' },
        { label: 'Applications', value: String(apps.length), delta: `${apps.filter(a => a.status !== 'rejected').length} active`, icon: '📝', color: 'green' },
        { label: 'Offers', value: String(offers.length), delta: offers.filter(o => o.status === 'pending').length ? `${offers.filter(o => o.status === 'pending').length} pending` : '', icon: '🎉', color: 'orange' },
        { label: 'Open Jobs', value: String(activeJobsCount), delta: '', icon: '💼', color: 'purple' },
      ];

      return res.json({
        success: true,
        kpis,
        readiness: { score: profile?.readiness_score || 0 },
        applications: apps.map(a => ({
          id: a.id, job: a.job_title || 'Unknown', company: a.company_name || '', status: a.status, round: a.current_round
        })),
        jobs: [], // Student dashboard loads jobs separately via /jobs endpoint
      });
    }

    if (role === 'admin') {
      const [studentsRes, jobsRes, drivesRes, offersRes] = await Promise.all([
        query('SELECT sp.*, u.name, u.email FROM student_profiles sp LEFT JOIN users u ON sp.user_id = u.id'),
        query('SELECT * FROM jobs'),
        query('SELECT d.*, c.name AS company_name FROM drives d LEFT JOIN companies c ON d.company_id = c.id'),
        query('SELECT * FROM offers'),
      ]);

      const students = studentsRes.rows;
      const jobs = jobsRes.rows;
      const drives = drivesRes.rows;
      const offers = offersRes.rows;
      const acceptedOffers = offers.filter(o => o.status === 'accepted');
      const avgCTC = acceptedOffers.length > 0
        ? (acceptedOffers.reduce((s, o) => s + parseFloat(o.ctc_lpa || 0), 0) / acceptedOffers.length).toFixed(2)
        : 0;

      return res.json({
        success: true,
        kpis: [
          { label: 'Total Students', value: String(students.length), icon: '👨‍🎓', color: 'blue' },
          { label: 'Active Jobs', value: String(jobs.filter(j => j.status === 'active').length), icon: '💼', color: 'green' },
          { label: 'Offers Made', value: String(offers.length), icon: '📋', color: 'orange' },
          { label: 'Placement Rate', value: `${students.length ? ((acceptedOffers.length / students.length) * 100).toFixed(0) : 0}%`, icon: '📊', color: 'purple' },
          { label: 'Avg CTC', value: `₹${avgCTC}L`, icon: '💰', color: 'emerald' },
          { label: 'Upcoming Drives', value: String(drives.filter(d => d.status !== 'completed').length), icon: '🏢', color: 'red' },
        ],
        students: students.slice(0, 10).map(s => ({
          id: s.id, name: s.name || '', branch: s.branch, cgpa: s.cgpa, readiness: s.readiness_score, target_role: s.target_role
        })),
        drives: drives.map(dr => ({
          id: dr.id, company: dr.company_name || '', role: dr.role, date: dr.drive_date, venue: dr.venue, status: dr.status
        })),
      });
    }

    if (role === 'recruiter') {
      // Only show jobs posted by THIS recruiter
      const jobsRes = await query(
        `SELECT j.*, c.name AS company_name FROM jobs j
         LEFT JOIN companies c ON j.company_id = c.id
         WHERE j.recruiter_id = $1
         ORDER BY j.created_at DESC`, [req.user.id]
      );
      const jobs = jobsRes.rows;
      const jobIds = jobs.map(j => j.id);

      // Get applications for this recruiter's jobs
      let apps = [];
      if (jobIds.length > 0) {
        const appsRes = await query(
          `SELECT a.*, j.title AS job_title, u.name AS student_name
           FROM applications a
           LEFT JOIN jobs j ON a.job_id = j.id
           LEFT JOIN student_profiles sp ON a.student_id = sp.id
           LEFT JOIN users u ON sp.user_id = u.id
           WHERE a.job_id = ANY($1)`, [jobIds]
        );
        apps = appsRes.rows;
      }

      return res.json({
        success: true,
        kpis: [
          { label: 'Active Jobs', value: String(jobs.filter(j => j.status === 'active').length), icon: '💼', color: 'blue' },
          { label: 'Total Applications', value: String(apps.length), icon: '📝', color: 'green' },
          { label: 'Shortlisted', value: String(apps.filter(a => a.status === 'shortlisted').length), icon: '✅', color: 'orange' },
          { label: 'Interviewing', value: String(apps.filter(a => a.status === 'interview').length), icon: '🎤', color: 'purple' },
        ],
        jobs: jobs.map(j => {
          const jobApps = apps.filter(a => a.job_id === j.id);
          return { id: j.id, title: j.title, company: j.company_name || '', applicants: jobApps.length, shortlisted: jobApps.filter(a => a.status !== 'applied').length, status: j.status };
        }),
      });
    }

    if (role === 'mentor') {
      // Get mentor assignments for THIS mentor only
      const assignRes = await query(
        `SELECT ma.*, sp.readiness_score, sp.target_role, sp.branch, u.name
         FROM mentor_assignments ma
         LEFT JOIN student_profiles sp ON ma.student_id = sp.id
         LEFT JOIN users u ON sp.user_id = u.id
         WHERE ma.mentor_id = $1`, [req.user.id]
      );
      const mentees = assignRes.rows;
      const atRisk = mentees.filter(s => (s.readiness_score || 0) < 60);

      return res.json({
        success: true,
        kpis: [
          { label: 'Mentees', value: String(mentees.length), icon: '👥', color: 'blue' },
          { label: 'At Risk', value: String(atRisk.length), icon: '⚠️', color: 'red' },
          { label: 'Avg Readiness', value: `${mentees.length ? Math.round(mentees.reduce((s, m) => s + (m.readiness_score || 0), 0) / mentees.length) : 0}`, icon: '📊', color: 'green' },
        ],
        students: mentees.map(s => ({
          id: s.student_id, name: s.name || '', branch: s.branch, readiness: s.readiness_score, target_role: s.target_role, status: (s.readiness_score || 0) < 60 ? 'at-risk' : 'on-track'
        })),
      });
    }

    if (role === 'super_admin') {
      const [usersRes, drivesRes, jobsRes] = await Promise.all([
        query('SELECT id, name, email, role, email_verified, admin_verified, created_at FROM users'),
        query('SELECT * FROM drives'),
        query('SELECT * FROM jobs'),
      ]);

      const users = usersRes.rows;
      const pending = users.filter(u => ['admin', 'recruiter', 'mentor'].includes(u.role) && u.email_verified && !u.admin_verified);
      const approved = users.filter(u => ['admin', 'recruiter', 'mentor'].includes(u.role) && u.admin_verified);
      const students = users.filter(u => u.role === 'student');

      return res.json({
        success: true,
        kpis: [
          { label: 'Pending Approvals', value: String(pending.length), icon: '⏳', color: 'orange' },
          { label: 'Approved Staff', value: String(approved.length), icon: '✅', color: 'green' },
          { label: 'Active Drives', value: String(drivesRes.rows.length), icon: '🏢', color: 'blue' },
          { label: 'Total Students', value: String(students.length), icon: '🎓', color: 'purple' },
        ],
        pending,
        staff: approved,
        drives: drivesRes.rows,
        jobs: jobsRes.rows,
      });
    }

    return res.status(400).json({ success: false, error: { code: 'INVALID_ROLE', message: 'Invalid role' } });
  } catch (err) {
    console.error('[Dashboard Error]:', err);
    res.status(500).json({ success: false, error: { code: 'DASHBOARD_ERROR', message: err.message } });
  }
});

// Direct AI and analysis endpoints (supports both /api/v1/ and /api/)
const { matchResumeToJD } = require('./services/matching.service');
const { analyzeSkillGap } = require('./services/readiness.service');
const { evaluateAnswer } = require('./services/interview.service');
const { checkConflicts } = require('./services/scheduler.service');

async function handleResumeMatch(req, res, next) {
  try {
    const result = await matchResumeToJD(req.body.jobDescription || '');
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    next(err);
  }
}

async function handleSkillGap(req, res, next) {
  try {
    const result = await analyzeSkillGap(req.body.targetRole, req.body.skills);
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    next(err);
  }
}

async function handleInterviewFeedback(req, res, next) {
  try {
    const result = await evaluateAnswer(req.body.answer || '', req.body.question || '');
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    next(err);
  }
}

function handleSchedulerCheck(req, res) {
  const result = checkConflicts(req.body.events || []);
  res.json({ success: true, data: result, ...result });
}

// AI Service proxy helper with URL normalization
function normalizeAiUrl(raw) {
  if (!raw) return 'http://localhost:8000';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return raw.includes('.') ? `https://${raw}` : `http://${raw}:8000`;
}
const AI_SERVICE_URL = normalizeAiUrl(process.env.AI_SERVICE_URL);

async function proxyAI(path, body) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const r = await fetch(`${AI_SERVICE_URL}${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: ctrl.signal,
    });
    clearTimeout(t);
    if (r.ok) return await r.json();
  } catch (_) {}
  return null;
}

// Support both /api/v1/analyze/... and /api/analyze/...
app.post('/api/v1/analyze/resume-match', handleResumeMatch);
app.post('/api/analyze/resume-match', handleResumeMatch);
app.post('/api/v1/interviews/feedback', handleInterviewFeedback);
app.post('/api/interviews/feedback', handleInterviewFeedback);
app.post('/api/v1/scheduler/check', handleSchedulerCheck);
app.post('/api/scheduler/check', handleSchedulerCheck);

// New AI feature endpoints (proxy to Python service with robust local fallbacks)
async function handleAIProxy(aiPath, req, res) {
  const result = await proxyAI(aiPath, req.body);
  if (result) return res.json({ success: true, data: result, ...result });

  // Graceful local fallbacks if Python microservice is offline
  if (aiPath === '/v1/skill-gap') {
    return handleSkillGap(req, res);
  }
  if (aiPath === '/v1/readiness') {
    const { calculateReadiness } = require('./services/readiness.service');
    const localRes = calculateReadiness(req.body);
    return res.json({ success: true, data: localRes, ...localRes });
  }

  res.status(503).json({ success: false, error: { code: 'AI_UNAVAILABLE', message: 'AI service is not running. Start it with: cd apps/ai-service && uvicorn main:app --port 8000' } });
}

app.post('/api/v1/analyze/generate-questions', (req, res) => handleAIProxy('/v1/generate-questions', req, res));
app.post('/api/analyze/generate-questions', (req, res) => handleAIProxy('/v1/generate-questions', req, res));
app.post('/api/v1/analyze/generate-roadmap', (req, res) => handleAIProxy('/v1/generate-roadmap', req, res));
app.post('/api/analyze/generate-roadmap', (req, res) => handleAIProxy('/v1/generate-roadmap', req, res));
app.post('/api/v1/analyze/at-risk', (req, res) => handleAIProxy('/v1/at-risk', req, res));
app.post('/api/analyze/at-risk', (req, res) => handleAIProxy('/v1/at-risk', req, res));
app.post('/api/v1/analyze/policy-qa', (req, res) => handleAIProxy('/v1/policy-qa', req, res));
app.post('/api/analyze/policy-qa', (req, res) => handleAIProxy('/v1/policy-qa', req, res));
app.post('/api/v1/analyze/candidate-match', authenticate, authorize('recruiter', 'admin'), (req, res) => handleAIProxy('/v1/candidate-match', req, res));
app.post('/api/analyze/candidate-match', authenticate, authorize('recruiter', 'admin'), (req, res) => handleAIProxy('/v1/candidate-match', req, res));
app.post('/api/v1/analyze/skill-gap', (req, res) => handleAIProxy('/v1/skill-gap', req, res));
app.post('/api/analyze/skill-gap', (req, res) => handleAIProxy('/v1/skill-gap', req, res));
app.post('/api/v1/analyze/readiness', (req, res) => handleAIProxy('/v1/readiness', req, res));
app.post('/api/analyze/readiness', (req, res) => handleAIProxy('/v1/readiness', req, res));

// Legacy dashboard compatibility route (redirects to authenticated dashboard)
app.get('/api/dashboard', authenticate, (req, res) => {
  res.redirect('/api/v1/dashboard' + (req.query.role ? `?role=${req.query.role}` : ''));
});

/* ---------- Health Check ---------- */
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'campusgrid-api',
    version: '2.0.0',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'campusgrid-api' });
});

/* ---------- Serve Frontend (Static) ---------- */
const webDir = path.join(__dirname, '../web');
app.use(express.static(webDir));

// SPA fallback — serve index.html for non-API routes
app.get('*', (req, res) => {
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
  }
  res.sendFile(path.join(webDir, 'index.html'));
});

/* ---------- Global Error Handler ---------- */
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    },
  });
});

/* ---------- Start Server ---------- */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n  ╔══════════════════════════════════════════╗`);
    console.log(`  ║  CAMPUSGRID API Server                   ║`);
    console.log(`  ║  http://localhost:${PORT}                    ║`);
    console.log(`  ║  Health: http://localhost:${PORT}/api/health  ║`);
    console.log(`  ╚══════════════════════════════════════════╝\n`);
  });
}

module.exports = app;
