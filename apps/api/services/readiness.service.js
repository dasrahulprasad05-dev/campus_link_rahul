/* CAMPUSLINK — Readiness Service
   Hybrid AI / Rule-Based student readiness and skill-gap engine.
   Attempts connection to Python FastAPI AI microservice (port 8000),
   falling back to explainable deterministic calculation.
*/

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const ROLE_SKILLS = {
  'Data Analyst': ['SQL', 'Python', 'Power BI', 'Statistics', 'Communication', 'Excel', 'Data Visualization'],
  'Software Engineer': ['DSA', 'Git', 'REST APIs', 'Databases', 'Testing', 'System Design', 'JavaScript'],
  'ML Engineer': ['Python', 'PyTorch', 'Statistics', 'Linear Algebra', 'MLOps', 'SQL'],
  'Web Developer': ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Git', 'REST APIs'],
  'DevOps Engineer': ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform'],
};

/**
 * Deterministic skill-gap analysis.
 */
function ruleBasedSkillGap(targetRole = 'Data Analyst', currentSkills = []) {
  const target = ROLE_SKILLS[targetRole] || ROLE_SKILLS['Data Analyst'];
  const have = new Set((currentSkills || []).map(s => s.toLowerCase()));

  const missing = target
    .filter(s => !have.has(s.toLowerCase()))
    .map((name, i) => ({
      name,
      priority: i < 2 ? 'high' : 'medium',
      reason: `${name} is a core requirement for ${targetRole} roles and appears in 80%+ of job descriptions.`,
      resource: `Search "${name} tutorial" on YouTube or Coursera`,
    }));

  const matched = target.filter(s => have.has(s.toLowerCase()));

  return {
    targetRole,
    missing,
    matched,
    engineVersion: 'rules-v1',
    source: 'rule-engine',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Skill-gap analysis with FastAPI AI microservice fallback.
 */
async function analyzeSkillGap(targetRole = 'Data Analyst', currentSkills = []) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(`${AI_SERVICE_URL}/v1/skill-gap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_role: targetRole,
        skills: currentSkills || [],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return {
        targetRole: data.targetRole,
        missing: (data.missing || []).map(m => ({
          name: m.skill || m.name,
          priority: m.priority,
          reason: m.reason,
          resource: m.resource,
        })),
        matched: data.matched || [],
        engineVersion: data.modelVersion || 'ai-fastapi-v1',
        source: 'fastapi-ai',
        timestamp: data.timestamp || new Date().toISOString(),
      };
    }
  } catch (_err) {
    // Fallback to rule engine
  }

  return ruleBasedSkillGap(targetRole, currentSkills);
}

/**
 * Deterministic readiness score calculation.
 */
function ruleBasedReadiness(profile = {}) {
  const factors = [
    { label: 'Technical Skills', value: Math.min(100, (profile.skills?.length || 0) * 14), weight: 0.30 },
    { label: 'Projects & Portfolio', value: Math.min(100, (profile.projects?.length || 0) * 38), weight: 0.25 },
    { label: 'Academics (CGPA)', value: Math.min(100, ((profile.cgpa || 6) / 10) * 100), weight: 0.20 },
    { label: 'Aptitude & Reasoning', value: profile.aptitudeScore || 65, weight: 0.15 },
    { label: 'Profile Completeness', value: profile.profileCompletion || 70, weight: 0.10 },
  ];

  const score = Math.round(factors.reduce((sum, f) => sum + f.value * f.weight, 0));

  return {
    score,
    factors: factors.map(f => ({ label: f.label, value: Math.round(f.value) })),
    explanation: 'Composite score from: Technical Skills (30%), Projects (25%), Academics (20%), Aptitude (15%), Profile (10%).',
    engineVersion: 'readiness-v1',
    source: 'rule-engine',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Composite readiness scoring with AI fallback.
 */
async function calculateReadiness(profile = {}) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(`${AI_SERVICE_URL}/v1/readiness`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skills: profile.skills || [],
        projects_count: profile.projects?.length || 0,
        cgpa: Number(profile.cgpa) || 7.0,
        aptitude_score: Number(profile.aptitudeScore) || 65,
        profile_completion: Number(profile.profileCompletion) || 70,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return {
        score: data.score,
        factors: data.factors,
        explanation: data.explanation || 'Evaluated by CAMPUSLINK AI Microservice multi-factor model.',
        engineVersion: data.modelVersion || 'ai-fastapi-v1',
        source: 'fastapi-ai',
        timestamp: data.timestamp || new Date().toISOString(),
      };
    }
  } catch (_err) {
    // Fallback to rule engine
  }

  return ruleBasedReadiness(profile);
}

module.exports = {
  analyzeSkillGap,
  calculateReadiness,
  ruleBasedSkillGap,
  ruleBasedReadiness,
  ROLE_SKILLS,
};
