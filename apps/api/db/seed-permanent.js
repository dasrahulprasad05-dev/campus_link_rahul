/* ============================================================
   CAMPUSLINK — Seed Permanent Accounts Script
   Inserts the permanent accounts into the PostgreSQL database.
   ============================================================ */

require('dotenv').config();
const { query } = require('./pool');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seedPermanent() {
  console.log('[Seed] Connecting to database...');
  const hash = bcrypt.hashSync('rahul2005', 10);

  // 1. First remove any old demo users or conflicting records
  try {
    await query(`
      DELETE FROM student_profiles WHERE user_id IN (
        SELECT id FROM users WHERE email IN ('student@campuslink.in', 'admin@campuslink.in', 'recruiter@campuslink.in', 'mentor@campuslink.in')
      )
    `);
    await query(`
      DELETE FROM users WHERE email IN (
        'student@campuslink.in', 'admin@campuslink.in', 'recruiter@campuslink.in', 'mentor@campuslink.in'
      ) OR id IN (
        'a1b2c3d4-0001-0001-0001-000000000001',
        'a1b2c3d4-0001-0001-0001-000000000002',
        'a1b2c3d4-0001-0001-0001-000000000003',
        'a1b2c3d4-0001-0001-0001-000000000004'
      )
    `);
    console.log('[Seed] Old demo accounts cleaned from database.');
  } catch (err) {
    console.warn('[Seed] Note during cleanup:', err.message);
  }

  const users = [
    {
      id: uuidv4(),
      name: 'Training & Placement Office ABIT',
      email: 'rahulprasaddas9@gmail.com',
      role: 'admin'
    },
    {
      id: uuidv4(),
      name: 'TCS BHUBANESWAR',
      email: 'ommprasadd363@gmail.com',
      role: 'recruiter'
    },
    {
      id: uuidv4(),
      name: 'Prof. Rahul Prasad Das',
      email: 'rahulprsaddas@gmail.com',
      role: 'mentor'
    }
  ];

  for (const u of users) {
    await query(
      `INSERT INTO users (id, name, email, password_hash, role, email_verified)
       VALUES ($1, $2, $3, $4, $5, true)
       ON CONFLICT (email) DO UPDATE 
       SET password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role,
           name = EXCLUDED.name,
           email_verified = true`,
      [u.id, u.name, u.email, hash, u.role]
    );
    console.log(`[Seed] Successfully provisioned: ${u.email} (${u.role})`);
  }

  console.log('[Seed] All permanent accounts are active and verified in PostgreSQL!');
}

seedPermanent()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[Seed Error]:', err);
    process.exit(1);
  });
