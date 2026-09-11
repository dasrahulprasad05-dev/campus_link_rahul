/* ============================================================
   CAMPUSLINK — Student Repository
   Data access methods for student profiles and readiness.
   ============================================================ */

const { query } = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

async function getProfileByUserId(userId) {
  const res = await query('SELECT * FROM student_profiles WHERE user_id = $1', [userId]);
  return res.rows[0] || null;
}

async function createProfile(data) {
  const id = uuidv4();
  const res = await query(
    `INSERT INTO student_profiles
     (id, user_id, reg_no, branch, year, cgpa, target_role, phone, linkedin, github, skills, certifications, profile_completion, readiness_score)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING *`,
    [
      id,
      data.user_id,
      data.reg_no || null,
      data.branch || 'Engineering',
      data.year || 2026,
      data.cgpa || 8.0,
      data.target_role || 'Software Engineer',
      data.phone || '',
      data.linkedin || '',
      data.github || '',
      data.skills || [],
      data.certifications || [],
      data.profile_completion || 60,
      data.readiness_score || 70,
    ]
  );
  return res.rows[0];
}

async function updateProfile(userId, updates) {
  const current = await getProfileByUserId(userId);
  if (!current) {
    return createProfile({ user_id: userId, ...updates });
  }

  const res = await query(
    `UPDATE student_profiles
     SET target_role = COALESCE($1, target_role),
         skills = COALESCE($2, skills),
         cgpa = COALESCE($3, cgpa),
         phone = COALESCE($4, phone),
         updated_at = NOW()
     WHERE user_id = $5
     RETURNING *`,
    [updates.target_role, updates.skills, updates.cgpa, updates.phone, userId]
  );
  return res.rows[0];
}

async function listStudents() {
  const res = await query(`
    SELECT u.id, u.name, u.email, u.created_at, sp.branch, sp.cgpa, sp.readiness_score as readiness, sp.target_role
    FROM users u
    LEFT JOIN student_profiles sp ON u.id = sp.user_id
    WHERE u.role = 'student'
    ORDER BY 
      CASE 
        WHEN u.email LIKE '%@university.edu' THEN 1 
        ELSE 0 
      END ASC,
      u.created_at DESC
  `);
  return res.rows;
}

module.exports = {
  getProfileByUserId,
  createProfile,
  updateProfile,
  listStudents,
};
