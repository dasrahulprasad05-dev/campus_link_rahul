/* ============================================================
   CAMPUSLINK — Job Routes
   Job discovery, search, and recruiter job postings with RBAC.
   ============================================================ */

const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const jobRepo = require('../repositories/job.repository');
const demoData = require('../data/demo-data');

// GET /api/v1/jobs — list jobs with optional search and type filtering
router.get('/', async (req, res) => {
  try {
    const jobs = await jobRepo.listJobs({
      search: req.query.search,
      type: req.query.type,
    });
    res.json({
      success: true,
      data: jobs.length ? jobs : demoData.student.jobs,
      meta: { total: jobs.length || demoData.student.jobs.length }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// GET /api/v1/jobs/:id — get job details
router.get('/:id', async (req, res) => {
  try {
    const job = await jobRepo.getJobById(req.params.id);
    if (!job) {
      const fallback = demoData.student.jobs.find(j => j.id === req.params.id);
      if (fallback) return res.json({ success: true, data: fallback });
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });
    }
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// POST /api/v1/jobs — create new job posting (Strictly Recruiter / Admin only)
router.post('/', authenticate, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const { title, company, location, type, deadline, skills } = req.body;
    if (!title || !company) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Job title and company name are required' }
      });
    }

    const job = await jobRepo.createJob({
      title,
      company,
      location,
      type,
      deadline,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
      match: 85,
    });

    res.status(201).json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

module.exports = router;
