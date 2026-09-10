/* CAMPUSLINK — Role-Based Access Control (RBAC) Security Tests */
const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server');
const { generateToken } = require('../middleware/auth');

function getAuthToken(role) {
  if (role === 'admin') {
    return generateToken({ id: 'a1b2c3d4-0001-0001-0001-000000000002', name: 'Dr. Rajesh Nayak', email: 'admin@campuslink.in', role: 'admin' });
  }
  if (role === 'recruiter') {
    return generateToken({ id: 'a1b2c3d4-0001-0001-0001-000000000003', name: 'Sneha Patel', email: 'recruiter@campuslink.in', role: 'recruiter' });
  }
  if (role === 'mentor') {
    return generateToken({ id: 'a1b2c3d4-0001-0001-0001-000000000004', name: 'Prof. Suresh Mishra', email: 'mentor@campuslink.in', role: 'mentor' });
  }
  return generateToken({ id: 'a1b2c3d4-0001-0001-0001-000000000001', name: 'Ananya Sharma', email: 'student@campuslink.in', role: 'student' });
}

test('RBAC: Student cannot create a job posting (403 Forbidden)', async () => {
  const studentToken = await getAuthToken('student');
  const res = await request(app)
    .post('/api/v1/jobs')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({
      title: 'Hacked Job Posting',
      company: 'Unauthorized Inc',
      location: 'Remote',
      type: 'Full-time',
    });

  assert.equal(res.status, 403, `Expected 403 Forbidden, got ${res.status}`);
  assert.equal(res.body.success, false);
  assert.equal(res.body.error.code, 'FORBIDDEN');
});

test('RBAC: Recruiter can create a job posting (201 Created)', async () => {
  const recruiterToken = await getAuthToken('recruiter');
  const res = await request(app)
    .post('/api/v1/jobs')
    .set('Authorization', `Bearer ${recruiterToken}`)
    .send({
      title: 'Full Stack Engineer',
      company: 'TechCorp Ventures',
      location: 'Bhubaneswar',
      type: 'Full-time',
      skills: ['Node.js', 'React', 'PostgreSQL'],
      ctcLpa: 12.5,
    });

  assert.equal(res.status, 201, `Expected 201 Created, got ${res.status}`);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data.id);
});

test('RBAC: Student cannot access institute analytics (403 Forbidden)', async () => {
  const studentToken = await getAuthToken('student');
  const res = await request(app)
    .get('/api/v1/analytics/kpis')
    .set('Authorization', `Bearer ${studentToken}`);

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
});

test('RBAC: Admin can access institute analytics (200 OK)', async () => {
  const adminToken = await getAuthToken('admin');
  const res = await request(app)
    .get('/api/v1/analytics/kpis')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data);
});

test('RBAC: Recruiter cannot submit a student application (403 Forbidden)', async () => {
  const recruiterToken = await getAuthToken('recruiter');
  const res = await request(app)
    .post('/api/v1/applications')
    .set('Authorization', `Bearer ${recruiterToken}`)
    .send({
      jobId: 'job-1',
    });

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
});

test('RBAC: Student cannot update application hiring status (403 Forbidden)', async () => {
  const studentToken = await getAuthToken('student');
  const res = await request(app)
    .patch('/api/v1/applications/app-1/status')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({
      status: 'offered',
    });

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
});

test('RBAC: Unauthenticated request to protected route returns 401 Unauthorized', async () => {
  const res = await request(app).get('/api/v1/analytics/kpis');
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test('RBAC: Unauthenticated request to /dashboard returns 401 Unauthorized', async () => {
  const res = await request(app).get('/api/v1/dashboard');
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test('RBAC: Student requesting admin dashboard is scoped strictly to student data', async () => {
  const studentToken = getAuthToken('student');
  const res = await request(app)
    .get('/api/v1/dashboard?role=admin')
    .set('Authorization', `Bearer ${studentToken}`);

  assert.equal(res.status, 200);
  assert.ok(res.body.kpis);
  // Student dashboard has Readiness Score KPI, Admin dashboard does not have it as first KPI
  assert.equal(res.body.kpis[0].label, 'Readiness Score');
});

test('RBAC: Mentor cannot access cross-company application pipelines (403 Forbidden)', async () => {
  const mentorToken = getAuthToken('mentor');
  const res = await request(app)
    .get('/api/v1/applications')
    .set('Authorization', `Bearer ${mentorToken}`);

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
});

test('Validation: Student application requires valid job ID (400 on missing job)', async () => {
  const studentToken = getAuthToken('student');
  const res = await request(app)
    .post('/api/v1/applications')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({}); // No jobId provided

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.equal(res.body.error.code, 'VALIDATION_ERROR');
});

