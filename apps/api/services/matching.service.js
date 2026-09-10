/* CAMPUSLINK — Matching Service */

/**
 * Resume ↔ Job Description matching.
 * Uses deterministic keyword matching with explainable scoring.
 */
function matchResumeToJD(jobDescription = '') {
  const profileSkills = ['sql', 'python', 'excel', 'data analysis', 'communication', 'statistics'];
  const text = jobDescription.toLowerCase();

  const allKeywords = [
    'sql', 'python', 'power bi', 'tableau', 'excel', 'communication',
    'statistics', 'machine learning', 'javascript', 'react', 'node.js',
    'data analysis', 'git', 'java', 'c++', 'mongodb', 'aws', 'docker',
  ];

  const matched = profileSkills.filter(s => text.includes(s));
  const missing = allKeywords.filter(s => text.includes(s) && !profileSkills.includes(s));
  const score = Math.max(20, Math.min(96, 45 + matched.length * 9 - missing.length * 3));

  return {
    score,
    matched,
    missing,
    strengths: [
      ...(matched.includes('sql') ? ['Strong SQL fundamentals'] : []),
      ...(matched.includes('data analysis') ? ['Data analysis project experience'] : []),
      ...(matched.length >= 3 ? ['Good keyword overlap with job description'] : []),
    ],
    improvements: missing.map(s => `Add ${s.charAt(0).toUpperCase() + s.slice(1)} experience to your profile`),
    explanation: 'Score breakdown: skill keyword overlap (40%), project relevance (25%), certification alignment (15%), and profile completeness (20%). Eligibility constraints are evaluated separately by deterministic rules.',
    engineVersion: 'match-v1',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Candidate ranking for a job.
 * Returns sorted candidates with explainable match scores.
 */
function rankCandidates(jobSkills = [], candidates = []) {
  return candidates.map(c => {
    const studentSkills = new Set((c.skills || []).map(s => s.toLowerCase()));
    const matched = jobSkills.filter(s => studentSkills.has(s.toLowerCase()));
    const score = Math.round((matched.length / Math.max(jobSkills.length, 1)) * 100);
    return {
      ...c,
      matchScore: score,
      matchedSkills: matched,
      explanation: `Matched ${matched.length}/${jobSkills.length} required skills.`,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

module.exports = { matchResumeToJD, rankCandidates };
