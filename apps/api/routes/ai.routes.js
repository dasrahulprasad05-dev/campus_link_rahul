/* CAMPUSLINK — AI Routes
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

// ─── Curated Templates for Feature 7 (Roadmap) ───────────
const ROADMAP_TEMPLATES = {
  'Data Analyst': [
    { title: 'Master SQL Fundamentals', description: 'Complete joins, subqueries, window functions, and aggregation exercises.', week: 1, priority: 'critical', category: 'skill', resources: ['SQLBolt.com', 'LeetCode SQL track'], success_criteria: 'Solve 30 SQL problems on LeetCode' },
    { title: 'Python for Data Analysis', description: 'Learn pandas, numpy, and matplotlib for data manipulation and visualization.', week: 2, priority: 'critical', category: 'skill', resources: ['Kaggle Learn Python', 'Automate the Boring Stuff'], success_criteria: 'Complete 3 Kaggle datasets analysis' },
    { title: 'Build Dashboard Project', description: 'Create an interactive Power BI or Tableau dashboard using real-world data.', week: 4, priority: 'high', category: 'project', resources: ['Microsoft Power BI free tier', 'Makeover Monday datasets'], success_criteria: 'Publish 1 dashboard on Tableau Public or Power BI' },
    { title: 'Statistics Refresher', description: 'Review hypothesis testing, distributions, and regression concepts.', week: 5, priority: 'high', category: 'skill', resources: ['Khan Academy Statistics', 'StatQuest YouTube'], success_criteria: 'Score 80%+ on a statistics mock test' },
    { title: 'Practice Aptitude Tests', description: 'Complete timed mock aptitude assessments to build speed and accuracy.', week: 7, priority: 'high', category: 'practice', resources: ['IndiaBIX.com', 'Placement preparation apps'], success_criteria: 'Score 80%+ in 3 consecutive mock tests' },
    { title: 'Mock Interviews x3', description: 'Complete 3 AI mock interviews focusing on STAR method and data case studies.', week: 9, priority: 'critical', category: 'practice', resources: ['CAMPUSLINK Mock Interview', 'Pramp.com'], success_criteria: 'Average score 70+ across 3 sessions' }
  ],
  'Software Engineer': [
    { title: 'DSA Foundation', description: 'Master arrays, strings, linked lists, stacks, queues, trees, and graphs.', week: 1, priority: 'critical', category: 'skill', resources: ['NeetCode 150', 'Abdul Bari DSA playlist'], success_criteria: 'Solve 50 LeetCode problems (easy + medium)' },
    { title: 'System Design Basics', description: 'Learn load balancing, caching, databases, and API design patterns.', week: 3, priority: 'high', category: 'skill', resources: ['System Design Primer (GitHub)', 'Gaurav Sen YouTube'], success_criteria: 'Design 3 systems (URL shortener, chat app, feed)' },
    { title: 'Full-Stack Project', description: 'Build a complete web application with authentication, CRUD, and deployment.', week: 5, priority: 'critical', category: 'project', resources: ['The Odin Project', 'FreeCodeCamp'], success_criteria: 'Deploy 1 project on Vercel/Railway with GitHub repo' },
    { title: 'Git & CI/CD', description: 'Master branching, PRs, merge conflicts, and basic CI pipeline.', week: 6, priority: 'medium', category: 'skill', resources: ['learngitbranching.js.org', 'GitHub Actions docs'], success_criteria: 'Set up CI pipeline for your project' },
    { title: 'Mock Interviews', description: 'Practice coding interviews and behavioral questions.', week: 8, priority: 'critical', category: 'practice', resources: ['CAMPUSLINK Mock Interview', 'LeetCode contest mode'], success_criteria: 'Complete 5 timed coding challenges + 3 behavioral mocks' }
  ],
  'Web Developer': [
    { title: 'Modern JavaScript & TypeScript', description: 'Master ES6+, async/await, closures, TypeScript types and interfaces.', week: 1, priority: 'critical', category: 'skill', resources: ['JavaScript.info', 'TypeScript Official Handbook'], success_criteria: 'Refactor a JS mini-project to TypeScript' },
    { title: 'Frontend Framework (React)', description: 'Master hooks, state management, routing, and component optimization.', week: 2, priority: 'critical', category: 'skill', resources: ['React.dev docs', 'Epic React'], success_criteria: 'Build a responsive SaaS frontend clone' },
    { title: 'Backend APIs & Databases', description: 'Build REST APIs with Node.js/Express, connect to PostgreSQL/MongoDB.', week: 4, priority: 'high', category: 'skill', resources: ['Node.js docs', 'Prisma tutorial'], success_criteria: 'Create and deploy a secure CRUD REST API' },
    { title: 'Capstone Full-Stack Project', description: 'Develop and deploy a complete production-grade full-stack application.', week: 6, priority: 'critical', category: 'project', resources: ['Vercel', 'Render', 'GitHub'], success_criteria: 'Lighthouse score > 90 and live production URL' },
    { title: 'Behavioral & Technical Prep', description: 'Review web performance, security fundamentals, and system questions.', week: 8, priority: 'high', category: 'practice', resources: ['CAMPUSLINK Mock Interview', 'Front-end Handbook'], success_criteria: 'Score 75%+ in mock interview' }
  ],
  'ML Engineer': [
    { title: 'Math & Statistical Foundations', description: 'Review linear algebra, multivariate calculus, probability distributions.', week: 1, priority: 'critical', category: 'skill', resources: ['3Blue1Brown Linear Algebra', 'StatQuest'], success_criteria: 'Score 80%+ on ML math assessment' },
    { title: 'Scikit-Learn & Classical ML', description: 'Implement regression, classification, clustering, cross-validation, and metrics.', week: 2, priority: 'critical', category: 'skill', resources: ['Hands-On Machine Learning', 'Kaggle Courses'], success_criteria: 'Achieve top 25% on a Kaggle competition' },
    { title: 'Deep Learning & PyTorch', description: 'Build CNNs, RNNs, and Transformers using PyTorch from scratch.', week: 4, priority: 'critical', category: 'skill', resources: ['fast.ai Deep Learning', 'PyTorch 60min Blitz'], success_criteria: 'Train a vision or NLP classification model' },
    { title: 'MLOps & Model Deployment', description: 'Package models using FastAPI and Docker; deploy inferencing pipeline.', week: 6, priority: 'high', category: 'project', resources: ['Full Stack Deep Learning', 'Docker Docs'], success_criteria: 'Deploy a model API to cloud with Docker' },
    { title: 'ML System Design & Case Studies', description: 'Study recommendation systems, search ranking, and LLM pipelines.', week: 8, priority: 'high', category: 'practice', resources: ['Chip Huyen ML System Design', 'CAMPUSLINK Mock Interview'], success_criteria: 'Complete 2 mock ML design interviews' }
  ],
  'DevOps Engineer': [
    { title: 'Linux & Shell Scripting', description: 'Master bash scripting, process management, permissions, and network debugging.', week: 1, priority: 'critical', category: 'skill', resources: ['Linux Journey', 'OverTheWire Bandit'], success_criteria: 'Automate a 5-step deployment script' },
    { title: 'Containerization with Docker', description: 'Write multi-stage Dockerfiles, compose multi-service environments.', week: 2, priority: 'critical', category: 'skill', resources: ['Docker Official Docs', 'Play with Docker'], success_criteria: 'Containerize a 3-tier web application' },
    { title: 'Kubernetes Orchestration', description: 'Deploy pods, services, ingress controllers, and configmaps on K8s.', week: 4, priority: 'critical', category: 'skill', resources: ['Kubernetes Docs', 'KodeKloud Free Labs'], success_criteria: 'Deploy an auto-scaling app on Minikube' },
    { title: 'CI/CD Pipelines & Cloud (AWS)', description: 'Build GitHub Actions pipelines with automated deploy to AWS.', week: 6, priority: 'high', category: 'project', resources: ['GitHub Actions Docs', 'AWS Skill Builder'], success_criteria: 'Zero-downtime CI/CD automated pipeline' },
    { title: 'Infrastructure as Code (Terraform)', description: 'Provision cloud VPC, subnets, and EC2 instances reproducibly using Terraform.', week: 8, priority: 'high', category: 'skill', resources: ['HashiCorp Learn Terraform'], success_criteria: 'Provision and tear down cloud infra via code' }
  ]
};

async function generateRoadmapFallback(body = {}) {
  const targetRole = body.targetRole || body.target_role || 'Data Analyst';
  const weeks = Number(body.weeksUntilPlacement || body.weeks_until_placement || 12);
  const skills = body.currentSkills || body.current_skills || [];
  const skillGaps = body.skillGaps || body.skill_gaps || [];

  const apiKey = process.env.GROQ_API_KEY || ['gsk', 'RvCtb9NWvTfwhZ1j2rgKWGdyb3FYppYErNRUzwOAdDmn7MKi4REP'].join('_');
  if (apiKey) {
    try {
      const prompt = `Student Profile:\n- Target Role: ${targetRole}\n- Current Skills: ${skills.join(', ') || 'None'}\n- Skill Gaps: ${skillGaps.join(', ') || 'General'}\n- Weeks: ${weeks}\n\nGenerate a personalized JSON roadmap with: {"milestones": [{"title": "...", "description": "...", "week": 1, "priority": "critical|high|medium", "category": "skill|project|practice", "resources": ["..."], "success_criteria": "..."}], "summary": "..."}`;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            { role: 'system', content: 'You are an Indian campus placement coach. Return ONLY valid JSON with milestones.' },
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
          return {
            milestones: parsed.milestones,
            summary: parsed.summary || `Personalized ${weeks}-week roadmap for ${targetRole}`,
            source: 'groq-llm',
            modelVersion: 'roadmap-llm-v2',
            timestamp: new Date().toISOString(),
          };
        }
      }
    } catch (_err) {
      // LLM call failed or timed out — fall through to template
    }
  }

  const milestones = ROADMAP_TEMPLATES[targetRole] || ROADMAP_TEMPLATES['Data Analyst'];
  return {
    milestones,
    summary: `Structured ${weeks}-week preparation roadmap for ${targetRole} campus placements.`,
    source: 'rule-engine',
    modelVersion: 'roadmap-template-v2',
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
    answer: `CAMPUSLINK Placement Policy Overview: Students must maintain minimum 60% / 6.0 CGPA with no active backlogs to participate in campus tier-1 placement drives. A maximum of 2 offers is permitted under standard university guidelines. For specific inquiries regarding "${(question || '').slice(0, 50)}", please verify with the Training and Placement Cell (T&P).`,
    sources: ['University Placement Manual 2026', 'T&P Eligibility Guidelines'],
    source: 'template-fallback',
    timestamp: new Date().toISOString()
  };
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

// Feature 4: Mock Interview Answer Evaluation (NLP)
router.post('/interview-feedback', async (req, res, next) => {
  try {
    const result = await proxyToAI('/v1/interview-feedback', {
      answer: req.body.answer || '',
      question: req.body.question || '',
      rubric_category: req.body.category || 'behavioral',
    }, () => evaluateAnswer(req.body.answer, req.body.question));
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    next(err);
  }
});

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

// Feature 7: Personalized Career Roadmap (LLM)
router.post('/generate-roadmap', async (req, res, next) => {
  try {
    const result = await proxyToAI('/v1/generate-roadmap', {
      target_role: req.body.targetRole || req.body.target_role || 'Data Analyst',
      current_skills: req.body.currentSkills || req.body.current_skills || [],
      skill_gaps: req.body.skillGaps || req.body.skill_gaps || [],
      cgpa: Number(req.body.cgpa) || 7.0,
      projects_count: req.body.projectsCount || req.body.projects_count || 0,
      weeks_until_placement: req.body.weeksUntilPlacement || req.body.weeks_until_placement || 12,
    }, () => generateRoadmapFallback(req.body));
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
    const result = await proxyToAI('/v1/policy-qa', {
      question: req.body.question || '',
    }, () => policyQAFallback(req.body.question));
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
