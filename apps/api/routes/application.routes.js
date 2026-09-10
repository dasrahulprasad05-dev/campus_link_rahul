/* CAMPUSLINK — Application Routes */
const router = require('express').Router();
const demoData = require('../data/demo-data');

router.get('/', (req, res) => {
  res.json({ success: true, data: demoData.student.applications });
});

router.post('/', (req, res) => {
  const { jobId, jobTitle, company } = req.body;
  const app = { id: 'app-' + Date.now(), job: jobTitle, company, status: 'applied', appliedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), round: 'Pending Review' };
  demoData.student.applications.push(app);
  res.status(201).json({ success: true, data: app });
});

router.patch('/:id/status', (req, res) => {
  const app = demoData.student.applications.find(a => a.id === req.params.id);
  if (!app) return res.status(404).json({ success: false, error: { message: 'Application not found' } });
  app.status = req.body.status || app.status;
  app.round = req.body.round || app.round;
  res.json({ success: true, data: app });
});

module.exports = router;
