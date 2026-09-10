/* CAMPUSLINK — Database Integration Tests */
const test = require('node:test');
const assert = require('node:assert/strict');
const { query } = require('../db/pool');
const userRepo = require('../repositories/user.repository');
const jobRepo = require('../repositories/job.repository');
const appRepo = require('../repositories/application.repository');

test('DB: query execution returns valid structure', async () => {
  const res = await query('SELECT * FROM users');
  assert.ok(Array.isArray(res.rows), 'Query result must have rows array');
  assert.ok(typeof res.rowCount === 'number', 'Query result must have rowCount');
  assert.ok(res.rows.length >= 1, 'Default seed must contain users');
});

test('DB: parameterized query prevents SQL injection on user lookup', async () => {
  // Injection attempt should simply not find any user
  const injectionAttempt = "' OR '1'='1";
  const user = await userRepo.findByEmail(injectionAttempt);
  assert.equal(user, null, 'SQL injection input should return null user');
});

test('DB: job repository lists and inserts job records cleanly', async () => {
  const newJob = await jobRepo.createJob({
    title: 'DB Test Engineer',
    company: 'Database Systems Ltd',
    location: 'Remote',
    type: 'Full-time',
    skills: ['PostgreSQL', 'Node.js'],
  });

  assert.ok(newJob.id, 'Created job must have an id');
  assert.equal(newJob.title, 'DB Test Engineer');

  const allJobs = await jobRepo.listJobs({ search: 'DB Test' });
  assert.ok(allJobs.some(j => j.id === newJob.id), 'Newly created job must appear in listings');
});

test('DB: application repository tracks student application state transitions', async () => {
  const application = await appRepo.createApplication({
    studentId: 'u-1',
    jobId: 'job-1',
    job: 'Graduate Analyst',
    company: 'TechCorp',
    status: 'applied',
    round: 'Screening',
  });

  assert.ok(application.id);
  assert.equal(application.status, 'applied');

  const updated = await appRepo.updateStatus(application.id, 'interview', 'Technical Round 1');
  assert.equal(updated.status, 'interview');
  assert.equal(updated.round, 'Technical Round 1');
});
