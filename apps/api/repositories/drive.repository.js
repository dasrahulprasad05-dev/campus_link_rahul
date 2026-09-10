/* ============================================================
   CAMPUSLINK — Placement Drive Repository
   Data access methods for recruitment drives.
   Strictly aligned with PostgreSQL schema.
   ============================================================ */

const { query } = require('../db/pool');
const { v4: uuidv4 } = require('uuid');
const companyRepo = require('./company.repository');

const BASE_SELECT = `
  SELECT 
    d.id,
    d.company_id,
    d.role,
    d.drive_date,
    d.drive_date AS date,
    d.venue,
    d.min_cgpa,
    d.branches,
    d.status,
    d.created_at,
    c.name AS company,
    c.name AS company_name,
    c.industry AS company_industry
  FROM drives d
  LEFT JOIN companies c ON d.company_id = c.id
`;

async function listDrives() {
  const res = await query(`${BASE_SELECT} ORDER BY d.drive_date ASC`);
  return res.rows;
}

async function getDriveById(id) {
  const res = await query(`${BASE_SELECT} WHERE d.id = $1`, [id]);
  return res.rows[0] || null;
}

async function createDrive(data) {
  let companyId = data.company_id;
  if (!companyId && data.company) {
    const comp = await companyRepo.findOrCreate(data.company);
    companyId = comp.id;
  }

  const id = uuidv4();
  const driveDate = data.drive_date || data.date || new Date().toISOString();
  const branches = Array.isArray(data.branches)
    ? data.branches
    : (typeof data.branches === 'string' ? data.branches.split(',').map(b => b.trim()) : []);

  const res = await query(
    `INSERT INTO drives (id, company_id, role, drive_date, venue, min_cgpa, branches, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      id,
      companyId || null,
      data.role,
      driveDate,
      data.venue || 'Main Auditorium',
      data.min_cgpa || 0,
      branches,
      data.status || 'scheduled',
    ]
  );

  const created = res.rows[0];
  const fullDrive = await getDriveById(created.id);
  return fullDrive || created;
}

module.exports = {
  listDrives,
  getDriveById,
  createDrive,
};
