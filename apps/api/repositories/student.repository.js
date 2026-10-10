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
      data.branch || 'Computer Science & Engineering',
      data.year || 2026,
      data.cgpa || null,
      data.target_role || 'Software Engineer',
      data.phone || '',
      data.linkedin || '',
      data.github || '',
      data.skills || [],
      data.certifications || [],
      data.profile_completion || 10,
      data.readiness_score || 0,
    ]
  );
  return res.rows[0];
}

async function updateProfile(userId, updates) {
  const current = await getProfileByUserId(userId);
  if (!current) {
    return createProfile({ user_id: userId, ...updates });
  }

  const skills = updates.skills !== undefined ? updates.skills : current.skills;
  const skillsArr = Array.isArray(skills) ? skills : [];
  const cgpa = updates.cgpa !== undefined ? updates.cgpa : current.cgpa;
  const numCgpa = cgpa ? parseFloat(cgpa) : 0;

  const certs = updates.certifications !== undefined ? updates.certifications : current.certifications;
  const certsArr = Array.isArray(certs) ? certs : [];
  const projCount = updates.projects_count !== undefined ? updates.projects_count : (Array.isArray(updates.projects) ? updates.projects.length : (current.projects_count || 0));

  // Calculate readiness dynamically
  let newReadiness = 0;
  if (skillsArr.length > 0 || numCgpa > 0 || certsArr.length > 0 || projCount > 0) {
    const skillsPts = Math.min(25, skillsArr.length * 2.5);
    const academicPts = numCgpa > 0 ? Math.min(15, Math.round((numCgpa / 10) * 15)) : 0;
    const certPts = Math.min(10, certsArr.length * 3.5);
    const projPts = Math.min(15, projCount * 5);
    const baseline = 18;
    newReadiness = Math.min(100, Math.round(skillsPts + academicPts + certPts + projPts + baseline));
  }

  const res = await query(
    `UPDATE student_profiles
     SET target_role = COALESCE($1, target_role),
         skills = COALESCE($2, skills),
         cgpa = COALESCE($3, cgpa),
         phone = COALESCE($4, phone),
         certifications = COALESCE($5, certifications),
         projects_count = COALESCE($6, projects_count),
         readiness_score = $7,
         updated_at = NOW()
     WHERE user_id = $8
     RETURNING *`,
    [updates.target_role, updates.skills, updates.cgpa, updates.phone, updates.certifications, projCount, newReadiness, userId]
  );
  return res.rows[0];
}

async function listStudents() {
  const res = await query(`
    SELECT u.id, u.name, u.email, u.created_at, sp.branch, sp.cgpa, sp.readiness_score as readiness, sp.target_role,
           sp.skills, sp.phone, sp.linkedin, sp.github, sp.year, sp.reg_no
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
