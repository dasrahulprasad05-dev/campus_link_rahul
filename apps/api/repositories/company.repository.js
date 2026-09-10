/* ============================================================
   CAMPUSLINK — Company Repository
   Data access methods for registered hiring companies.
   ============================================================ */

const { query } = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

async function listCompanies() {
  const res = await query('SELECT * FROM companies ORDER BY hires DESC');
  return res.rows;
}

async function createCompany(data) {
  const id = uuidv4();
  const res = await query(
    `INSERT INTO companies (id, name, industry, jobs, hires, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [id, data.name, data.industry || 'Tech', data.jobs || 0, data.hires || 0, data.status || 'active']
  );
  return res.rows[0];
}

module.exports = {
  listCompanies,
  createCompany,
};
