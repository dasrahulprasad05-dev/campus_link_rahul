/* ============================================================
   CAMPUSLINK — Express API Server
   Modular backend with middleware chain, route modules,
   and structured response format.
   ============================================================ */

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------- Middleware ---------- */
app.use(cors());
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

const { authenticate } = require('./middleware/auth');
const { query, memoryDb } = require('./db/pool');

// Dashboard endpoint (strictly authenticated; returns role-specific aggregated data)
app.get('/api/v1/dashboard', authenticate, async (req, res) => {
  let role = req.user.role || 'student';
  if (req.user.role === 'admin' && req.query.role) {
    role = req.query.role;
  }

  try {
    if (role === 'student') {
      // Student dashboard: readiness + applications + jobs
      const profile = memoryDb.tables.student_profiles.find(p => p.user_id === req.user.id);
      const apps = memoryDb.tables.applications.filter(a => a.student_id === (profile?.id || req.user.id));
      const offers = memoryDb.tables.offers.filter(o => o.student_id === (profile?.id || req.user.id));
      const allJobs = memoryDb.tables.jobs.filter(j => j.status === 'active');

      const kpis = [
        { label: 'Readiness Score', value: `${profile?.readiness_score || 0}/100`, delta: '', icon: '📊', color: 'blue' },
        { label: 'Applications', value: String(apps.length), delta: `${apps.filter(a => a.status !== 'rejected').length} active`, icon: '📝', color: 'green' },
        { label: 'Offers', value: String(offers.length), delta: offers.filter(o => o.status === 'pending').length ? `${offers.filter(o => o.status === 'pending').length} pending` : '', icon: '🎉', color: 'orange' },
        { label: 'Open Jobs', value: String(allJobs.length), delta: '', icon: '💼', color: 'purple' },
      ];

      return res.json({
        success: true,
        kpis,
        readiness: { score: profile?.readiness_score || 0 },
        applications: apps.slice(0, 5).map(a => {
          const job = memoryDb.tables.jobs.find(j => j.id === a.job_id);
          const comp = job ? memoryDb.tables.companies.find(c => c.id === job.company_id) : null;
          return { id: a.id, job: job?.title || 'Unknown', company: comp?.name || '', status: a.status, round: a.current_round };
        }),
        jobs: allJobs.slice(0, 5).map(j => {
          const comp = memoryDb.tables.companies.find(c => c.id === j.company_id);
          return { id: j.id, title: j.title, company: comp?.name || '', location: j.location, type: j.type, deadline: j.deadline, skills: j.skills_required || [] };
        }),
      });
    }

    if (role === 'admin') {
      const students = memoryDb.tables.student_profiles;
      const jobs = memoryDb.tables.jobs;
      const drives = memoryDb.tables.drives;
      const offers = memoryDb.tables.offers;
      const apps = memoryDb.tables.applications;
      const acceptedOffers = offers.filter(o => o.status === 'accepted');
      const avgCTC = acceptedOffers.length > 0 ? (acceptedOffers.reduce((s, o) => s + parseFloat(o.ctc_lpa || 0), 0) / acceptedOffers.length).toFixed(2) : 0;

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
        students: students.slice(0, 10).map(s => {
          const user = memoryDb.tables.users.find(u => u.id === s.user_id);
          return { id: s.id, name: user?.name || '', branch: s.branch, cgpa: s.cgpa, readiness: s.readiness_score, target_role: s.target_role };
        }),
        drives: drives.map(dr => {
          const comp = memoryDb.tables.companies.find(c => c.id === dr.company_id);
          return { id: dr.id, company: comp?.name || '', role: dr.role, date: dr.drive_date, venue: dr.venue, status: dr.status };
        }),
      });
    }

    if (role === 'recruiter') {
      const jobs = memoryDb.tables.jobs.filter(j => j.recruiter_id === req.user.id || j.recruiter_id === 'u-recruiter-tcs');
      const apps = memoryDb.tables.applications;

      return res.json({
        success: true,
        kpis: [
          { label: 'Active Jobs', value: String(jobs.filter(j => j.status === 'active').length), icon: '💼', color: 'blue' },
          { label: 'Total Applications', value: String(apps.filter(a => jobs.some(j => j.id === a.job_id)).length), icon: '📝', color: 'green' },
          { label: 'Shortlisted', value: String(apps.filter(a => a.status === 'shortlisted' && jobs.some(j => j.id === a.job_id)).length), icon: '✅', color: 'orange' },
          { label: 'Interviewing', value: String(apps.filter(a => a.status === 'interview' && jobs.some(j => j.id === a.job_id)).length), icon: '🎤', color: 'purple' },
        ],
        jobs: jobs.map(j => {
          const comp = memoryDb.tables.companies.find(c => c.id === j.company_id);
          const jobApps = apps.filter(a => a.job_id === j.id);
          return { id: j.id, title: j.title, company: comp?.name || '', applicants: jobApps.length, shortlisted: jobApps.filter(a => a.status !== 'applied').length, status: j.status };
        }),
      });
    }

    if (role === 'mentor') {
      const assignments = memoryDb.tables.mentor_assignments.filter(a => a.mentor_id === req.user.id || a.mentor_id === 'u-mentor-rahul');
      const menteeIds = assignments.map(a => a.student_id);
      const mentees = memoryDb.tables.student_profiles.filter(s => menteeIds.includes(s.id));
      const atRisk = mentees.filter(s => (s.readiness_score || 0) < 60);

      return res.json({
        success: true,
        kpis: [
          { label: 'Mentees', value: String(mentees.length), icon: '👥', color: 'blue' },
          { label: 'At Risk', value: String(atRisk.length), icon: '⚠️', color: 'red' },
          { label: 'Avg Readiness', value: `${mentees.length ? Math.round(mentees.reduce((s, m) => s + (m.readiness_score || 0), 0) / mentees.length) : 0}`, icon: '📊', color: 'green' },
        ],
        students: mentees.map(s => {
          const user = memoryDb.tables.users.find(u => u.id === s.user_id);
          return { id: s.id, name: user?.name || '', branch: s.branch, readiness: s.readiness_score, target_role: s.target_role, status: (s.readiness_score || 0) < 60 ? 'at-risk' : 'on-track' };
        }),
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

// AI Service proxy helper
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
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
app.post('/api/v1/analyze/skill-gap', handleSkillGap);
app.post('/api/analyze/skill-gap', handleSkillGap);
app.post('/api/v1/interviews/feedback', handleInterviewFeedback);
app.post('/api/interviews/feedback', handleInterviewFeedback);
app.post('/api/v1/scheduler/check', handleSchedulerCheck);
app.post('/api/scheduler/check', handleSchedulerCheck);

// New AI feature endpoints (proxy to Python service)
async function handleAIProxy(aiPath, req, res) {
  const result = await proxyAI(aiPath, req.body);
  if (result) return res.json({ success: true, data: result, ...result });
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

// Legacy dashboard compatibility route (redirects to authenticated dashboard)
app.get('/api/dashboard', authenticate, (req, res) => {
  res.redirect('/api/v1/dashboard' + (req.query.role ? `?role=${req.query.role}` : ''));
});

/* ---------- Health Check ---------- */
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'campuslink-api',
    version: '1.0.0',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'campuslink-api' });
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
    console.log(`  ║  CAMPUSLINK API Server                   ║`);
    console.log(`  ║  http://localhost:${PORT}                    ║`);
    console.log(`  ║  Health: http://localhost:${PORT}/api/health  ║`);
    console.log(`  ╚══════════════════════════════════════════╝\n`);
  });
}

module.exports = app;
