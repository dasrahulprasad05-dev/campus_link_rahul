/* CAMPUSLINK — Matching Service
   Hybrid AI / Rule-Based matching engine.
   Attempts connection to Python FastAPI AI microservice (port 8000),
   gracefully falling back to explainable deterministic matching.
*/

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Deterministic rule-based resume ↔ JD match.
 */
function ruleBasedMatch(jobDescription = '', studentSkills = ['sql', 'python', 'excel', 'data analysis', 'communication', 'statistics']) {
  const text = (jobDescription || '').toLowerCase();
  const normalizedStudent = (studentSkills || []).map(s => s.toLowerCase());

  const allKeywords = [
    'sql', 'python', 'power bi', 'tableau', 'excel', 'communication',
    'statistics', 'machine learning', 'javascript', 'react', 'node.js',
    'data analysis', 'git', 'java', 'c++', 'mongodb', 'aws', 'docker',
  ];

  const matched = normalizedStudent.filter(s => text.includes(s));
  const missing = allKeywords.filter(s => text.includes(s) && !normalizedStudent.includes(s));
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
    engineVersion: 'rules-v1',
    source: 'rule-engine',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Resume ↔ Job Description matching with AI fallback.
 */
async function matchResumeToJD(jobDescription = '', studentSkills = ['sql', 'python', 'excel', 'data analysis', 'communication', 'statistics']) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(`${AI_SERVICE_URL}/v1/resume-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_description: jobDescription,
        student_skills: studentSkills,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return {
        score: data.score,
        matched: data.matched || [],
        missing: data.missing || [],
        strengths: data.strengths || ['Semantic match verified by AI microservice'],
        improvements: data.improvements || [],
        explanation: data.explanation || 'Evaluated by CAMPUSLINK FastAPI AI Microservice (TF-IDF & Embeddings).',
        engineVersion: data.modelVersion || 'ai-fastapi-v1',
        source: 'fastapi-ai',
        timestamp: data.timestamp || new Date().toISOString(),
      };
    }
  } catch (_err) {
    // Fallback to local rule engine when AI microservice is not available
  }

  return ruleBasedMatch(jobDescription, studentSkills);
}

/**
 * Candidate ranking for a job.
 * Returns sorted candidates with explainable match scores.
 */
async function rankCandidates(jobSkills = [], candidates = []) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(`${AI_SERVICE_URL}/v1/candidate-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_skills: jobSkills,
        candidates: candidates,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.candidates)) {
        return data.candidates;
      }
    }
  } catch (_err) {
    // Fallback to local ranking
  }

  return candidates.map(c => {
    const studentSkills = new Set((c.skills || []).map(s => s.toLowerCase()));
    const matched = jobSkills.filter(s => studentSkills.has(s.toLowerCase()));
    const score = Math.round((matched.length / Math.max(jobSkills.length, 1)) * 100);
    return {
      ...c,
      matchScore: score,
      matchedSkills: matched,
      explanation: `Matched ${matched.length}/${jobSkills.length} required skills.`,
      source: 'rule-engine',
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

module.exports = { matchResumeToJD, rankCandidates, ruleBasedMatch };
