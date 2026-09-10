/* CAMPUSLINK — Job Routes */
const router = require('express').Router();
const demoData = require('../data/demo-data');

router.get('/', (req, res) => {
  res.json({ success: true, data: demoData.student.jobs, meta: { total: demoData.student.jobs.length } });
});

router.get('/:id', (req, res) => {
  const job = demoData.student.jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });
  res.json({ success: true, data: job });
});

router.post('/', (req, res) => {
  const { title, company, location, type, deadline, skills } = req.body;
  if (!title) return res.status(400).json({ success: false, error: { message: 'Title is required' } });
  const job = { id: 'job-' + Date.now(), title, company, location, type, deadline, skills: skills || [], match: 0 };
  demoData.student.jobs.push(job);
  res.status(201).json({ success: true, data: job });
});

module.exports = router;
