/* CAMPUSLINK — Authentication Integration Tests */
const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server');

test('POST /api/v1/auth/register creates a new student user and returns JWT token', async () => {
  const uniqueEmail = `test_student_${Date.now()}@university.edu`;
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Test Student',
      email: uniqueEmail,
      password: 'StrongPassword123!',
      role: 'student',
      college: 'National Institute of Technology',
      department: 'Computer Science',
      year: 2026,
    });

  assert.equal(res.status, 201, `Expected 201 Created, got ${res.status}: ${JSON.stringify(res.body)}`);
  assert.equal(res.body.success, true);
  assert.ok(res.body.token, 'Response must include JWT token');
  assert.ok(res.body.user, 'Response must include user object');
  assert.equal(res.body.user.email, uniqueEmail);
  assert.equal(res.body.user.role, 'student');
  assert.equal(res.body.user.password, undefined, 'Password hash must never leak in response');
});

test('POST /api/v1/auth/register rejects duplicate email with 409 Conflict', async () => {
  const duplicateEmail = `duplicate_${Date.now()}@university.edu`;
  // First registration
  await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Original User',
      email: duplicateEmail,
      password: 'Password123!',
      role: 'student',
    });

  // Second registration with identical email
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Duplicate User',
      email: duplicateEmail,
      password: 'DifferentPassword123!',
      role: 'student',
    });

  assert.equal(res.status, 409, `Expected 409 Conflict, got ${res.status}`);
  assert.equal(res.body.success, false);
});

test('POST /api/v1/auth/login succeeds with correct credentials', async () => {
  const email = `login_success_${Date.now()}@university.edu`;
  const password = 'CorrectPassword999!';

  await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Login Test User',
      email,
      password,
      role: 'student',
    });

  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.token);
  assert.equal(res.body.user.email, email);
});

test('POST /api/v1/auth/login rejects invalid password with 401 Unauthorized', async () => {
  const email = `login_fail_${Date.now()}@university.edu`;

  await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Fail Test User',
      email,
      password: 'RealPassword123!',
      role: 'student',
    });

  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email,
      password: 'WrongPassword!',
    });

  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test('GET /api/v1/auth/me returns current user profile with valid Bearer token', async () => {
  const email = `me_test_${Date.now()}@university.edu`;
  const regRes = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Session User',
      email,
      password: 'SessionPassword123!',
      role: 'student',
    });

  const token = regRes.body.token;

  const res = await request(app)
    .get('/api/v1/auth/me')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.user.email, email);
});

test('GET /api/v1/auth/me returns 401 Unauthorized without token', async () => {
  const res = await request(app).get('/api/v1/auth/me');
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});
