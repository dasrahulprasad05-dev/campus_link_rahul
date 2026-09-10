/* ============================================================
   CAMPUSLINK — Database Pool & Connection Manager
   Real PostgreSQL connection pooling via 'pg' with SSL support
   and fallback in-memory simulation for offline development.
   ============================================================ */

require('dotenv').config();
const { Pool } = require('pg');

let pool = null;
let isConnected = false;

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

    // Test connection
    pool.query('SELECT NOW()')
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
  if (pool && isConnected) {
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

  // If no DB is connected, delegate to in-memory simulated queries
  return memoryDb.query(text, params);
}

/**
 * In-memory fallback database that simulates schema tables for offline / testing
 */
const memoryDb = (() => {
  const demo = require('../data/demo-data');
  const bcrypt = require('bcryptjs');

  // Pre-hashed password for "demo123"
  const defaultHash = bcrypt.hashSync('demo123', 10);

  const tables = {
    users: [
      { id: 'u-1', name: 'Ananya Sharma', email: 'student@campuslink.in', password: defaultHash, role: 'student', is_active: true },
      { id: 'u-2', name: 'Dr. Rajesh Nayak', email: 'admin@campuslink.in', password: defaultHash, role: 'admin', is_active: true },
      { id: 'u-3', name: 'Sneha Patel', email: 'recruiter@campuslink.in', password: defaultHash, role: 'recruiter', is_active: true },
      { id: 'u-4', name: 'Prof. Suresh Mishra', email: 'mentor@campuslink.in', password: defaultHash, role: 'mentor', is_active: true },
    ],
    student_profiles: [
      {
        id: 'sp-1',
        user_id: 'u-1',
        reg_no: 'UNIV2022CSE1042',
        branch: 'Computer Science & Engineering',
        year: 2026,
        cgpa: 8.42,
        target_role: 'Data Analyst',
        phone: '+91 98765 43210',
        linkedin: 'linkedin.com/in/ananya-sharma',
        github: 'github.com/ananyasharma',
        skills: ['Python', 'SQL', 'Excel', 'Data Analysis', 'Communication', 'Statistics'],
        certifications: ['Google Data Analytics Certificate', 'AWS Cloud Practitioner'],
        profile_completion: 91,
        readiness_score: 78,
      }
    ],
    jobs: demo.student.jobs.map((j, idx) => ({
      id: j.id || `job-${idx + 1}`,
      title: j.title,
      company: j.company,
      location: j.location,
      type: j.type,
      deadline: j.deadline,
      skills: j.skills || [],
      match: j.match || 75,
      status: 'active',
      created_at: new Date().toISOString()
    })),
    applications: demo.student.applications.map((a, idx) => ({
      id: a.id || `app-${idx + 1}`,
      student_id: 'u-1',
      job_id: `job-${idx + 1}`,
      job: a.job,
      company: a.company,
      status: a.status,
      round: a.round,
      applied_date: a.appliedDate || new Date().toISOString(),
      score: 82
    })),
    drives: demo.admin.drives.map((d, idx) => ({
      id: `drive-${idx + 1}`,
      company: d.company,
      role: d.role,
      date: d.date,
      eligible: d.eligible,
      applied: d.applied,
      status: d.status,
      venue: d.venue
    })),
    companies: demo.admin.companies.map((c, idx) => ({
      id: `comp-${idx + 1}`,
      name: c.name,
      industry: c.industry,
      jobs: c.jobs,
      hires: c.hires,
      status: c.status
    }))
  };

  function query(text, params = []) {
    const q = text.trim().toLowerCase();

    // SELECT FROM users WHERE email = $1
    if (q.includes('from users where email =')) {
      const email = String(params[0] || '').toLowerCase();
      const user = tables.users.find(u => u.email.toLowerCase() === email);
      return Promise.resolve({ rows: user ? [{ ...user }] : [], rowCount: user ? 1 : 0 });
    }

    // SELECT FROM users WHERE id = $1
    if (q.includes('from users where id =')) {
      const id = params[0];
      const user = tables.users.find(u => u.id === id);
      return Promise.resolve({ rows: user ? [{ ...user }] : [], rowCount: user ? 1 : 0 });
    }

    // SELECT FROM users (all)
    if (q.includes('from users')) {
      return Promise.resolve({ rows: [...tables.users], rowCount: tables.users.length });
    }

    // INSERT INTO users
    if (q.includes('insert into users')) {
      const [id, name, email, password, role] = params;
      const newUser = { id: id || `u-${Date.now()}`, name, email: email.toLowerCase(), password, role: role || 'student', is_active: true };
      tables.users.push(newUser);
      return Promise.resolve({ rows: [newUser], rowCount: 1 });
    }

    // SELECT FROM student_profiles WHERE user_id = $1
    if (q.includes('from student_profiles where user_id =')) {
      const uid = params[0];
      const prof = tables.student_profiles.find(p => p.user_id === uid);
      return Promise.resolve({ rows: prof ? [{ ...prof }] : [], rowCount: prof ? 1 : 0 });
    }

    // SELECT FROM jobs
    if (q.includes('from jobs')) {
      return Promise.resolve({ rows: [...tables.jobs], rowCount: tables.jobs.length });
    }

    // SELECT FROM applications WHERE student_id = $1
    if (q.includes('from applications where student_id =')) {
      const uid = params[0];
      const apps = tables.applications.filter(a => a.student_id === uid);
      return Promise.resolve({ rows: apps, rowCount: apps.length });
    }

    // SELECT FROM applications
    if (q.includes('from applications')) {
      return Promise.resolve({ rows: [...tables.applications], rowCount: tables.applications.length });
    }

    // INSERT INTO applications
    if (q.includes('insert into applications')) {
      const [id, studentId, jobId, job, company, status, round] = params;
      const newApp = { id: id || `app-${Date.now()}`, student_id: studentId, job_id: jobId, job, company, status: status || 'applied', round: round || 'Review', applied_date: new Date().toISOString() };
      tables.applications.push(newApp);
      return Promise.resolve({ rows: [newApp], rowCount: 1 });
    }

    // SELECT FROM drives
    if (q.includes('from drives')) {
      return Promise.resolve({ rows: [...tables.drives], rowCount: tables.drives.length });
    }

    // SELECT FROM companies
    if (q.includes('from companies')) {
      return Promise.resolve({ rows: [...tables.companies], rowCount: tables.companies.length });
    }

    // INSERT INTO jobs
    if (q.includes('insert into jobs')) {
      const [id, title, company, location, type, deadline, skills, match, status] = params;
      const newJob = {
        id: id || `job-${Date.now()}`,
        title,
        company,
        location: location || 'Bhubaneswar',
        type: type || 'Full-time',
        deadline: deadline || 'In 14 days',
        skills: Array.isArray(skills) ? skills : [],
        match: match || 75,
        status: status || 'active',
        created_at: new Date().toISOString(),
      };
      tables.jobs.unshift(newJob);
      return Promise.resolve({ rows: [newJob], rowCount: 1 });
    }

    // UPDATE applications SET status
    if (q.includes('update applications') && q.includes('status')) {
      const [status, round, id] = params;
      const app = tables.applications.find(a => a.id === id);
      if (app) {
        app.status = status;
        if (round) app.round = round;
        return Promise.resolve({ rows: [{ ...app }], rowCount: 1 });
      }
      return Promise.resolve({ rows: [], rowCount: 0 });
    }

    // INSERT INTO student_profiles
    if (q.includes('insert into student_profiles')) {
      const [id, userId, regNo, branch, year, cgpa, targetRole, phone] = params;
      const newProf = {
        id: id || `sp-${Date.now()}`,
        user_id: userId,
        reg_no: regNo || '',
        branch: branch || 'Computer Science',
        year: year || 2026,
        cgpa: cgpa || 7.5,
        target_role: targetRole || 'Software Engineer',
        phone: phone || '',
        skills: ['SQL', 'Python', 'Web Development'],
        certifications: [],
        profile_completion: 75,
        readiness_score: 70,
      };
      tables.student_profiles.push(newProf);
      return Promise.resolve({ rows: [newProf], rowCount: 1 });
    }

    // INSERT INTO drives
    if (q.includes('insert into drives')) {
      const [id, company, role, date, venue, eligible] = params;
      const newDrive = {
        id: id || `drive-${Date.now()}`,
        company,
        role,
        date: date || 'TBD',
        venue: venue || 'Seminar Hall A',
        eligible: eligible || 0,
        applied: 0,
        status: 'scheduled',
      };
      tables.drives.push(newDrive);
      return Promise.resolve({ rows: [newDrive], rowCount: 1 });
    }

    // Generic fallback for queries
    return Promise.resolve({ rows: [], rowCount: 0 });
  }

  return { query, tables };
})();

module.exports = {
  query,
  isDatabaseConnected: () => isConnected,
  getPool: () => pool
};
