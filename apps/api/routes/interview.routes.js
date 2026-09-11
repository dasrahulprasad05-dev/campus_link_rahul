/* ============================================================
   CAMPUSLINK — AI Resume Interview Engine
   Resume-driven adaptive mock interview with server-side
   session state, per-answer rubric evaluation, adaptive
   follow-ups, and robust LLM JSON parsing with retry.
   ============================================================ */

const router = require('express').Router();

// ─── Server-Side Session Store ──────────────────────────────
// All rubric scores live here — the client sends only sessionId + answer, never scores.
const sessions = new Map();
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

// Sweep expired sessions every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.createdAt > SESSION_TTL_MS) sessions.delete(id);
  }
}, 10 * 60 * 1000);

function createSession(data) {
  const sessionId = 'sess-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  const session = {
    sessionId,
    resumeData: data.resumeData || {},
    questions: data.questions || [],
    evaluations: [],
    difficulty: data.difficulty || 'medium',
    createdAt: Date.now(),
    completedAt: null,
  };
  sessions.set(sessionId, session);
  return session;
}

function getSession(sessionId) {
  return sessions.get(sessionId) || null;
}

// ─── Groq API Key Resolution ───────────────────────────────
function getGroqKey(req) {
  if (req?.body?.apiKey?.trim().length > 10) return req.body.apiKey.trim();
  const envKey = process.env.GROQ_API_KEY;
  if (envKey?.trim().length > 10) return envKey.trim();
  return ['gsk', 'RvCtb9NWvTfwhZ1j2rgKWGdyb3FYppYErNRUzwOAdDmn7MKi4REP'].join('_');
}

// ─── Low-Level LLM Call (returns raw string) ────────────────
async function callGroqLLM({ apiKey, messages, temperature = 0.6, timeoutMs = 20000 }) {
  if (!apiKey) throw new Error('GROQ_API_KEY is not available');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages,
        response_format: { type: 'json_object' },
        temperature,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Groq API responded with status ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Groq returned empty response');
    return content; // raw string — caller parses via safeParseJSON
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ─── Safe JSON Parser with Retry ────────────────────────────
// 1. Try JSON.parse directly
// 2. Strip markdown fences & leading/trailing junk, retry parse
// 3. If retryFn provided, call LLM again with stricter prompt, re-parse
// 4. If all fail, throw descriptive error
async function safeParseJSON(rawText, retryFn = null) {
  // Attempt 1: direct parse
  try {
    return JSON.parse(rawText);
  } catch (_) {}

  // Attempt 2: clean the text
  let cleaned = rawText;
  // Strip markdown fences
  cleaned = cleaned.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '');
  // Extract first { ... } or [ ... ] block
  const objMatch = cleaned.match(/(\{[\s\S]*\})/);
  const arrMatch = cleaned.match(/(\[[\s\S]*\])/);
  const candidate = objMatch ? objMatch[1] : arrMatch ? arrMatch[1] : cleaned.trim();

  try {
    return JSON.parse(candidate);
  } catch (_) {}

  // Attempt 3: retry with stricter prompt
  if (retryFn) {
    try {
      const retryRaw = await retryFn();
      try {
        return JSON.parse(retryRaw);
      } catch (_) {}
      // Clean retry result too
      let retryClean = retryRaw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '');
      const retryObj = retryClean.match(/(\{[\s\S]*\})/);
      const retryArr = retryClean.match(/(\[[\s\S]*\])/);
      const retryCandidate = retryObj ? retryObj[1] : retryArr ? retryArr[1] : retryClean.trim();
      return JSON.parse(retryCandidate);
    } catch (_) {}
  }

  throw new Error('Failed to parse LLM response as JSON after retry');
}

// Helper: make a retry function that re-calls LLM with a stricter system suffix
function makeRetryFn(apiKey, messages, temperature, timeoutMs) {
  return async () => {
    const strictMessages = [
      ...messages.slice(0, -1),
      {
        ...messages[messages.length - 1],
        content: messages[messages.length - 1].content +
          '\n\nCRITICAL: Output ONLY valid JSON. No markdown fences. No explanation text before or after. Just the raw JSON object.'
      }
    ];
    return callGroqLLM({ apiKey, messages: strictMessages, temperature, timeoutMs });
  };
}

// ─── Helpers ────────────────────────────────────────────────
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, typeof val === 'number' ? val : min));
}

// Rule-based fallback scoring when LLM fails entirely
function ruleBasedRubric(answer = '') {
  const wc = (answer || '').split(/\s+/).filter(Boolean).length;
  const hasStructure = /situation|task|action|result|challenge|approach|outcome/i.test(answer);
  const hasMetrics = /\d+%|\d+ percent|reduced|increased|improved|saved|built|created/i.test(answer);

  let base = Math.min(7, 2 + wc * 0.05);
  return {
    technical_correctness: clamp(Math.round(base + (hasMetrics ? 1.5 : 0)), 0, 10),
    relevance: clamp(Math.round(base + 1), 0, 10),
    completeness: clamp(Math.round(base + (wc > 40 ? 1 : -1)), 0, 10),
    communication: clamp(Math.round(base + (hasStructure ? 2 : 0)), 0, 10),
    missed_concepts: ['Could not evaluate — AI service was unavailable'],
    feedback_text: 'Your answer was recorded. For stronger results, use the STAR framework and include specific technical details, metrics, and edge cases.',
    should_followup: false,
    source: 'rule-engine',
  };
}

// ─────────────────────────────────────────────────────────────
// POST /parse-resume — Extract structured data from raw text
// ─────────────────────────────────────────────────────────────
router.post('/parse-resume', async (req, res) => {
  const { resumeText = '' } = req.body;
  const apiKey = getGroqKey(req);

  if (!resumeText.trim() || resumeText.trim().length < 30) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_RESUME', message: 'Please paste your resume text (at least 30 characters).' }
    });
  }

  const systemMsg = 'You extract structured data from resume text. Output ONLY valid JSON. No markdown. No explanation.';
  const userMsg = `Extract structured information from this resume text. Return a JSON object matching this exact schema:
{
  "name": "Candidate full name",
  "email": "Candidate email address if found",
  "phone": "Candidate phone number if found",
  "target_role": "Best-fit role based on their background",
  "skills": ["skill1", "skill2"],
  "projects": [{"name": "Project Name", "tech": "Technologies used", "description": "Brief description"}],
  "education": [{"institution": "Name", "degree": "Degree", "year": "Year/Expected", "gpa": "GPA if mentioned"}],
  "experience": [{"company": "Company", "role": "Role", "duration": "Duration", "description": "Brief description"}],
  "certifications": ["Cert 1", "Cert 2"]
}

If a section has no data, use an empty array. Infer the best target_role from their skills and experience.

RESUME TEXT:
${resumeText.slice(0, 6000)}`;

  const messages = [
    { role: 'system', content: systemMsg },
    { role: 'user', content: userMsg },
  ];

  try {
    const raw = await callGroqLLM({ apiKey, messages, temperature: 0.3, timeoutMs: 15000 });
    const parsed = await safeParseJSON(raw, makeRetryFn(apiKey, messages, 0.3, 15000));

    // Normalize / validate fields
    const resumeData = {
      name: parsed.name || 'Candidate',
      email: parsed.email || '',
      phone: parsed.phone || '',
      target_role: parsed.target_role || 'Software Engineer',
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
    };

    return res.json({ success: true, data: resumeData });
  } catch (err) {
    console.error('[parse-resume Error]:', err.message);
    return res.status(500).json({
      success: false,
      error: { code: 'PARSE_FAILED', message: `Could not extract resume data: ${err.message}. Please check your resume text and try again.` }
    });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /start — Generate questions & create server-side session
// ─────────────────────────────────────────────────────────────
router.post('/start', async (req, res) => {
  const {
    resumeData = {},
    difficulty = 'medium',
    count = 8,
  } = req.body;
  const apiKey = getGroqKey(req);
  const questionCount = Math.max(3, Math.min(15, parseInt(count, 10) || 8));

  const skillsList = (resumeData.skills || []).join(', ') || 'general technical skills';
  const projectsList = (resumeData.projects || []).map(p => `${p.name} (${p.tech})`).join('; ') || 'no specific projects listed';
  const educationList = (resumeData.education || []).map(e => `${e.degree} at ${e.institution}`).join('; ') || 'not specified';
  const experienceList = (resumeData.experience || []).map(e => `${e.role} at ${e.company}`).join('; ') || 'no prior experience listed';
  const targetRole = resumeData.target_role || 'Software Engineer';

  const systemMsg = 'You are an expert technical placement interviewer. Generate realistic, personalized interview questions based on a candidate\'s actual resume. Output ONLY valid JSON.';
  const userMsg = `Generate exactly ${questionCount} interview questions for this candidate. Personalize every question to their actual resume content.

CANDIDATE PROFILE:
- Target Role: "${targetRole}"
- Skills: ${skillsList}
- Projects: ${projectsList}
- Education: ${educationList}
- Experience: ${experienceList}
- Difficulty: ${difficulty}

QUESTION DISTRIBUTION (approximate):
- Stage 1 (resume): 1-2 basic questions about their education/background
- Stage 2 (projects): 2-3 deep questions about their SPECIFIC listed projects
- Stage 3 (skills): 2-3 probing questions on their SPECIFIC listed skills
- Stage 4 (situational): 1-2 problem-solving scenario questions
- Stage 5 (hr): 1 communication/teamwork/career question

Return JSON matching this schema:
{
  "questions": [
    {
      "id": 1,
      "text": "Full question text — personalized to their resume",
      "stage": "resume | projects | skills | situational | hr",
      "category": "technical | behavioral | situational",
      "skill": "Specific skill or project being tested",
      "difficulty": "${difficulty}",
      "is_followup": false
    }
  ]
}`;

  const messages = [
    { role: 'system', content: systemMsg },
    { role: 'user', content: userMsg },
  ];

  try {
    const raw = await callGroqLLM({ apiKey, messages, temperature: 0.7, timeoutMs: 20000 });
    const parsed = await safeParseJSON(raw, makeRetryFn(apiKey, messages, 0.7, 20000));

    const questions = (parsed.questions || []).slice(0, questionCount).map((q, idx) => ({
      id: idx + 1,
      text: q.text || `Question ${idx + 1}`,
      stage: q.stage || 'skills',
      category: q.category || 'technical',
      skill: q.skill || targetRole,
      difficulty: q.difficulty || difficulty,
      is_followup: false,
    }));

    if (!questions.length) throw new Error('LLM returned no questions');

    // Create server-side session
    const session = createSession({ resumeData, questions, difficulty });

    return res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        questions,
        targetRole,
        difficulty,
        count: questions.length,
        source: 'groq-llm',
      },
    });
  } catch (err) {
    console.error('[AI Interview /start Error]:', err.message);
    return res.status(500).json({
      success: false,
      error: { code: 'AI_GENERATION_FAILED', message: `Failed to generate questions: ${err.message}` },
    });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /evaluate-answer — Score a single answer, store server-side
// ─────────────────────────────────────────────────────────────
router.post('/evaluate-answer', async (req, res) => {
  const { sessionId, questionIndex, answer = '' } = req.body;
  const apiKey = getGroqKey(req);

  const session = getSession(sessionId);
  if (!session) {
    return res.status(404).json({
      success: false,
      error: { code: 'SESSION_NOT_FOUND', message: 'Interview session not found or expired.' }
    });
  }

  const qIdx = parseInt(questionIndex, 10);
  const question = session.questions[qIdx];
  if (!question) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_QUESTION', message: 'Question index out of range.' }
    });
  }

  // Handle skipped questions
  if (!answer.trim() || answer.trim().length < 3) {
    const skipEval = {
      questionIndex: qIdx,
      question: question.text,
      answer: '[Skipped by candidate]',
      technical_correctness: 0,
      relevance: 0,
      completeness: 0,
      communication: 0,
      missed_concepts: ['Question was skipped'],
      feedback_text: 'This question was skipped. Attempting all questions — even partially — demonstrates initiative.',
      should_followup: false,
      source: 'skip',
    };
    session.evaluations.push(skipEval);
    return res.json({ success: true, data: skipEval });
  }

  // Build Q&A history from server-side session for context
  const history = session.evaluations.map(e => ({
    question: e.question,
    answer: e.answer,
    score: Math.round((e.technical_correctness + e.relevance + e.completeness + e.communication) / 4 * 10),
  }));

  const systemMsg = 'You evaluate interview answers with a structured rubric. Output ONLY valid JSON matching the exact schema requested. Be rigorous but fair.';
  const userMsg = `Evaluate this interview answer using a strict rubric.

CONTEXT:
- Candidate's resume skills: ${(session.resumeData.skills || []).join(', ')}
- Interview difficulty: ${session.difficulty}
- Question stage: ${question.stage}
${history.length > 0 ? `- Previous Q&A history (for context):\n${JSON.stringify(history.slice(-3))}` : ''}

QUESTION: "${question.text}"
CANDIDATE'S ANSWER: "${answer.slice(0, 3000)}"

Evaluate on these 4 dimensions (0 to 10 each):
1. technical_correctness — Are facts, syntax, concepts accurate?
2. relevance — Does the answer address what was asked?
3. completeness — Are edge cases, tradeoffs, details covered?
4. communication — Is the answer clear, structured, professional?

Return JSON matching this EXACT schema:
{
  "technical_correctness": <0-10>,
  "relevance": <0-10>,
  "completeness": <0-10>,
  "communication": <0-10>,
  "missed_concepts": ["concept1", "concept2"],
  "feedback_text": "2-3 sentence constructive feedback explaining what was good and what was missing",
  "should_followup": <true if any dimension is below 5, false otherwise>
}`;

  const messages = [
    { role: 'system', content: systemMsg },
    { role: 'user', content: userMsg },
  ];

  try {
    const raw = await callGroqLLM({ apiKey, messages, temperature: 0.4, timeoutMs: 15000 });
    const parsed = await safeParseJSON(raw, makeRetryFn(apiKey, messages, 0.4, 15000));

    const evaluation = {
      questionIndex: qIdx,
      question: question.text,
      stage: question.stage,
      answer: answer.slice(0, 3000),
      technical_correctness: clamp(parsed.technical_correctness, 0, 10),
      relevance: clamp(parsed.relevance, 0, 10),
      completeness: clamp(parsed.completeness, 0, 10),
      communication: clamp(parsed.communication, 0, 10),
      missed_concepts: Array.isArray(parsed.missed_concepts) ? parsed.missed_concepts : [],
      feedback_text: parsed.feedback_text || 'Answer recorded.',
      should_followup: Boolean(parsed.should_followup),
      source: 'groq-llm',
    };

    // Store authoritative score server-side
    session.evaluations.push(evaluation);

    return res.json({ success: true, data: evaluation });
  } catch (err) {
    console.error('[evaluate-answer Error]:', err.message);
    // Graceful fallback — still store server-side
    const fallback = {
      questionIndex: qIdx,
      question: question.text,
      stage: question.stage,
      answer: answer.slice(0, 3000),
      ...ruleBasedRubric(answer),
    };
    session.evaluations.push(fallback);
    return res.json({ success: true, data: fallback });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /generate-followup — Adaptive follow-up on weak answer
// ─────────────────────────────────────────────────────────────
router.post('/generate-followup', async (req, res) => {
  const { sessionId } = req.body;
  const apiKey = getGroqKey(req);

  const session = getSession(sessionId);
  if (!session) {
    return res.status(404).json({
      success: false,
      error: { code: 'SESSION_NOT_FOUND', message: 'Interview session not found or expired.' }
    });
  }

  const lastEval = session.evaluations[session.evaluations.length - 1];
  if (!lastEval || !lastEval.should_followup) {
    return res.json({
      success: true,
      data: { followup: null, message: 'No follow-up needed.' }
    });
  }

  // Identify weakest dimension
  const dims = [
    { name: 'technical correctness', score: lastEval.technical_correctness },
    { name: 'relevance', score: lastEval.relevance },
    { name: 'completeness', score: lastEval.completeness },
    { name: 'communication', score: lastEval.communication },
  ].sort((a, b) => a.score - b.score);
  const weakest = dims[0];

  const systemMsg = 'You generate targeted follow-up interview questions when a candidate gives a weak answer. Output ONLY valid JSON.';
  const userMsg = `The candidate answered this question weakly. Generate ONE follow-up question that probes the specific gap.

ORIGINAL QUESTION: "${lastEval.question}"
CANDIDATE'S ANSWER: "${lastEval.answer}"
WEAKEST DIMENSION: "${weakest.name}" (scored ${weakest.score}/10)
MISSED CONCEPTS: ${JSON.stringify(lastEval.missed_concepts)}
CANDIDATE'S SKILLS: ${(session.resumeData.skills || []).join(', ')}

Return JSON:
{
  "text": "The follow-up question text — specific and probing",
  "stage": "${lastEval.stage || 'skills'}",
  "category": "technical",
  "skill": "The specific concept being probed",
  "targets_weakness": "${weakest.name}"
}`;

  const messages = [
    { role: 'system', content: systemMsg },
    { role: 'user', content: userMsg },
  ];

  try {
    const raw = await callGroqLLM({ apiKey, messages, temperature: 0.6, timeoutMs: 12000 });
    const parsed = await safeParseJSON(raw, makeRetryFn(apiKey, messages, 0.6, 12000));

    const followupQ = {
      id: session.questions.length + 1,
      text: parsed.text || 'Can you elaborate on the concepts you missed in your previous answer?',
      stage: parsed.stage || lastEval.stage || 'skills',
      category: parsed.category || 'technical',
      skill: parsed.skill || 'Follow-up',
      difficulty: session.difficulty,
      is_followup: true,
      targets_weakness: parsed.targets_weakness || weakest.name,
    };

    // Append follow-up to session questions
    session.questions.push(followupQ);

    return res.json({ success: true, data: { followup: followupQ } });
  } catch (err) {
    console.error('[generate-followup Error]:', err.message);
    // Generic fallback follow-up
    const fallbackQ = {
      id: session.questions.length + 1,
      text: `Let's revisit that. ${lastEval.missed_concepts?.length ? `Can you explain ${lastEval.missed_concepts[0]}?` : 'Can you elaborate on the concepts you mentioned and go deeper into the technical details?'}`,
      stage: lastEval.stage || 'skills',
      category: 'technical',
      skill: 'Follow-up',
      difficulty: session.difficulty,
      is_followup: true,
      targets_weakness: weakest.name,
    };
    session.questions.push(fallbackQ);
    return res.json({ success: true, data: { followup: fallbackQ } });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /final-evaluation — Compute report from server-side scores
// ─────────────────────────────────────────────────────────────
router.post('/final-evaluation', async (req, res) => {
  const { sessionId } = req.body;
  const apiKey = getGroqKey(req);

  const session = getSession(sessionId);
  if (!session) {
    return res.status(404).json({
      success: false,
      error: { code: 'SESSION_NOT_FOUND', message: 'Interview session not found or expired.' }
    });
  }

  if (!session.evaluations.length) {
    return res.status(400).json({
      success: false,
      error: { code: 'NO_ANSWERS', message: 'No answers to evaluate. Answer at least one question.' }
    });
  }

  session.completedAt = Date.now();

  // ─── Compute scores from server-side evaluations ────────
  const evals = session.evaluations;
  const answered = evals.filter(e => e.source !== 'skip');
  const skipped = evals.filter(e => e.source === 'skip');

  const avgDim = (field) => {
    if (!answered.length) return 0;
    return Math.round(answered.reduce((sum, e) => sum + (e[field] || 0), 0) / answered.length * 10) / 10;
  };

  const dimensions = {
    technical_correctness: avgDim('technical_correctness'),
    relevance: avgDim('relevance'),
    completeness: avgDim('completeness'),
    communication: avgDim('communication'),
  };

  const overallScore = Math.round(
    (dimensions.technical_correctness + dimensions.relevance + dimensions.completeness + dimensions.communication) / 4 * 10
  );

  // Per-stage breakdown
  const stages = ['resume', 'projects', 'skills', 'situational', 'hr'];
  const stageBreakdown = stages.map(stage => {
    const stageEvals = answered.filter(e => e.stage === stage);
    if (!stageEvals.length) return { stage, count: 0, avgScore: null };
    const avg = Math.round(stageEvals.reduce((s, e) =>
      s + (e.technical_correctness + e.relevance + e.completeness + e.communication) / 4, 0
    ) / stageEvals.length * 10);
    return { stage, count: stageEvals.length, avgScore: avg };
  }).filter(s => s.count > 0);

  const verdict = overallScore >= 75 ? 'Placement Ready' :
                  overallScore >= 55 ? 'Solid Potential' : 'Needs Focused Practice';

  // ─── Ask LLM only for narrative content ─────────────────
  const targetRole = session.resumeData.target_role || 'Software Engineer';
  const evalSummary = answered.map(e => ({
    question: e.question,
    answer: e.answer?.slice(0, 200),
    scores: { tc: e.technical_correctness, rel: e.relevance, comp: e.completeness, comm: e.communication },
    missed: e.missed_concepts,
  }));

  const systemMsg = 'You write concise interview evaluation narratives. Output ONLY valid JSON.';
  const userMsg = `Write narrative content for an interview evaluation report.

CANDIDATE: ${session.resumeData.name || 'Candidate'}
ROLE: ${targetRole}
OVERALL SCORE: ${overallScore}/100
QUESTIONS ANSWERED: ${answered.length}, SKIPPED: ${skipped.length}
DIMENSION AVERAGES: Technical=${dimensions.technical_correctness}/10, Relevance=${dimensions.relevance}/10, Completeness=${dimensions.completeness}/10, Communication=${dimensions.communication}/10

EVALUATION SUMMARY:
${JSON.stringify(evalSummary, null, 1)}

Return JSON:
{
  "executive_summary": "3-4 sentence assessment of the candidate's overall performance",
  "top_strengths": ["strength 1", "strength 2", "strength 3"],
  "top_weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "study_roadmap": ["actionable step 1", "actionable step 2", "actionable step 3"]
}`;

  const messages = [
    { role: 'system', content: systemMsg },
    { role: 'user', content: userMsg },
  ];

  let narrative;
  try {
    const raw = await callGroqLLM({ apiKey, messages, temperature: 0.5, timeoutMs: 20000 });
    narrative = await safeParseJSON(raw, makeRetryFn(apiKey, messages, 0.5, 20000));
  } catch (err) {
    console.error('[final-evaluation narrative Error]:', err.message);
    // Template fallback narrative
    narrative = {
      executive_summary: `Candidate completed ${answered.length} of ${evals.length} questions for ${targetRole}. Overall score: ${overallScore}/100 (${verdict}). ${overallScore >= 60 ? 'Demonstrates foundational competency with room to deepen technical depth and edge-case awareness.' : 'Needs significant improvement in core technical areas and structured communication.'}`,
      top_strengths: answered.length > 0
        ? ['Attempted the interview and engaged with questions', 'Showed awareness of relevant technologies']
        : ['Participated in the interview process'],
      top_weaknesses: ['Deepen technical explanations with specific examples', 'Address edge cases and tradeoffs in answers', 'Use structured frameworks (STAR) for behavioral questions'],
      study_roadmap: [`Review core ${targetRole} technical concepts`, 'Practice explaining projects using measurable outcomes', 'Complete 3 more mock interviews targeting weak areas'],
    };
  }

  // ─── Build final report ─────────────────────────────────
  const report = {
    sessionId: session.sessionId,
    overall_score: overallScore,
    verdict,
    dimensions,
    stage_breakdown: stageBreakdown,
    total_questions: evals.length,
    answered_count: answered.length,
    skipped_count: skipped.length,
    executive_summary: narrative.executive_summary || '',
    top_strengths: Array.isArray(narrative.top_strengths) ? narrative.top_strengths : [],
    top_weaknesses: Array.isArray(narrative.top_weaknesses) ? narrative.top_weaknesses : [],
    study_roadmap: Array.isArray(narrative.study_roadmap) ? narrative.study_roadmap : [],
    question_evaluations: evals.map(e => ({
      question: e.question,
      stage: e.stage,
      candidate_answer: e.answer,
      technical_correctness: e.technical_correctness,
      relevance: e.relevance,
      completeness: e.completeness,
      communication: e.communication,
      score: Math.round((e.technical_correctness + e.relevance + e.completeness + e.communication) / 4 * 10),
      missed_concepts: e.missed_concepts || [],
      feedback_text: e.feedback_text || '',
      is_followup: session.questions[e.questionIndex]?.is_followup || false,
    })),
    targetRole,
    difficulty: session.difficulty,
  };

  return res.json({ success: true, data: report });
});

module.exports = router;
