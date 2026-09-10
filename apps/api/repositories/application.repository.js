/* ============================================================
   CAMPUSLINK — Application Repository
   Data access methods for student job applications.
   Strictly aligned with PostgreSQL schema.
   ============================================================ */

const { query } = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

const BASE_SELECT = `
  SELECT 
    a.id,
    a.student_id,
    a.job_id,
    a.status,
    a.current_round,
    a.current_round AS round,
    a.applied_at,
    a.applied_at AS applied_date,
    a.updated_at,
    j.title AS job_title,
    j.title AS job,
    j.location AS job_location,
    j.type AS job_type,
    c.name AS company,
    c.name AS company_name,
    u.name AS student_name,
    u.email AS student_email,
    sp.cgpa,
    sp.branch
  FROM applications a
  LEFT JOIN jobs j ON a.job_id = j.id
  LEFT JOIN companies c ON j.company_id = c.id
  LEFT JOIN student_profiles sp ON a.student_id = sp.id
  LEFT JOIN users u ON sp.user_id = u.id
`;

async function listByStudent(studentOrUserId) {
  const sql = `${BASE_SELECT} WHERE a.student_id = $1 OR sp.user_id = $1 ORDER BY a.applied_at DESC`;
  const res = await query(sql, [studentOrUserId]);
  return res.rows;
}

async function listAll() {
  const sql = `${BASE_SELECT} ORDER BY a.applied_at DESC`;
  const res = await query(sql);
  return res.rows;
}

async function getById(id) {
  const sql = `${BASE_SELECT} WHERE a.id = $1`;
  const res = await query(sql, [id]);
  return res.rows[0] || null;
}

async function createApplication(data) {
  let profileId = data.student_id || data.studentId;

  // If passed ID is a user ID, resolve to student_profiles.id
  const profileLookup = await query('SELECT id FROM student_profiles WHERE user_id = $1 OR id = $1', [profileId]);
  if (profileLookup.rows.length > 0) {
    profileId = profileLookup.rows[0].id;
  }

  const id = uuidv4();
  const status = data.status || 'applied';
  const currentRound = data.current_round || data.round || 'Resume Screening';

  const res = await query(
    `INSERT INTO applications (id, student_id, job_id, status, current_round, applied_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING *`,
    [
      id,
      profileId,
      data.job_id || data.jobId,
      status,
      currentRound,
    ]
  );

  const created = res.rows[0];
  const fullApp = await getById(created.id);
  return fullApp || created;
}

async function updateStatus(id, status, round) {
  const res = await query(
    `UPDATE applications 
     SET status = COALESCE($1, status),
         current_round = COALESCE($2, current_round),
         updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [status, round, id]
  );

  if (!res.rows[0]) return null;
  const fullApp = await getById(id);
  return fullApp || res.rows[0];
}

module.exports = {
  listByStudent,
  listAll,
  getById,
  createApplication,
  updateStatus,
};
