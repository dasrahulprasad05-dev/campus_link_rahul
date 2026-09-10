/* CAMPUSLINK — Email Verification & Password Reset Integration Tests */
const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server');
const userRepo = require('../repositories/user.repository');

test('Email Auth: Full Verification Flow (Register -> Verify -> Welcome)', async () => {
  const email = `email_verify_${Date.now()}@university.edu`;
  const regRes = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Priya Sharma',
      email,
      password: 'SecurePassword123!',
      role: 'student'
    });

  assert.equal(regRes.status, 201);
  assert.equal(regRes.body.success, true);
  assert.equal(regRes.body.requiresVerification, true);
  assert.ok(regRes.body.message.includes('spam folder'));

  // Retrieve user to check verification token
  const dbUser = await userRepo.findByEmail(email);
  assert.ok(dbUser.verification_token, 'User must have a verification token generated');
  assert.equal(dbUser.email_verified, false);

  // Test invalid token
  const invalidRes = await request(app)
    .get('/api/v1/auth/verify-email?token=bad-token-12345');
  assert.equal(invalidRes.status, 400);

  // Test valid verification link
  const verifyRes = await request(app)
    .get(`/api/v1/auth/verify-email?token=${dbUser.verification_token}`);
  assert.equal(verifyRes.status, 200);
  assert.equal(verifyRes.body.success, true);
  assert.equal(verifyRes.body.user.email_verified, true);

  // Re-verify in DB
  const verifiedDbUser = await userRepo.findByEmail(email);
  assert.equal(verifiedDbUser.email_verified, true);
  assert.equal(verifiedDbUser.verification_token, null);
});

test('Email Auth: Password Reset Flow (Forgot -> Reset -> Login)', async () => {
  const email = `pwd_reset_${Date.now()}@university.edu`;
  await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Rahul Verma',
      email,
      password: 'OldPassword123!',
      role: 'student'
    });

  // 1. Request forgot password
  const forgotRes = await request(app)
    .post('/api/v1/auth/forgot-password')
    .send({ email });
  assert.equal(forgotRes.status, 200);
  assert.equal(forgotRes.body.success, true);
  assert.ok(forgotRes.body.message.includes('spam folder'));

  // 2. Fetch reset token from DB
  const dbUser = await userRepo.findByEmail(email);
  assert.ok(dbUser.reset_password_token, 'Reset token must be generated');

  // 3. Reset password with valid token
  const newPassword = 'BrandNewPassword456!';
  const resetRes = await request(app)
    .post('/api/v1/auth/reset-password')
    .send({
      token: dbUser.reset_password_token,
      newPassword
    });
  assert.equal(resetRes.status, 200);
  assert.equal(resetRes.body.success, true);

  // 4. Test login with old password (must fail)
  const oldLoginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password: 'OldPassword123!' });
  assert.equal(oldLoginRes.status, 401);

  // 5. Test login with new password (must succeed)
  const newLoginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password: newPassword });
  assert.equal(newLoginRes.status, 200);
  assert.equal(newLoginRes.body.success, true);
  assert.ok(newLoginRes.body.token);
});
