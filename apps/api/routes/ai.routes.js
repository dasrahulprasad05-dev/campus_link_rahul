/* CAMPUSLINK — AI Routes */
const router = require('express').Router();
const { matchResumeToJD } = require('../services/matching.service');
const { analyzeSkillGap } = require('../services/readiness.service');

router.post('/resume-match', (req, res) => {
  const result = matchResumeToJD(req.body.jobDescription || '');
  res.json({ success: true, data: result });
});

router.post('/skill-gap', (req, res) => {
  const result = analyzeSkillGap(req.body.targetRole, req.body.skills);
  res.json({ success: true, data: result });
});

module.exports = router;
