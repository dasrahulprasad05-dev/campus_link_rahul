/* CAMPUSLINK — Interview Routes */
const router = require('express').Router();
const { evaluateAnswer } = require('../services/interview.service');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

router.post('/feedback', async (req, res, next) => {
  try {
    // Try Python AI service first
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const aiRes = await fetch(`${AI_SERVICE_URL}/v1/interview-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answer: req.body.answer || '',
        question: req.body.question || '',
        target_role: req.body.targetRole || 'General',
      }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (aiRes.ok) {
      const data = await aiRes.json();
      return res.json({ success: true, data });
    }
  } catch (_) {}

  // Fallback to local rule engine
  const result = evaluateAnswer(req.body.answer || '', req.body.question || '');
  res.json({ success: true, data: result });
});

// Feature 5: Adaptive question generation via Python AI service
router.post('/start', async (req, res) => {
  const { targetRole, skillGaps, currentSkills, difficulty } = req.body;

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const aiRes = await fetch(`${AI_SERVICE_URL}/v1/generate-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_role: targetRole || 'General',
        skill_gaps: skillGaps || [],
        current_skills: currentSkills || [],
        difficulty: difficulty || 'medium',
        count: 5,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (aiRes.ok) {
      const data = await aiRes.json();
      const questions = (data.questions || []).map(q => q.text || q);
      return res.json({
        success: true,
        data: {
          sessionId: 'session-' + Date.now(),
          questions: questions,
          targetRole: targetRole || 'General',
          source: data.source || 'groq-llm',
          adaptive: true,
        },
      });
    }
  } catch (_) {}

  // Fallback: static question bank
  const questions = {
    'Data Analyst': ['How would you handle missing data in a large dataset?', 'Explain a project where you used SQL to derive insights.'],
    'Software Engineer': ['Describe your approach to debugging a production issue.', 'What is the difference between a stack and a queue?'],
    default: ['Tell me about a project where you used data to make a decision.', 'Describe a time you had to learn something new quickly.'],
  };
  const roleQs = questions[targetRole] || questions.default;
  res.json({
    success: true,
    data: {
      sessionId: 'session-' + Date.now(),
      questions: roleQs,
      targetRole: targetRole || 'General',
      source: 'rule-engine',
      adaptive: false,
    },
  });
});

module.exports = router;
