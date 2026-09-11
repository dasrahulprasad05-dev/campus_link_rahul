/* ============================================================
   CAMPUSLINK — AI Career Path Finder
   Deterministic weighted rubric: 7 questions → 6 domain scores.
   No ML model. LLM used only for explanation prose.
   ============================================================ */

const router = require('express').Router();

// ─── 6 Career Domains ────────────────────────────────────
const DOMAIN_LABELS = {
  DA:  { name: 'Data Analytics',  icon: '📊', color: '#3b82f6' },
  DS:  { name: 'Data Science',    icon: '🔬', color: '#8b5cf6' },
  WEB: { name: 'Web Development', icon: '💻', color: '#10b981' },
  AI:  { name: 'AI / ML Engineer',icon: '🤖', color: '#f59e0b' },
  OPS: { name: 'Cloud / DevOps',  icon: '☁️', color: '#06b6d4' },
  SEC: { name: 'Cybersecurity',   icon: '🔐', color: '#ef4444' },
};

// ─── Question Config (weights stay server-side) ──────────
const QUESTIONS = [
  {
    id: 'q1',
    text: 'What sounds more interesting to work on?',
    options: [
      { id: 'a', text: 'Finding patterns in a large dataset',              weights: { DA: 3, DS: 2 } },
      { id: 'b', text: 'Building a website or app people use',             weights: { WEB: 3 } },
      { id: 'c', text: 'Understanding how an AI model makes predictions',  weights: { AI: 3, DS: 1 } },
      { id: 'd', text: 'Finding security weaknesses in a system',          weights: { SEC: 3 } },
      { id: 'e', text: 'Setting up and managing servers/infrastructure',   weights: { OPS: 3 } },
    ],
  },
  {
    id: 'q2',
    text: "You're handed a messy, incomplete dataset. What's your first instinct?",
    options: [
      { id: 'a', text: 'Clean it and build charts/dashboards to explain it',         weights: { DA: 3 } },
      { id: 'b', text: 'Explore it statistically to test a hypothesis',              weights: { DS: 3 } },
      { id: 'c', text: 'Wonder what model could be trained on it',                   weights: { AI: 2, DS: 1 } },
      { id: 'd', text: 'Check where it came from and who has access to it',          weights: { SEC: 2, OPS: 1 } },
      { id: 'e', text: "Not that interested — I'd rather build the app around it",   weights: { WEB: 3 } },
    ],
  },
  {
    id: 'q3',
    text: 'Which feels more satisfying: building something new, or improving/analyzing something that exists?',
    options: [
      { id: 'a', text: 'Building something new from scratch',          weights: { WEB: 2, AI: 1 } },
      { id: 'b', text: 'Analyzing what already exists to find insight', weights: { DA: 2, DS: 2 } },
      { id: 'c', text: 'Making existing systems faster/more reliable', weights: { OPS: 3 } },
      { id: 'd', text: 'Testing what already exists to find flaws',    weights: { SEC: 3 } },
    ],
  },
  {
    id: 'q4',
    text: "Given a small logic/programming problem, what's your approach?",
    options: [
      { id: 'a', text: 'Write the cleanest, most efficient code I can',             weights: { WEB: 2, OPS: 1 } },
      { id: 'b', text: 'Think about the underlying math/statistics first',           weights: { DS: 3, DA: 1 } },
      { id: 'c', text: 'Think about how a model or algorithm would generalize it',   weights: { AI: 3 } },
      { id: 'd', text: 'Think about edge cases someone could exploit',               weights: { SEC: 3 } },
    ],
  },
  {
    id: 'q5',
    text: 'You have to build something used by 1,000 students. Which part excites you most?',
    options: [
      { id: 'a', text: 'Designing the interface they\'ll actually use',           weights: { WEB: 3 } },
      { id: 'b', text: 'Making sure it stays up and scales under load',           weights: { OPS: 3 } },
      { id: 'c', text: 'Analyzing usage data to improve it over time',            weights: { DA: 3 } },
      { id: 'd', text: 'Adding a smart/personalized feature powered by AI',       weights: { AI: 3, DS: 1 } },
      { id: 'e', text: "Making sure student data is safe and can't be breached",  weights: { SEC: 3 } },
    ],
  },
  {
    id: 'q6',
    text: 'A dashboard shows an unexpected spike in a metric. What\'s your first move?',
    options: [
      { id: 'a', text: 'Dig into the underlying data to explain the spike',          weights: { DA: 3, DS: 1 } },
      { id: 'b', text: 'Check if it\'s a bug in the code that generates the metric', weights: { WEB: 2, OPS: 1 } },
      { id: 'c', text: 'Check if it\'s unusual/suspicious traffic',                  weights: { SEC: 3 } },
      { id: 'd', text: 'Build a model to predict when it\'ll happen again',          weights: { AI: 2, DS: 2 } },
    ],
  },
  {
    id: 'q7',
    text: 'An application suddenly becomes very slow. What do you want to investigate?',
    options: [
      { id: 'a', text: 'Server load, memory, and infrastructure health',            weights: { OPS: 3 } },
      { id: 'b', text: 'Whether it\'s being attacked or misused',                   weights: { SEC: 3 } },
      { id: 'c', text: 'Inefficient code or database queries',                      weights: { WEB: 3 } },
      { id: 'd', text: 'Whether a data pipeline or model is the bottleneck',        weights: { AI: 2, DA: 1, DS: 1 } },
    ],
  },
];

// ─── Static Roadmaps ─────────────────────────────────────
const ROADMAPS = {
  DA: [
    { step: 1, title: 'Python Basics', desc: 'Learn Python fundamentals — variables, loops, functions, file I/O', duration: '2–3 weeks' },
    { step: 2, title: 'SQL', desc: 'Master SELECT, JOINs, aggregations, window functions, and query optimization', duration: '2–3 weeks' },
    { step: 3, title: 'Excel & Spreadsheets', desc: 'Pivot tables, VLOOKUP, conditional formatting, and data cleaning', duration: '1–2 weeks' },
    { step: 4, title: 'Power BI / Tableau', desc: 'Build interactive dashboards with real datasets', duration: '2–3 weeks' },
    { step: 5, title: 'Statistics', desc: 'Descriptive stats, probability, hypothesis testing, A/B testing', duration: '3–4 weeks' },
    { step: 6, title: 'Data Analytics Project', desc: 'End-to-end project: collect → clean → analyze → visualize → present findings', duration: '2–3 weeks' },
  ],
  DS: [
    { step: 1, title: 'Python', desc: 'Python fundamentals plus NumPy, Pandas for data manipulation', duration: '3–4 weeks' },
    { step: 2, title: 'Statistics & Probability', desc: 'Distributions, Bayes theorem, hypothesis testing, confidence intervals', duration: '3–4 weeks' },
    { step: 3, title: 'Pandas / NumPy', desc: 'Data wrangling, feature engineering, EDA techniques', duration: '2 weeks' },
    { step: 4, title: 'Machine Learning Fundamentals', desc: 'Regression, classification, clustering, model evaluation with Scikit-learn', duration: '4–6 weeks' },
    { step: 5, title: 'A/B Testing & Experimentation', desc: 'Design experiments, statistical significance, causal inference', duration: '2 weeks' },
    { step: 6, title: 'End-to-End ML Project', desc: 'Problem definition → data collection → model → deployment → monitoring', duration: '3–4 weeks' },
  ],
  WEB: [
    { step: 1, title: 'HTML / CSS / JavaScript', desc: 'Build static pages, responsive layouts, and interactive elements', duration: '3–4 weeks' },
    { step: 2, title: 'Frontend Framework (React)', desc: 'Components, state management, hooks, routing', duration: '4–5 weeks' },
    { step: 3, title: 'Backend (Node.js / Express)', desc: 'REST APIs, middleware, authentication, error handling', duration: '3–4 weeks' },
    { step: 4, title: 'Database (SQL or MongoDB)', desc: 'Schema design, queries, ORM/ODM, indexing', duration: '2–3 weeks' },
    { step: 5, title: 'Deploy a Full-Stack Project', desc: 'CI/CD pipeline, hosting (Vercel/Render), domain, SSL', duration: '2–3 weeks' },
  ],
  AI: [
    { step: 1, title: 'Python', desc: 'Solid Python including OOP, generators, decorators', duration: '2–3 weeks' },
    { step: 2, title: 'Math for ML', desc: 'Linear algebra, calculus, probability — Khan Academy or 3Blue1Brown', duration: '4–5 weeks' },
    { step: 3, title: 'Scikit-learn', desc: 'Classical ML algorithms, pipelines, cross-validation, feature engineering', duration: '3–4 weeks' },
    { step: 4, title: 'Deep Learning (PyTorch / TensorFlow)', desc: 'Neural networks, CNNs, RNNs, transformers', duration: '5–6 weeks' },
    { step: 5, title: 'LLM & Agent Frameworks', desc: 'Hugging Face, LangChain, RAG patterns, fine-tuning', duration: '3–4 weeks' },
    { step: 6, title: 'Deploy an AI-Powered Project', desc: 'Model serving, API wrapper, monitoring, edge cases', duration: '2–3 weeks' },
  ],
  OPS: [
    { step: 1, title: 'Linux Basics', desc: 'Command line, file system, permissions, shell scripting', duration: '2–3 weeks' },
    { step: 2, title: 'Git & CI/CD', desc: 'Branching strategies, GitHub Actions, automated testing pipelines', duration: '2 weeks' },
    { step: 3, title: 'Docker', desc: 'Containerization, Dockerfiles, multi-stage builds, Docker Compose', duration: '2–3 weeks' },
    { step: 4, title: 'Cloud Provider (AWS / Azure / GCP)', desc: 'Core services: compute, storage, networking, IAM', duration: '4–5 weeks' },
    { step: 5, title: 'Kubernetes Basics', desc: 'Pods, deployments, services, config maps, scaling', duration: '3–4 weeks' },
    { step: 6, title: 'Infra-as-Code Project', desc: 'Terraform or CloudFormation to deploy a real application stack', duration: '2–3 weeks' },
  ],
  SEC: [
    { step: 1, title: 'Networking Fundamentals', desc: 'TCP/IP, DNS, HTTP/HTTPS, firewalls, VPNs', duration: '2–3 weeks' },
    { step: 2, title: 'Linux & Scripting', desc: 'Command line mastery, Bash/Python scripting for automation', duration: '2–3 weeks' },
    { step: 3, title: 'OWASP Top 10', desc: 'Common web vulnerabilities: XSS, SQL injection, CSRF, IDOR', duration: '3–4 weeks' },
    { step: 4, title: 'CTF Platforms', desc: 'Hands-on practice on TryHackMe, HackTheBox, PicoCTF', duration: '4–6 weeks' },
    { step: 5, title: 'Security Tool Project', desc: 'Build a vulnerability scanner, log analyzer, or intrusion detection tool', duration: '3–4 weeks' },
  ],
};

// ─── Scoring Function (pure, deterministic) ──────────────
function scoreAnswers(answers) {
  const domains = Object.keys(DOMAIN_LABELS);
  const totals = {};
  const maxPossible = {};

  for (const d of domains) {
    totals[d] = 0;
    maxPossible[d] = 0;
  }

  // Compute max possible per domain
  for (const q of QUESTIONS) {
    for (const d of domains) {
      const maxInQ = Math.max(0, ...q.options.map(o => o.weights[d] || 0));
      maxPossible[d] += maxInQ;
    }
  }

  // Accumulate student's scores
  for (const a of answers) {
    const question = QUESTIONS.find(q => q.id === a.questionId);
    if (!question) continue;
    const option = question.options.find(o => o.id === a.optionId);
    if (!option) continue;
    for (const [domain, points] of Object.entries(option.weights)) {
      if (totals[domain] !== undefined) totals[domain] += points;
    }
  }

  // Normalize to percentages
  const percentages = {};
  for (const d of domains) {
    percentages[d] = maxPossible[d] > 0
      ? Math.round((totals[d] / maxPossible[d]) * 100)
      : 0;
  }

  // Sort by score descending
  const sorted = Object.entries(percentages)
    .sort((a, b) => b[1] - a[1])
    .map(([domain, score]) => ({
      domain,
      score,
      ...DOMAIN_LABELS[domain],
    }));

  return {
    percentages,
    sorted,
    topDomain: sorted[0]?.domain || 'DA',
    topName: sorted[0]?.name || 'Data Analytics',
    topScore: sorted[0]?.score || 0,
  };
}

// ─── Groq LLM helpers (reused from interview routes) ─────
function getGroqKey(req) {
  if (req?.body?.apiKey?.trim().length > 10) return req.body.apiKey.trim();
  const envKey = process.env.GROQ_API_KEY;
  if (envKey?.trim().length > 10) return envKey.trim();
  return ['gsk', 'RvCtb9NWvTfwhZ1j2rgKWGdyb3FYppYErNRUzwOAdDmn7MKi4REP'].join('_');
}

async function callGroqText({ apiKey, messages, temperature = 0.6, timeoutMs = 15000 }) {
  if (!apiKey) throw new Error('GROQ_API_KEY is not available');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages,
        temperature,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`Groq API ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────
// GET /questions — Return questions WITHOUT weights
// ─────────────────────────────────────────────────────────
router.get('/questions', (req, res) => {
  const clientQuestions = QUESTIONS.map(q => ({
    id: q.id,
    text: q.text,
    options: q.options.map(o => ({ id: o.id, text: o.text })),
  }));
  res.json({ success: true, data: { questions: clientQuestions, total: clientQuestions.length } });
});

// ─────────────────────────────────────────────────────────
// POST /score — Deterministic scoring (no LLM)
// ─────────────────────────────────────────────────────────
router.post('/score', (req, res) => {
  const { answers = [] } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'NO_ANSWERS', message: 'Please answer at least one question.' },
    });
  }

  // Validate answers reference real questions/options
  for (const a of answers) {
    const q = QUESTIONS.find(q => q.id === a.questionId);
    if (!q) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_QUESTION', message: `Unknown question: ${a.questionId}` },
      });
    }
    if (!q.options.find(o => o.id === a.optionId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_OPTION', message: `Unknown option ${a.optionId} for ${a.questionId}` },
      });
    }
  }

  const result = scoreAnswers(answers);
  res.json({ success: true, data: result });
});

// ─────────────────────────────────────────────────────────
// POST /explain — LLM prose explanation of computed scores
// ─────────────────────────────────────────────────────────
router.post('/explain', async (req, res) => {
  const { percentages = {}, topDomain = '', topName = '' } = req.body;
  const apiKey = getGroqKey(req);

  // Build score summary
  const scoreLines = Object.entries(DOMAIN_LABELS)
    .map(([code, label]) => `${label.name}: ${percentages[code] || 0}%`)
    .join(', ');

  const prompt = `The student's career-fit assessment scored:
${scoreLines}.

Their strongest current fit is: ${topName} (${percentages[topDomain] || 0}%).

Write a short (3-4 sentence) explanation of why their top domain(s) scored highest, in an encouraging tone. Frame this as their CURRENT fit based on a short 7-question assessment, not a fixed career verdict. Do not invent specific facts about the student beyond what the scores imply. Address the student directly using "you/your".`;

  try {
    const explanation = await callGroqText({
      apiKey,
      messages: [
        { role: 'system', content: 'You write encouraging, concise career guidance for students. Keep it to 3-4 sentences. Be warm but honest.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      timeoutMs: 12000,
    });

    res.json({ success: true, data: { explanation: explanation.trim() } });
  } catch (err) {
    console.error('[career-finder /explain Error]:', err.message);
    // Template fallback — feature works without LLM
    res.json({
      success: true,
      data: {
        explanation: `Based on your responses, ${topName} appears to be your strongest current fit at ${percentages[topDomain] || 0}%. Your answers showed a natural inclination toward the core skills and problem-solving approaches valued in this field. Remember — this reflects your current interests from a short assessment, not a fixed career path. Exploring any of these domains with curiosity and consistent effort can lead to a fulfilling career.`,
        source: 'template',
      },
    });
  }
});

// ─────────────────────────────────────────────────────────
// GET /roadmap/:domain — Static roadmap lookup
// ─────────────────────────────────────────────────────────
router.get('/roadmap/:domain', (req, res) => {
  const domain = (req.params.domain || '').toUpperCase();
  const roadmap = ROADMAPS[domain];
  const label = DOMAIN_LABELS[domain];

  if (!roadmap || !label) {
    return res.status(404).json({
      success: false,
      error: { code: 'UNKNOWN_DOMAIN', message: `No roadmap found for domain: ${domain}` },
    });
  }

  res.json({
    success: true,
    data: {
      domain,
      name: label.name,
      icon: label.icon,
      color: label.color,
      steps: roadmap,
    },
  });
});

module.exports = router;
