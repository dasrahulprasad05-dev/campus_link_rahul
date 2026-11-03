/* CAMPUSGRID — AI Routes
   Proxy layer to Python FastAPI AI microservice.
   Each route forwards to the AI service and falls back to local services. */
const router = require('express').Router();
const { matchResumeToJD } = require('../services/matching.service');
const { analyzeSkillGap, calculateReadiness } = require('../services/readiness.service');
const { evaluateAnswer } = require('../services/interview.service');

let rawAiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
if (!rawAiUrl.startsWith('http://') && !rawAiUrl.startsWith('https://')) {
  rawAiUrl = rawAiUrl.includes('.') ? `https://${rawAiUrl}` : `http://${rawAiUrl}:10000`;
}
const AI_SERVICE_URL = rawAiUrl;

// Helper: proxy to Python AI service with fallback
async function proxyToAI(path, body, fallbackFn) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(`${AI_SERVICE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      return await res.json();
    }
  } catch (_err) {
    // AI service unavailable / timed out — use fallback
  }
  return fallbackFn ? await fallbackFn() : { error: 'AI service unavailable' };
}

// ─── Feature 7: AI-Generated Roadmap (Groq LLM only, no templates) ─────
async function generateRoadmapFallback(body = {}, req = null) {
  const targetRole = body.targetRole || body.target_role || 'Data Analyst';
  const weeks = Number(body.weeksUntilPlacement || body.weeks_until_placement || 12);
  const skills = body.currentSkills || body.current_skills || [];
  const skillGaps = body.skillGaps || body.skill_gaps || [];

  const customKey = req?.headers?.['x-groq-api-key'] || body.customApiKey;
  const apiKey = (customKey && typeof customKey === 'string' && customKey.trim().startsWith('gsk_'))
    ? customKey.trim()
    : (process.env.GROQ_API_KEY || null);

  if (apiKey) {
    try {
      const prompt = `Student Profile:\n- Target Role: ${targetRole}\n- Current Skills: ${skills.join(', ') || 'None'}\n- Skill Gaps: ${skillGaps.join(', ') || 'General'}\n- Weeks until placement: ${weeks}\n\nGenerate a highly personalized ${weeks}-week JSON roadmap. Include 5-8 milestones. Return ONLY valid JSON:\n{"milestones": [{"title": "...", "description": "...", "week": 1, "priority": "critical|high|medium", "category": "skill|project|practice", "resources": ["..."], "success_criteria": "..."}], "summary": "..."}`;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are an Indian campus placement coach specializing in personalized career roadmaps. Generate highly specific, actionable roadmaps based on the student profile. Return ONLY valid JSON with milestones array.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.5,
          response_format: { type: 'json_object' }
        }),
        signal: ctrl.signal
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
        if (Array.isArray(parsed.milestones) && parsed.milestones.length > 0) {
          const normalized = parsed.milestones.map((m, idx) => ({
            title: m.title || m.focus || m.milestone || `Milestone ${idx + 1}`,
            description: m.description || m.deliverable || m.details || '',
            week: m.week || (idx + 1),
            priority: m.priority || (idx < 3 ? 'critical' : 'high'),
            category: m.category || 'skill',
            resources: Array.isArray(m.resources) ? m.resources : (m.resources ? [m.resources] : []),
            success_criteria: m.success_criteria || m.deliverable || '',
          }));
          return {
            milestones: normalized,
            summary: parsed.summary || `Personalized ${weeks}-week roadmap for ${targetRole}`,
            source: 'groq-llm',
            modelVersion: 'roadmap-llm-v2',
            timestamp: new Date().toISOString(),
          };
        }
      } else {
        const errText = await res.text();
        console.warn(`[AI Routes] Groq roadmap API ${res.status}: ${errText}`);
      }
    } catch (_err) {
      console.warn('[AI Routes] Groq roadmap error:', _err.message);
    }
  }

  // AI unavailable — do NOT return ready-made templates
  return {
    milestones: [],
    summary: 'AI could not generate roadmap. AI is not fetching ready-made template of roadmap.',
    source: 'ai-unavailable',
    error: 'AI could not generate roadmap. AI is not fetching ready-made template of roadmap.',
    modelVersion: 'none',
    timestamp: new Date().toISOString(),
  };
}

function atRiskFallback(body = {}) {
  const readiness = Number(body.readiness_score || 60);
  const trend = Number(body.readiness_trend || 0);
  const inactive = Number(body.days_inactive || 0);
  const isAtRisk = readiness < 55 || trend < -5 || inactive > 7;
  return {
    is_at_risk: isAtRisk,
    risk_level: readiness < 45 ? 'high' : isAtRisk ? 'medium' : 'low',
    risk_factors: [
      ...(readiness < 55 ? ['Readiness score below target threshold (55)'] : []),
      ...(trend < 0 ? ['Declining readiness score trend'] : []),
      ...(inactive > 5 ? [`Inactive for ${inactive} days`] : [])
    ],
    recommendations: [
      'Complete mock aptitude and coding assessments',
      'Schedule 1-on-1 placement mentor guidance',
      'Update profile projects and verify certifications'
    ],
    source: 'rule-engine',
    timestamp: new Date().toISOString()
  };
}

function policyQAFallback(question = '') {
  return {
    answer: `CAMPUSGRID Placement Policy Overview: Students must maintain minimum 60% / 6.0 CGPA with no active backlogs to participate in campus tier-1 placement drives. A maximum of 2 offers is permitted under standard university guidelines. For specific inquiries regarding "${(question || '').slice(0, 50)}", please verify with the Training and Placement Cell (T&P).`,
    sources: ['University Placement Manual 2026', 'T&P Eligibility Guidelines'],
    source: 'template-fallback',
    timestamp: new Date().toISOString()
  };
}

// Feature 3: Resume ↔ JD Matcher (NLP)
async function handleResumeMatchRoute(req, res, next) {
  try {
    const jobDescription = req.body.jobDescription || req.body.job_description || '';
    const studentSkills = req.body.studentSkills || req.body.student_skills || [];
    const resumeText = req.body.resumeText || req.body.resume_text || '';

    const result = await proxyToAI('/v1/resume-match', {
      job_description: jobDescription,
      student_skills: studentSkills,
      resume_text: resumeText,
    }, () => matchResumeToJD(jobDescription, studentSkills));

    const score = result.match_score ?? result.score ?? 70;
    const matched = result.matched_skills ?? result.matched ?? [];
    const missing = result.missing_skills ?? result.missing ?? [];
    const recommendations = result.recommendations ?? result.improvements ?? [];

    const normalized = {
      ...result,
      match_score: score,
      score: score,
      matched_skills: matched,
      matched: matched,
      missing_skills: missing,
      missing: missing,
      recommendations: recommendations,
      improvements: recommendations,
    };

    res.json({ success: true, data: normalized, ...normalized });
  } catch (err) {
    next(err);
  }
}

router.post('/resume-match', handleResumeMatchRoute);
router.post('/analyze-resume', handleResumeMatchRoute);

// Feature 2: Skill-Gap Analysis (NLP)
router.post('/skill-gap', async (req, res, next) => {
  try {
    const result = await proxyToAI('/v1/skill-gap', {
      target_role: req.body.targetRole || req.body.target_role || 'Data Analyst',
      skills: req.body.skills || [],
    }, () => analyzeSkillGap(req.body.targetRole, req.body.skills));
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    next(err);
  }
});

// Feature 1: Readiness Score (Hybrid ML)
router.post('/readiness-score', async (req, res, next) => {
  try {
    const result = await proxyToAI('/v1/readiness-score', {
      skills: req.body.skills || [],
      cgpa: Number(req.body.cgpa) || 7.0,
      projects_count: req.body.projectsCount || req.body.projects_count || 0,
      aptitude_score: Number(req.body.aptitudeScore || req.body.aptitude_score) || 60,
      interview_score: Number(req.body.interviewScore || req.body.interview_score) || 0,
    }, () => calculateReadiness(req.body));
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    next(err);
  }
});

// Feature 4: Mock Interview Answer Evaluation (NLP / STAR)
async function handleInterviewFeedbackRoute(req, res, next) {
  try {
    const answer = req.body.answer || '';
    const question = req.body.question || '';
    const role = req.body.role || req.body.target_role || req.body.targetRole || 'Software Engineer';
    const category = req.body.category || req.body.rubric_category || 'behavioral';

    const result = await proxyToAI('/v1/interview-feedback', {
      answer,
      question,
      role,
      target_role: role,
      rubric_category: category,
    }, () => evaluateAnswer(answer, question));

    const score = result.score ?? 75;
    const feedback = result.feedback || 'Good structured response.';
    const modelAnswer = result.suggested_answer || result.model_answer || 'In my previous project, we encountered latency bottlenecks...';
    const starAlignment = result.star_alignment || {
      situation: result.strengths?.[0] || 'Clear context provided regarding the problem statement.',
      task: 'Defined individual responsibility and objective.',
      action: result.strengths?.[1] || 'Described technical steps and implementation strategy.',
      result: result.improvements?.[0] || 'Strong answer with clear impact.',
    };

    const normalized = {
      ...result,
      score,
      feedback,
      suggested_answer: modelAnswer,
      model_answer: modelAnswer,
      star_alignment: starAlignment,
    };

    res.json({ success: true, data: normalized, ...normalized });
  } catch (err) {
    next(err);
  }
}

router.post('/interview-feedback', handleInterviewFeedbackRoute);
router.post('/evaluate-interview', handleInterviewFeedbackRoute);

// Feature 5: Question Generator
router.post('/generate-questions', async (req, res, next) => {
  try {
    const result = await proxyToAI('/v1/generate-questions', {
      role: req.body.role || 'Software Engineer',
      skills: req.body.skills || [],
      difficulty: req.body.difficulty || 'medium',
      count: req.body.count || 5,
    });
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    next(err);
  }
});

// Feature 7: Personalized Career Roadmap (AI-only via Groq LLM)
router.post('/generate-roadmap', async (req, res, next) => {
  try {
    // Call Groq LLM directly for fast live AI generation (fallback to microservice if enabled)
    let result = null;
    if (process.env.AI_SERVICE_ENABLED === 'true') {
      result = await proxyToAI('/v1/generate-roadmap', {
        target_role: req.body.targetRole || req.body.target_role || 'Data Analyst',
        current_skills: req.body.currentSkills || req.body.current_skills || [],
        skill_gaps: req.body.skillGaps || req.body.skill_gaps || [],
        cgpa: Number(req.body.cgpa) || 7.0,
        projects_count: req.body.projectsCount || req.body.projects_count || 0,
        weeks_until_placement: req.body.weeksUntilPlacement || req.body.weeks_until_placement || 4,
      }, () => generateRoadmapFallback(req.body, req));
    } else {
      result = await generateRoadmapFallback(req.body, req);
    }
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    next(err);
  }
});

// Feature 9: Early Warning At-Risk System (ML)
router.post('/at-risk', async (req, res, next) => {
  try {
    const result = await proxyToAI('/v1/at-risk', {
      readiness_score: Number(req.body.readinessScore || req.body.readiness_score) || 60,
      readiness_trend: Number(req.body.readinessTrend || req.body.readiness_trend) || 0,
      days_inactive: Number(req.body.daysInactive || req.body.days_inactive) || 0,
      profile_completion: Number(req.body.profileCompletion || req.body.profile_completion) || 70,
      applications_count: Number(req.body.applicationsCount || req.body.applications_count) || 0,
      cgpa: Number(req.body.cgpa) || 7.0,
      aptitude_score: Number(req.body.aptitudeScore || req.body.aptitude_score) || 65,
      interview_score: Number(req.body.interviewScore || req.body.interview_score) || 0,
    }, () => atRiskFallback(req.body));
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    next(err);
  }
});

// Feature 10: Placement Policy Q&A (RAG)
router.post('/policy-qa', async (req, res, next) => {
  try {
    const questionText = req.body.question || req.body.query || '';
    const result = await proxyToAI('/v1/policy-qa', {
      question: questionText,
    }, () => policyQAFallback(questionText));
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
