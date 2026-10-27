/* ============================================================
   CAMPUSGRID — Job Repository
   Data access methods for job opportunities.
   Strictly aligned with PostgreSQL schema.
   ============================================================ */

const { query } = require('../db/pool');
const { v4: uuidv4 } = require('uuid');
const companyRepo = require('./company.repository');

async function listJobs(filter = {}) {
  const conditions = [];
  const params = [];
  let paramIdx = 1;

  if (filter.type) {
    conditions.push(`j.type = $${paramIdx++}`);
    params.push(filter.type);
  }

  if (filter.status) {
    conditions.push(`j.status = $${paramIdx++}`);
    params.push(filter.status);
  }

  // Full-text search using PostgreSQL
  let searchClause = '';
  let orderClause = 'ORDER BY j.created_at DESC';
  if (filter.search && filter.search.trim()) {
    const searchTerm = filter.search.trim();
    // Use ILIKE for flexible matching (works without tsvector setup)
    conditions.push(
      `(j.title ILIKE $${paramIdx} OR c.name ILIKE $${paramIdx} OR j.description ILIKE $${paramIdx} OR array_to_string(j.skills_required, ',') ILIKE $${paramIdx})`
    );
    params.push(`%${searchTerm}%`);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count total before pagination
  const countSql = `SELECT COUNT(*) FROM jobs j LEFT JOIN companies c ON j.company_id = c.id ${whereClause}`;
  const countRes = await query(countSql, params);
  const total = parseInt(countRes.rows[0]?.count || '0', 10);

  // Pagination
  const page = Math.max(1, parseInt(filter.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filter.limit) || 20));
  const offset = (page - 1) * limit;

  const sql = `
    SELECT 
      j.id, j.company_id, j.recruiter_id, j.title, j.description,
      j.location, j.type, j.skills_required, j.skills_required AS skills,
      j.min_cgpa, j.deadline, j.status, j.created_at,
      c.name AS company, c.name AS company_name, c.industry AS company_industry
    FROM jobs j
    LEFT JOIN companies c ON j.company_id = c.id
    ${whereClause}
    ${orderClause}
    LIMIT $${paramIdx++} OFFSET $${paramIdx++}
  `;
  params.push(limit, offset);

  const res = await query(sql, params);
  return {
    jobs: res.rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
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

  const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str));
  let recruiterId = data.recruiter_id;
  if (recruiterId && !isUUID(recruiterId)) {
    const idMap = {
      'u-1': 'a1b2c3d4-0001-0001-0001-000000000001',
      'u-2': 'a1b2c3d4-0001-0001-0001-000000000002',
      'u-3': 'a1b2c3d4-0001-0001-0001-000000000003',
      'u-4': 'a1b2c3d4-0001-0001-0001-000000000004',
      // Demo token IDs → seeded PostgreSQL UUIDs
      'u-tpo-abit': 'a1b2c3d4-0001-0001-0001-000000000002',
      'u-recruiter-tcs': 'a1b2c3d4-0001-0001-0001-000000000003',
      'u-mentor-rahul': 'a1b2c3d4-0001-0001-0001-000000000004',
    };
    recruiterId = idMap[recruiterId] || null;
  }


  const res = await query(
    `INSERT INTO jobs 
      (id, company_id, recruiter_id, title, description, location, type, skills_required, min_cgpa, deadline, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      id,
      companyId || null,
      recruiterId || null,
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
