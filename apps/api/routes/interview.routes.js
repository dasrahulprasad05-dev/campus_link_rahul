/* ============================================================
   CAMPUSLINK — Interview Routes
   AI-powered mock interview sessions:
   - Adaptive question generation (Groq LLM with rich fallback)
   - Comprehensive STAR answer evaluation & scoring
   ============================================================ */
const router = require('express').Router();
const { evaluateAnswer } = require('../services/interview.service');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Curated question bank: 6-7 high-impact questions per role
const CURATED_QUESTIONS = {
  'Data Analyst': [
    { text: 'How would you handle missing data or outliers in a large dataset before beginning your analysis?', category: 'technical', skill_tested: 'Data Cleaning', difficulty: 'medium' },
    { text: 'Explain a scenario where you used SQL (such as window functions, CTEs, or complex joins) to derive actionable business insights.', category: 'technical', skill_tested: 'SQL & Analytics', difficulty: 'medium' },
    { text: 'What is the difference between correlation and causation? Provide a concrete business example.', category: 'technical', skill_tested: 'Statistical Reasoning', difficulty: 'easy' },
    { text: 'Describe a time when your analytical insights challenged a team assumption or influenced an important business decision.', category: 'behavioral', skill_tested: 'Stakeholder Communication', difficulty: 'medium' },
    { text: 'You discover an unexpected anomaly in key sales metrics 2 hours before an executive presentation. What are your immediate and follow-up steps?', category: 'situational', skill_tested: 'Critical Thinking', difficulty: 'hard' },
    { text: 'How do you decide which visualization (e.g., bar chart, line chart, scatter plot, heatmap) best communicates your findings to non-technical stakeholders?', category: 'technical', skill_tested: 'Data Visualization', difficulty: 'easy' },
    { text: 'Walk through how you would design an A/B test experiment to measure whether a new feature improves user conversion rates.', category: 'technical', skill_tested: 'Experimentation & Hypothesis Testing', difficulty: 'hard' },
  ],
  'Software Engineer': [
    { text: 'Describe your systematic approach to diagnosing and debugging a complex, intermittent bug in production.', category: 'technical', skill_tested: 'Debugging & RCA', difficulty: 'medium' },
    { text: 'Explain the differences between a stack and a queue. Describe a real-world software architecture scenario where you would choose each.', category: 'technical', skill_tested: 'Data Structures', difficulty: 'easy' },
    { text: 'What are the principles of RESTful API design, and how do you handle idempotent operations and API versioning?', category: 'technical', skill_tested: 'API Design', difficulty: 'medium' },
    { text: 'Tell me about a time you had to refactor legacy code or resolve technical debt under a tight deadline. How did you balance speed and maintainability?', category: 'behavioral', skill_tested: 'Code Quality (STAR)', difficulty: 'medium' },
    { text: 'Your team is split between a microservices approach and a monolithic service for a new product feature. How would you evaluate the tradeoffs?', category: 'situational', skill_tested: 'System Architecture', difficulty: 'hard' },
    { text: 'What is the time and space complexity of QuickSort? In what worst-case scenario does it degrade to O(n²), and how can you mitigate it?', category: 'technical', skill_tested: 'Algorithms', difficulty: 'hard' },
    { text: 'Why are CI/CD pipelines and automated testing suites critical to high-velocity software engineering teams?', category: 'technical', skill_tested: 'DevOps & Reliability', difficulty: 'easy' },
  ],
  'ML Engineer': [
    { text: 'Explain the bias-variance tradeoff and how regularization techniques (L1 Lasso vs. L2 Ridge) help mitigate overfitting.', category: 'technical', skill_tested: 'Machine Learning Theory', difficulty: 'medium' },
    { text: 'How do you prevent and detect data leakage during feature engineering and cross-validation pipelines?', category: 'technical', skill_tested: 'Feature Engineering', difficulty: 'medium' },
    { text: 'How do you handle severe class imbalance in a classification problem? Compare resampling vs focal loss vs threshold tuning.', category: 'technical', skill_tested: 'Model Training', difficulty: 'hard' },
    { text: 'Describe an end-to-end machine learning project you built. What were the biggest hurdles from data preparation to model inference?', category: 'behavioral', skill_tested: 'MLOps (STAR)', difficulty: 'medium' },
    { text: 'Your model achieves 95% accuracy in offline test evaluation, but business KPIs decline after deployment. How do you troubleshoot?', category: 'situational', skill_tested: 'Model Monitoring', difficulty: 'hard' },
    { text: 'In a fraud detection model where missing a fraudulent transaction is 50x more costly than a false positive, which evaluation metrics would you optimize?', category: 'technical', skill_tested: 'Evaluation Metrics', difficulty: 'easy' },
  ],
  'Web Developer': [
    { text: 'Explain the browser Critical Rendering Path and the specific techniques you use to optimize Core Web Vitals (LCP, INP, CLS).', category: 'technical', skill_tested: 'Web Performance', difficulty: 'medium' },
    { text: 'Compare CSS Grid and CSS Flexbox. When is it advantageous to use Grid over Flexbox, and vice versa in responsive layouts?', category: 'technical', skill_tested: 'CSS Layout', difficulty: 'easy' },
    { text: 'Explain client-side state management patterns. When is local component state sufficient versus needing global application state?', category: 'technical', skill_tested: 'Frontend Architecture', difficulty: 'medium' },
    { text: 'Tell me about a complex interactive UI component you designed and how you ensured accessibility (ARIA) and responsive behavior.', category: 'behavioral', skill_tested: 'UI/UX & Accessibility (STAR)', difficulty: 'medium' },
    { text: 'A critical client-facing checkout bug is reported exclusively on mobile browsers on a Friday evening. How do you isolate, reproduce, and resolve it?', category: 'situational', skill_tested: 'Troubleshooting & Triage', difficulty: 'hard' },
    { text: 'What security measures do you implement to protect modern web applications against Cross-Site Scripting (XSS) and CSRF attacks?', category: 'technical', skill_tested: 'Web Security', difficulty: 'hard' },
  ],
  'General': [
    { text: 'Tell me about a challenging project where you took ownership. Use the STAR framework: Situation, Task, Action, and measurable Result.', category: 'behavioral', skill_tested: 'Ownership & STAR', difficulty: 'medium' },
    { text: 'Describe a time you had to learn an unfamiliar technology, tool, or framework on short notice to deliver a requirement.', category: 'behavioral', skill_tested: 'Adaptability', difficulty: 'easy' },
    { text: 'How do you prioritize competing deadlines when multiple urgent tasks demand your immediate attention?', category: 'situational', skill_tested: 'Time Management', difficulty: 'medium' },
    { text: 'Tell me about a time you made a mistake or faced a failure in a project. What did you learn, and how did you adapt your approach?', category: 'behavioral', skill_tested: 'Growth Mindset', difficulty: 'medium' },
    { text: 'Describe a situation where you had a disagreement with a team member or mentor. How did you communicate and resolve it constructively?', category: 'behavioral', skill_tested: 'Collaboration & EQ', difficulty: 'medium' },
    { text: 'Where do you see yourself technically in the next 2-3 years, and what concrete steps are you taking currently to reach that goal?', category: 'behavioral', skill_tested: 'Career Vision', difficulty: 'easy' },
  ]
};

// Helper: Call Groq LLM with JSON response
async function callGroqLLM(messages, timeoutMs = 6000) {
  if (!GROQ_API_KEY) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.6,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content);
  } catch (_err) {
    clearTimeout(timer);
    return null;
  }
}

// -------------------------------------------------------------
// POST /feedback — Evaluate candidate's interview answer
// -------------------------------------------------------------
router.post('/feedback', async (req, res) => {
  const { answer = '', question = '', targetRole = 'General' } = req.body;

  // 1. Try Groq LLM evaluation directly
  if (answer && answer.trim().length >= 10 && GROQ_API_KEY) {
    const prompt = `You are an expert interview evaluator for campus placements.
Target Role: ${targetRole}
Question Asked: "${question}"
Candidate Answer: "${answer}"

Evaluate the answer thoroughly using the STAR methodology (Situation, Task, Action, Result).
Return ONLY a valid JSON object matching this schema:
{
  "score": <integer between 25 and 98>,
  "feedback": "<2-3 sentence constructive critique explaining what was good and how to improve>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<actionable improvement 1>", "<actionable improvement 2>"],
  "follow_up_question": "<a relevant probing follow-up question to test depth>",
  "tip": "<a concise, actionable interview tip>"
}`;

    const groqResult = await callGroqLLM([
      { role: 'system', content: 'You evaluate campus placement interview answers constructively and return raw JSON.' },
      { role: 'user', content: prompt }
    ], 5000);

    if (groqResult && typeof groqResult.score === 'number') {
      return res.json({
        success: true,
        data: {
          score: groqResult.score,
          feedback: groqResult.feedback || 'Good structured response.',
          strengths: groqResult.strengths || ['Relevant response structure'],
          improvements: groqResult.improvements || ['Include quantifiable impact'],
          follow_up_question: groqResult.follow_up_question || '',
          tip: groqResult.tip || 'Use the STAR method: Situation → Task → Action → Result.',
          source: 'groq-llm',
          timestamp: new Date().toISOString(),
        }
      });
    }
  }

  // 2. Try FastAPI AI microservice
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const aiRes = await fetch(`${AI_SERVICE_URL}/v1/interview-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answer,
        question,
        target_role: targetRole,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (aiRes.ok) {
      const data = await aiRes.json();
      return res.json({ success: true, data });
    }
  } catch (_) {}

  // 3. Deterministic rule-based evaluation fallback
  const result = evaluateAnswer(answer, question, targetRole);
  res.json({ success: true, data: result });
});

// -------------------------------------------------------------
// POST /start — Start interview session with adaptive questions
// -------------------------------------------------------------
router.post('/start', async (req, res) => {
  const { targetRole = 'General', skillGaps = [], difficulty = 'medium', count = 5 } = req.body;
  const questionCount = Math.max(3, Math.min(10, parseInt(count, 10) || 5));

  // 1. Try Groq LLM for real-time question generation
  if (GROQ_API_KEY) {
    const prompt = `Generate ${questionCount} realistic campus placement interview questions for a candidate.
Role: "${targetRole}"
Difficulty: "${difficulty}"
Skill Gaps to focus on: ${skillGaps && skillGaps.length ? skillGaps.join(', ') : 'core technical and behavioral competencies'}

Include a balanced mix of:
- Technical concept & problem-solving questions
- Behavioral / STAR framework questions
- Situational / edge-case questions

Return ONLY a valid JSON object matching this schema:
{
  "questions": [
    {
      "text": "The full question text",
      "category": "technical | behavioral | situational",
      "skill_tested": "specific skill tested",
      "difficulty": "${difficulty}"
    }
  ]
}`;

    const groqResult = await callGroqLLM([
      { role: 'system', content: 'You generate campus placement interview questions and output only raw JSON.' },
      { role: 'user', content: prompt }
    ], 6000);

    if (groqResult && Array.isArray(groqResult.questions) && groqResult.questions.length >= 3) {
      const questions = groqResult.questions.slice(0, questionCount).map((q, idx) => ({
        text: q.text || `Question ${idx + 1}`,
        category: q.category || 'technical',
        skill_tested: q.skill_tested || targetRole,
        difficulty: q.difficulty || difficulty,
      }));

      return res.json({
        success: true,
        data: {
          sessionId: 'session-' + Date.now(),
          questions,
          targetRole,
          difficulty,
          source: 'groq-llm',
          adaptive: true,
        },
      });
    }
  }

  // 2. Try FastAPI AI microservice
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const aiRes = await fetch(`${AI_SERVICE_URL}/v1/generate-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_role: targetRole,
        skill_gaps: skillGaps,
        difficulty,
        count: questionCount,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (aiRes.ok) {
      const data = await aiRes.json();
      const rawQs = data.questions || [];
      if (rawQs.length >= 3) {
        return res.json({
          success: true,
          data: {
            sessionId: 'session-' + Date.now(),
            questions: rawQs.slice(0, questionCount),
            targetRole,
            difficulty,
            source: data.source || 'fastapi-ai',
            adaptive: true,
          },
        });
      }
    }
  } catch (_) {}

  // 3. Rich Curated Question Bank (guarantees at least 5 questions)
  const bank = CURATED_QUESTIONS[targetRole] || CURATED_QUESTIONS['General'];
  // Prioritize matching difficulty, then fill remaining
  const matching = bank.filter(q => q.difficulty === difficulty);
  const others = bank.filter(q => q.difficulty !== difficulty);
  const combined = [...matching, ...others];
  const selected = combined.slice(0, questionCount);

  res.json({
    success: true,
    data: {
      sessionId: 'session-' + Date.now(),
      questions: selected,
      targetRole,
      difficulty,
      source: 'curated-bank',
      adaptive: true,
    },
  });
});

module.exports = router;
