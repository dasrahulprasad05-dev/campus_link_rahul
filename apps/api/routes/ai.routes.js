/* CAMPUSLINK — AI Routes */
const router = require('express').Router();
const { matchResumeToJD } = require('../services/matching.service');
const { analyzeSkillGap, calculateReadiness } = require('../services/readiness.service');
const { evaluateAnswer } = require('../services/interview.service');

router.post('/resume-match', async (req, res, next) => {
  try {
    const result = await matchResumeToJD(req.body.jobDescription || '', req.body.studentSkills);
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    next(err);
  }
});

router.post('/skill-gap', async (req, res, next) => {
  try {
    const result = await analyzeSkillGap(req.body.targetRole, req.body.skills);
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    next(err);
  }
});

router.post('/interview-feedback', async (req, res, next) => {
  try {
    const result = await evaluateAnswer(req.body.answer || '', req.body.question || '', req.body.targetRole);
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    next(err);
  }
});

router.post('/readiness', async (req, res, next) => {
  try {
    const result = await calculateReadiness(req.body);
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
