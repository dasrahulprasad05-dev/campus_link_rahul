/* ============================================================
   CAMPUSLINK — Placement Drive Repository
   Data access methods for recruitment drives.
   ============================================================ */

const { query } = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

async function listDrives() {
  const res = await query('SELECT * FROM drives ORDER BY date ASC');
  return res.rows;
}

async function createDrive(data) {
  const id = uuidv4();
  const res = await query(
    `INSERT INTO drives (id, company, role, date, eligible, applied, status, venue)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      id,
      data.company,
      data.role,
      data.date,
      data.eligible || 0,
      data.applied || 0,
      data.status || 'scheduled',
      data.venue || 'TBD',
    ]
  );
  return res.rows[0];
}

module.exports = {
  listDrives,
  createDrive,
};
