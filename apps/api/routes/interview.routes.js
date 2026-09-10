/* CAMPUSLINK — Interview Routes */
const router = require('express').Router();
const { evaluateAnswer } = require('../services/interview.service');

router.post('/feedback', (req, res) => {
  const result = evaluateAnswer(req.body.answer || '', req.body.question || '');
  res.json({ success: true, data: result });
});

router.post('/start', (req, res) => {
  const { targetRole } = req.body;
  const questions = {
    'Data Analyst': ['How would you handle missing data in a large dataset?', 'Explain a project where you used SQL to derive insights.'],
    'Software Engineer': ['Describe your approach to debugging a production issue.', 'What is the difference between a stack and a queue?'],
    default: ['Tell me about a project where you used data to make a decision.', 'Describe a time you had to learn something new quickly.'],
  };
  const roleQs = questions[targetRole] || questions.default;
  res.json({ success: true, data: { sessionId: 'session-' + Date.now(), questions: roleQs, targetRole: targetRole || 'General' } });
});

module.exports = router;
