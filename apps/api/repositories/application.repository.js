/* ============================================================
   CAMPUSLINK — Application Repository
   Data access methods for student job applications.
   ============================================================ */

const { query } = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

async function listByStudent(studentId) {
  const res = await query('SELECT * FROM applications WHERE student_id = $1 ORDER BY applied_date DESC', [studentId]);
  return res.rows;
}

async function listAll() {
  const res = await query('SELECT * FROM applications ORDER BY applied_date DESC');
  return res.rows;
}

async function createApplication(data) {
  const id = uuidv4();
  const res = await query(
    `INSERT INTO applications (id, student_id, job_id, job, company, status, round)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      id,
      data.student_id,
      data.job_id || id,
      data.job,
      data.company,
      data.status || 'applied',
      data.round || 'Initial Review',
    ]
  );
  return res.rows[0];
}

async function updateStatus(id, status, round) {
  const res = await query(
    'UPDATE applications SET status = $1, round = COALESCE($2, round) WHERE id = $3 RETURNING *',
    [status, round, id]
  );
  return res.rows[0] || null;
}

module.exports = {
  listByStudent,
  listAll,
  createApplication,
  updateStatus,
};
