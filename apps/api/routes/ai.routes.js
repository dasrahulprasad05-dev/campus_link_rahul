/* CAMPUSLINK — AI Routes
   Proxy layer to Python FastAPI AI microservice.
   Each route forwards to the AI service and falls back to local services. */
const router = require('express').Router();
const { matchResumeToJD } = require('../services/matching.service');
const { analyzeSkillGap, calculateReadiness } = require('../services/readiness.service');
const { evaluateAnswer } = require('../services/interview.service');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Helper: proxy to Python AI service with fallback
async function proxyToAI(path, body, fallbackFn) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
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
    // AI service unavailable — use fallback
  }
  return fallbackFn ? await fallbackFn() : { error: 'AI service unavailable' };
}

// Feature 3: Resume ↔ JD Matcher (NLP)
router.post('/resume-match', async (req, res, next) => {
  try {
    const result = await proxyToAI('/v1/resume-match', {
      job_description: req.body.jobDescription || req.body.job_description || '',
      student_skills: req.body.studentSkills || req.body.student_skills || [],
    }, () => matchResumeToJD(req.body.jobDescription || '', req.body.studentSkills));
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    next(err);
  }
});

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

// Feature 4: AI Mock Interview Coach (LLM)
router.post('/interview-feedback', async (req, res, next) => {
  try {
    const result = await proxyToAI('/v1/interview-feedback', {
      answer: req.body.answer || '',
      question: req.body.question || '',
      target_role: req.body.targetRole || req.body.target_role || 'General',
    }, () => evaluateAnswer(req.body.answer || '', req.body.question || ''));
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    next(err);
  }
});

// Feature 1: Placement Readiness (ML)
router.post('/readiness', async (req, res, next) => {
  try {
    const result = await proxyToAI('/v1/readiness', {
      skills: req.body.skills || [],
      projects_count: req.body.projectsCount || req.body.projects_count || 0,
      cgpa: Number(req.body.cgpa) || 7.0,
      aptitude_score: Number(req.body.aptitudeScore || req.body.aptitude_score) || 65,
      profile_completion: Number(req.body.profileCompletion || req.body.profile_completion) || 70,
    }, () => calculateReadiness(req.body));
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    next(err);
  }
});

// Feature 5: Adaptive Question Generator (LLM) — NEW
router.post('/generate-questions', async (req, res, next) => {
  try {
    const result = await proxyToAI('/v1/generate-questions', {
      target_role: req.body.targetRole || req.body.target_role || 'General',
      skill_gaps: req.body.skillGaps || req.body.skill_gaps || [],
      current_skills: req.body.currentSkills || req.body.current_skills || [],
      difficulty: req.body.difficulty || 'medium',
      count: req.body.count || 5,
    });
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    next(err);
  }
});

// Feature 7: Personalized Career Roadmap (LLM) — NEW
router.post('/generate-roadmap', async (req, res, next) => {
  try {
    const result = await proxyToAI('/v1/generate-roadmap', {
      target_role: req.body.targetRole || req.body.target_role || 'Data Analyst',
      current_skills: req.body.currentSkills || req.body.current_skills || [],
      skill_gaps: req.body.skillGaps || req.body.skill_gaps || [],
      cgpa: Number(req.body.cgpa) || 7.0,
      projects_count: req.body.projectsCount || req.body.projects_count || 0,
      weeks_until_placement: req.body.weeksUntilPlacement || req.body.weeks_until_placement || 12,
    });
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    next(err);
  }
});

// Feature 9: Early Warning At-Risk System (ML) — NEW
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
    });
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    next(err);
  }
});

// Feature 10: Placement Policy Q&A (RAG) — NEW
router.post('/policy-qa', async (req, res, next) => {
  try {
    const result = await proxyToAI('/v1/policy-qa', {
      question: req.body.question || '',
    });
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
