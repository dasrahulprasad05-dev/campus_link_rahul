/* CAMPUSLINK — API Tests */
const test = require('node:test');
const assert = require('node:assert/strict');

const { matchResumeToJD, rankCandidates } = require('../services/matching.service');
const { analyzeSkillGap, calculateReadiness } = require('../services/readiness.service');
const { evaluateAnswer } = require('../services/interview.service');
const { checkConflicts } = require('../services/scheduler.service');

// Resume Matching
test('resume matching produces explainable results', () => {
  const result = matchResumeToJD('SQL Python Power BI communication data analysis');
  assert.ok(result.score >= 50, 'Score should be >= 50 for good match');
  assert.ok(result.matched.length > 0, 'Should have matched skills');
  assert.ok(result.explanation.length > 20, 'Should have explanation');
  assert.ok(result.engineVersion, 'Should have engine version');
});

test('resume matching handles empty input', () => {
  const result = matchResumeToJD('');
  assert.ok(result.score >= 20, 'Score should be at least 20');
  assert.ok(Array.isArray(result.matched), 'Matched should be an array');
});

// Skill Gap
test('skill gap identifies missing skills', () => {
  const result = analyzeSkillGap('Data Analyst', ['SQL', 'Python']);
  assert.ok(result.missing.length > 0, 'Should have missing skills');
  assert.ok(result.matched.length >= 2, 'Should have matched SQL and Python');
  assert.equal(result.targetRole, 'Data Analyst');
});

test('skill gap handles unknown role', () => {
  const result = analyzeSkillGap('Unknown Role', []);
  assert.ok(result.missing.length > 0, 'Should fallback to default skills');
});

// Readiness
test('readiness score is between 0 and 100', () => {
  const result = calculateReadiness({ skills: ['SQL'], projects: [{}], cgpa: 8.0 });
  assert.ok(result.score >= 0 && result.score <= 100, `Score ${result.score} should be 0-100`);
  assert.ok(result.factors.length === 5, 'Should have 5 factors');
});

// Interview
test('interview evaluates short answers differently than detailed ones', () => {
  const short = evaluateAnswer('I used data.');
  const detailed = evaluateAnswer('In my previous project, I analyzed sales data using SQL queries to identify declining product categories. I created a dashboard in Power BI that helped the team reduce forecast error by 15%. The situation was challenging because we had missing data in 20% of records.');
  assert.ok(detailed.score > short.score, 'Detailed answer should score higher');
  assert.ok(detailed.strengths.length > 0, 'Should identify strengths');
});

// Scheduler
test('scheduler detects venue conflicts', () => {
  const result = checkConflicts([
    { venue: 'Hall A', start: 900, end: 1100 },
    { venue: 'Hall A', start: 1000, end: 1200 },
  ]);
  assert.equal(result.valid, false, 'Should detect conflict');
  assert.equal(result.conflicts.length, 1, 'Should have 1 conflict');
});

test('scheduler allows non-overlapping events', () => {
  const result = checkConflicts([
    { venue: 'Hall A', start: 900, end: 1000 },
    { venue: 'Hall A', start: 1000, end: 1100 },
  ]);
  assert.equal(result.valid, true, 'Should be valid');
});

test('scheduler allows same-time different venues', () => {
  const result = checkConflicts([
    { venue: 'Hall A', start: 900, end: 1100 },
    { venue: 'Hall B', start: 900, end: 1100 },
  ]);
  assert.equal(result.valid, true, 'Different venues should not conflict');
});
