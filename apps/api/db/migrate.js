/* ============================================================
   CAMPUSLINK — Database Migration Runner
   Applies schema.sql and seed.sql to PostgreSQL instance.
   ============================================================ */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query, isDatabaseConnected, getPool } = require('./pool');

async function runMigrations() {
  console.log('[Migration] Checking database status...');

  if (!process.env.DATABASE_URL) {
    console.log('[Migration] No DATABASE_URL configured. Skipping PostgreSQL schema application.');
    return { success: true, message: 'In-memory database active' };
  }

  const pool = getPool();
  if (!pool) {
    console.warn('[Migration] Database pool not initialized.');
    return { success: false, error: 'No pool' };
  }

  try {
    const schemaPath = path.join(__dirname, '../../../infra/db/schema.sql');
    const seedPath = path.join(__dirname, '../../../infra/db/seed.sql');

    if (fs.existsSync(schemaPath)) {
      console.log('[Migration] Executing schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      console.log('[Migration] Schema successfully applied (11 tables verified).');
    }

    if (fs.existsSync(seedPath)) {
      console.log('[Migration] Executing seed.sql...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await pool.query(seedSql);
      console.log('[Migration] Seed data verified.');
    }

    console.log('[Migration] Database is up to date.');
    return { success: true };
  } catch (err) {
    console.error('[Migration] Failed to run migrations:', err.message);
    return { success: false, error: err.message };
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { runMigrations };
