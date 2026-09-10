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

const { authenticate } = require('./middleware/auth');

// Dashboard endpoint (strictly authenticated; enforces role scoping)
const demoData = require('./data/demo-data');

app.get('/api/v1/dashboard', authenticate, (req, res) => {
  let role = req.user.role || 'student';
  if (req.user.role === 'admin' && req.query.role) {
    role = req.query.role;
  }
  const data = demoData[role];
  if (!data) return res.status(400).json({ success: false, error: { code: 'INVALID_ROLE', message: 'Invalid role' } });
  res.json(data);
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

// Legacy dashboard compatibility route (strictly authenticated)
app.get('/api/dashboard', authenticate, (req, res) => {
  let role = req.user.role || 'student';
  if (req.user.role === 'admin' && req.query.role) {
    role = req.query.role;
  }
  res.json(demoData[role] || demoData.student);
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
