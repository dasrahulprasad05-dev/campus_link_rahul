/* ============================================================
   CAMPUSLINK — Company Repository
   Data access methods for registered hiring companies.
   Strictly aligned with PostgreSQL schema.
   ============================================================ */

const { query } = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

async function listCompanies() {
  const res = await query('SELECT * FROM companies ORDER BY created_at DESC');
  return res.rows;
}

async function getCompanyById(id) {
  const res = await query('SELECT * FROM companies WHERE id = $1', [id]);
  return res.rows[0] || null;
}

async function findByName(name) {
  if (!name) return null;
  const res = await query('SELECT * FROM companies WHERE LOWER(name) = LOWER($1) LIMIT 1', [name.trim()]);
  return res.rows[0] || null;
}

async function createCompany(data) {
  const id = uuidv4();
  const res = await query(
    `INSERT INTO companies (id, name, industry, website, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      id,
      data.name.trim(),
      data.industry || 'Technology',
      data.website || null,
      data.status || 'active',
    ]
  );
  return res.rows[0];
}

async function findOrCreate(name, industry = 'Technology') {
  const existing = await findByName(name);
  if (existing) return existing;
  return createCompany({ name, industry });
}

module.exports = {
  listCompanies,
  getCompanyById,
  findByName,
  createCompany,
  findOrCreate,
};
