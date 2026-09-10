/* CAMPUSLINK — Scheduler Routes */
const router = require('express').Router();
const { checkConflicts } = require('../services/scheduler.service');

router.post('/check', (req, res) => {
  const result = checkConflicts(req.body.events || []);
  res.json({ success: true, data: result });
});

module.exports = router;
