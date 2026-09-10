/* ============================================================
   CAMPUSLINK — Job Repository
   Data access methods for job opportunities.
   Strictly aligned with PostgreSQL schema.
   ============================================================ */

const { query } = require('../db/pool');
const { v4: uuidv4 } = require('uuid');
const companyRepo = require('./company.repository');

async function listJobs(filter = {}) {
  const sql = `
    SELECT 
      j.id,
      j.company_id,
      j.recruiter_id,
      j.title,
      j.description,
      j.location,
      j.type,
      j.skills_required,
      j.skills_required AS skills,
      j.min_cgpa,
      j.deadline,
      j.status,
      j.created_at,
      c.name AS company,
      c.name AS company_name,
      c.industry AS company_industry
    FROM jobs j
    LEFT JOIN companies c ON j.company_id = c.id
    ORDER BY j.created_at DESC
  `;
  const res = await query(sql);
  let jobs = res.rows;

  if (filter.type) {
    jobs = jobs.filter(j => j.type?.toLowerCase() === filter.type.toLowerCase());
  }
  if (filter.search) {
    const s = filter.search.toLowerCase();
    jobs = jobs.filter(j =>
      j.title?.toLowerCase().includes(s) ||
      j.company?.toLowerCase().includes(s) ||
      (Array.isArray(j.skills_required) && j.skills_required.some(skill => skill.toLowerCase().includes(s)))
    );
  }
  return jobs;
}

async function getJobById(id) {
  const sql = `
    SELECT 
      j.id,
      j.company_id,
      j.recruiter_id,
      j.title,
      j.description,
      j.location,
      j.type,
      j.skills_required,
      j.skills_required AS skills,
      j.min_cgpa,
      j.deadline,
      j.status,
      j.created_at,
      c.name AS company,
      c.name AS company_name,
      c.industry AS company_industry
    FROM jobs j
    LEFT JOIN companies c ON j.company_id = c.id
    WHERE j.id = $1
  `;
  const res = await query(sql, [id]);
  return res.rows[0] || null;
}

async function createJob(data) {
  let companyId = data.company_id;
  if (!companyId && data.company) {
    const comp = await companyRepo.findOrCreate(data.company);
    companyId = comp.id;
  }

  const id = uuidv4();
  const skillsArray = Array.isArray(data.skills_required)
    ? data.skills_required
    : (Array.isArray(data.skills)
        ? data.skills
        : (typeof data.skills === 'string' ? data.skills.split(',').map(s => s.trim()) : []));

  const res = await query(
    `INSERT INTO jobs 
      (id, company_id, recruiter_id, title, description, location, type, skills_required, min_cgpa, deadline, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      id,
      companyId || null,
      data.recruiter_id || null,
      data.title,
      data.description || null,
      data.location || 'Bhubaneswar',
      data.type || 'Full-time',
      skillsArray,
      data.min_cgpa || 0,
      data.deadline || null,
      data.status || 'active',
    ]
  );

  const created = res.rows[0];
  // Fetch with joined company info
  const fullJob = await getJobById(created.id);
  return fullJob || created;
}

module.exports = {
  listJobs,
  getJobById,
  createJob,
};
