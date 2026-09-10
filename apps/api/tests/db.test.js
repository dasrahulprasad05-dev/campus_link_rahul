/* CAMPUSLINK — Database Integration Tests (Strict Schema Alignment) */
const test = require('node:test');
const assert = require('node:assert/strict');
const { query } = require('../db/pool');
const userRepo = require('../repositories/user.repository');
const jobRepo = require('../repositories/job.repository');
const appRepo = require('../repositories/application.repository');
const compRepo = require('../repositories/company.repository');
const driveRepo = require('../repositories/drive.repository');

test('DB: query execution returns valid structure', async () => {
  const res = await query('SELECT * FROM users');
  assert.ok(Array.isArray(res.rows), 'Query result must have rows array');
  assert.ok(typeof res.rowCount === 'number', 'Query result must have rowCount');
  assert.ok(res.rows.length >= 1, 'Default seed must contain users');
});

test('DB: parameterized query prevents SQL injection on user lookup', async () => {
  const injectionAttempt = "' OR '1'='1";
  const user = await userRepo.findByEmail(injectionAttempt);
  assert.equal(user, null, 'SQL injection input should return null user');
});

test('DB: job repository lists and inserts job records cleanly according to schema', async () => {
  const newJob = await jobRepo.createJob({
    title: 'DB Test Engineer',
    company: 'Database Systems Ltd',
    location: 'Remote',
    type: 'Full-time',
    skills_required: ['PostgreSQL', 'Node.js'],
  });

  assert.ok(newJob.id, 'Created job must have an id');
  assert.equal(newJob.title, 'DB Test Engineer');
  assert.ok(Array.isArray(newJob.skills_required), 'Job must contain skills_required array');
  assert.equal(newJob.skills_required[0], 'PostgreSQL');
  assert.ok(newJob.company_name, 'Job must have company_name joined from companies table');

  const allJobs = await jobRepo.listJobs({ search: 'DB Test' });
  assert.ok(allJobs.some(j => j.id === newJob.id), 'Newly created job must appear in listings');
});

test('DB: application repository tracks student application state transitions according to schema', async () => {
  const application = await appRepo.createApplication({
    student_id: 'sp-1',
    job_id: 'job-1',
    status: 'applied',
    current_round: 'Screening',
  });

  assert.ok(application.id);
  assert.equal(application.status, 'applied');
  assert.equal(application.current_round, 'Screening');
  assert.ok(application.applied_at, 'Application must have applied_at timestamp');

  const updated = await appRepo.updateStatus(application.id, 'interview', 'Technical Round 1');
  assert.equal(updated.status, 'interview');
  assert.equal(updated.current_round, 'Technical Round 1');
  assert.ok(updated.updated_at, 'Application must record updated_at timestamp');
});

test('DB: company and drive repositories conform to schema', async () => {
  const company = await compRepo.createCompany({
    name: 'QuantumScale Inc',
    industry: 'Cloud Infrastructure',
    website: 'https://quantumscale.test',
  });
  assert.ok(company.id);
  assert.equal(company.name, 'QuantumScale Inc');

  const drive = await driveRepo.createDrive({
    company_id: company.id,
    role: 'Cloud Architect Intern',
    venue: 'Seminar Hall 3',
    min_cgpa: 8.0,
    branches: ['CSE', 'IT'],
  });
  assert.ok(drive.id);
  assert.equal(drive.company_id, company.id);
  assert.ok(Array.isArray(drive.branches));
});
