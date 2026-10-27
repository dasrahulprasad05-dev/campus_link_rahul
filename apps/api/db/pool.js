/* ============================================================
   CAMPUSGRID — Database Pool & Connection Manager
   Real PostgreSQL connection pooling via 'pg' with SSL support
   and fallback in-memory simulation for offline development.
   Strictly synchronized with PostgreSQL 11-table schema.
   ============================================================ */

require('dotenv').config();
const { Pool } = require('pg');

let pool = null;
let isConnected = false;
let initPromise = null;

if (process.env.DATABASE_URL) {
  try {
    const isCloudDb = process.env.DATABASE_URL.includes('neon.tech') ||
                      process.env.DATABASE_URL.includes('render.com') ||
                      process.env.DATABASE_URL.includes('sslmode=require') ||
                      process.env.NODE_ENV === 'production';

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isCloudDb ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('[PostgreSQL] Unexpected error on idle client:', err.message);
    });

    initPromise = pool.query('SELECT NOW()')
      .then(() => {
        isConnected = true;
        console.log('[PostgreSQL] Connected successfully to database');
      })
      .catch((err) => {
        console.warn('[PostgreSQL] Unable to connect to DATABASE_URL:', err.message);
        console.warn('[PostgreSQL] Running in simulated memory-backed database mode');
      });
  } catch (err) {
    console.warn('[PostgreSQL] Initialization error:', err.message);
  }
} else {
  console.log('[PostgreSQL] No DATABASE_URL provided. Running with in-memory persistence layer.');
}

/**
 * Execute a SQL query with parameters
 * @param {string} text - SQL statement
 * @param {Array} params - Query parameters
 * @returns {Promise<{ rows: Array, rowCount: number }>}
 */
async function query(text, params = []) {
  if (pool) {
    if (!isConnected && initPromise) {
      try {
        await initPromise;
      } catch (_) {}
    }
    if (isConnected) {
      const start = Date.now();
      try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        if (process.env.NODE_ENV === 'development') {
          console.log(`[SQL] (${duration}ms):`, text.slice(0, 80));
        }
        return res;
      } catch (err) {
        console.error('[SQL Error]:', err.message, '\nQuery:', text);
        throw err;
      }
    }
  }

  // If no DB is connected, delegate to in-memory simulated queries
  return memoryDb.query(text, params);
}

/**
 * Minimal in-memory fallback database for offline / testing.
 * Returns empty result sets — no hardcoded demo data.
 * When PostgreSQL is connected (production), this is never used.
 */
const memoryDb = (() => {
  const { v4: uuidv4 } = require('uuid');

  // Empty table stubs matching schema.sql structure
  const tables = {
    users: [],
    student_profiles: [],
    companies: [],
    jobs: [],
    applications: [],
    drives: [],
    offers: [],
    offer_documents: [],
    notifications: [],
    audit_log: [],
    readiness_configs: [],
    hiring_stages: [],
    candidate_stage_progress: [],
    mentor_assignments: [],
    interventions: [],
  };

  /**
   * Lightweight SQL query simulator for offline development.
   * Handles basic CRUD patterns using string matching on SQL text.
   */
  function query(text, params = []) {
    const q = text.toLowerCase().replace(/\s+/g, ' ').trim();

    // ---- SELECT queries ----
    if (q.startsWith('select')) {
      const fromMatch = q.match(/from\s+(\w+)/);
      if (!fromMatch) return Promise.resolve({ rows: [], rowCount: 0 });
      const tableName = fromMatch[1];
      const tableData = tables[tableName];
      if (!tableData) return Promise.resolve({ rows: [], rowCount: 0 });

      // COUNT queries
      if (q.includes('count(')) {
        let filtered = tableData;
        if (q.includes('where') && params.length > 0) {
          const colMatch = q.match(/where\s+(\w+)\s*=\s*\$1/);
          if (colMatch) {
            filtered = tableData.filter(r => r[colMatch[1]] === params[0]);
          }
        }
        return Promise.resolve({ rows: [{ count: String(filtered.length) }], rowCount: 1 });
      }

      // SELECT with WHERE
      if (q.includes('where') && params.length > 0) {
        const colMatch = q.match(/where\s+(?:\w+\.)?(\w+)\s*=\s*\$1/);
        const col = colMatch ? colMatch[1] : 'id';
        const results = tableData.filter(r => r[col] === params[0]);
        return Promise.resolve({ rows: results, rowCount: results.length });
      }

      // SELECT all
      return Promise.resolve({ rows: [...tableData], rowCount: tableData.length });
    }

    // ---- INSERT queries ----
    if (q.startsWith('insert into')) {
      const tableMatch = q.match(/insert\s+into\s+(\w+)/);
      if (!tableMatch) return Promise.resolve({ rows: [], rowCount: 0 });
      const tableName = tableMatch[1];
      if (!tables[tableName]) tables[tableName] = [];

      const row = { id: params[0] || uuidv4(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      tables[tableName].push(row);
      return Promise.resolve({ rows: [row], rowCount: 1 });
    }

    // ---- UPDATE queries ----
    if (q.startsWith('update')) {
      const tableMatch = q.match(/update\s+(\w+)/);
      if (!tableMatch) return Promise.resolve({ rows: [], rowCount: 0 });
      const tableData = tables[tableMatch[1]] || [];

      const targetId = params[params.length - 1];
      const row = tableData.find(r => r.id === targetId);
      if (row) {
        row.updated_at = new Date().toISOString();
        return Promise.resolve({ rows: [{ ...row }], rowCount: 1 });
      }
      return Promise.resolve({ rows: [], rowCount: 0 });
    }

    // ---- DELETE / fallback ----
    return Promise.resolve({ rows: [], rowCount: 0 });
  }

  return { tables, query };
})();

module.exports = {
  query,
  pool,
  memoryDb,
  getPool: () => pool,
  isConnected: () => isConnected,
  isDatabaseConnected: () => isConnected,
};
