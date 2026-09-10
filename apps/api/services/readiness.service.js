/* CAMPUSLINK — Readiness Service */

const ROLE_SKILLS = {
  'Data Analyst': ['SQL', 'Python', 'Power BI', 'Statistics', 'Communication', 'Excel', 'Data Visualization'],
  'Software Engineer': ['DSA', 'Git', 'REST APIs', 'Databases', 'Testing', 'System Design', 'JavaScript'],
  'ML Engineer': ['Python', 'PyTorch', 'Statistics', 'Linear Algebra', 'MLOps', 'SQL'],
  'Web Developer': ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Git', 'REST APIs'],
};

function analyzeSkillGap(targetRole = 'Data Analyst', currentSkills = []) {
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
    timestamp: new Date().toISOString(),
  };
}

function calculateReadiness(profile) {
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
    timestamp: new Date().toISOString(),
  };
}

module.exports = { analyzeSkillGap, calculateReadiness };
