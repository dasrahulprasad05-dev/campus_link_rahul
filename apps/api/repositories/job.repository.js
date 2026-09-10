/* ============================================================
   CAMPUSLINK — Job Repository
   Data access methods for job opportunities.
   ============================================================ */

const { query } = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

async function listJobs(filter = {}) {
  const res = await query('SELECT * FROM jobs ORDER BY created_at DESC');
  let jobs = res.rows;

  if (filter.type) {
    jobs = jobs.filter(j => j.type?.toLowerCase() === filter.type.toLowerCase());
  }
  if (filter.search) {
    const s = filter.search.toLowerCase();
    jobs = jobs.filter(j =>
      j.title?.toLowerCase().includes(s) ||
      j.company?.toLowerCase().includes(s) ||
      (j.skills && j.skills.some(skill => skill.toLowerCase().includes(s)))
    );
  }
  return jobs;
}

async function getJobById(id) {
  const res = await query('SELECT * FROM jobs WHERE id = $1', [id]);
  return res.rows[0] || null;
}

async function createJob(data) {
  const id = uuidv4();
  const res = await query(
    `INSERT INTO jobs (id, title, company, location, type, deadline, skills, match, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      id,
      data.title,
      data.company,
      data.location || 'Bhubaneswar',
      data.type || 'Full-time',
      data.deadline || 'In 14 days',
      data.skills || [],
      data.match || 75,
      data.status || 'active',
    ]
  );
  return res.rows[0];
}

module.exports = {
  listJobs,
  getJobById,
  createJob,
};
