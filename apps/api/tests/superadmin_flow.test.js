const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = ''; // run memoryDb mode for test isolation

const app = require('../server');

describe('Super Admin & Role Verification Workflow', () => {
  let superAdminToken;
  let tpoToken;
  let recruiterToken;

  test('1. Super Admin logs in with preseeded credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'superadmin@campuslink.in', password: 'CampusSuper@2026' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.role, 'super_admin');
    assert.ok(res.body.token);
    superAdminToken = res.body.token;
  });

  test('2. TPO / Admin creates a placement drive successfully', async () => {
    // Login as TPO
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@campuslink.in', password: 'CampusLink@2026' });

    assert.equal(loginRes.status, 200);
    tpoToken = loginRes.body.token;

    // Post new drive
    const driveRes = await request(app)
      .post('/api/v1/drives')
      .set('Authorization', `Bearer ${tpoToken}`)
      .send({
        company: 'Google Cloud India',
        role: 'Cloud Technical Resident',
        date: new Date(Date.now() + 10 * 86400000).toISOString(),
        venue: 'Main Auditorium Hall A',
        min_cgpa: 7.5,
        branches: ['Computer Science & Engineering', 'Information Technology'],
      });

    assert.equal(driveRes.status, 201);
    assert.equal(driveRes.body.success, true);
    assert.equal(driveRes.body.data.role, 'Cloud Technical Resident');
  });

  test('3. Recruiter posts a new job opening successfully', async () => {
    // Login as Recruiter
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'recruiter@campuslink.in', password: 'CampusLink@2026' });

    assert.equal(loginRes.status, 200);
    recruiterToken = loginRes.body.token;

    // Post new job
    const jobRes = await request(app)
      .post('/api/v1/jobs')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        title: 'Full Stack Engineer (Node.js & React)',
        company: 'TCS Campus Recruitment',
        location: 'Bengaluru / Hybrid',
        type: 'Full-time',
        min_cgpa: 7.0,
        skills: ['JavaScript', 'Node.js', 'React', 'SQL'],
        description: 'Build enterprise platforms.',
      });

    assert.equal(jobRes.status, 201);
    assert.equal(jobRes.body.success, true);
    assert.equal(jobRes.body.data.title, 'Full Stack Engineer (Node.js & React)');
  });

  test('4. Staff account verification lifecycle: Register -> Email Verify -> Pending Admin -> Super Admin Verifies -> Login Success', async () => {
    const testStaffEmail = `staff_recruiter_${Date.now()}@corporate.com`;

    // A. Register as recruiter
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'New Corporate Recruiter',
        email: testStaffEmail,
        password: 'Password123!',
        role: 'recruiter',
      });

    assert.equal(regRes.status, 201);
    const userId = regRes.body.user.id;
    const token = regRes.body.verificationToken;
    assert.ok(token);

    // B. Verify email
    const verifyEmailRes = await request(app)
      .get(`/api/v1/auth/verify-email?token=${token}`);
    assert.equal(verifyEmailRes.status, 200);

    // C. Try to log in before super_admin approves -> Should return 403 ADMIN_VERIFICATION_PENDING
    const loginAttempt = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testStaffEmail, password: 'Password123!' });

    assert.equal(loginAttempt.status, 403);
    assert.equal(loginAttempt.body.error.code, 'ADMIN_VERIFICATION_PENDING');

    // D. Super Admin views pending verifications
    const pendingRes = await request(app)
      .get('/api/v1/superadmin/pending')
      .set('Authorization', `Bearer ${superAdminToken}`);

    assert.equal(pendingRes.status, 200);
    const foundInPending = pendingRes.body.data.some(u => u.id === userId);
    assert.equal(foundInPending, true);

    // E. Super Admin verifies the staff member
    const approveRes = await request(app)
      .post(`/api/v1/superadmin/verify/${userId}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({});

    assert.equal(approveRes.status, 200);
    assert.equal(approveRes.body.success, true);

    // F. Staff logs in after approval -> Should succeed with role 'recruiter'!
    const loginApproved = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testStaffEmail, password: 'Password123!' });

    assert.equal(loginApproved.status, 200);
    assert.equal(loginApproved.body.success, true);
    assert.equal(loginApproved.body.user.role, 'recruiter');
  });
});
