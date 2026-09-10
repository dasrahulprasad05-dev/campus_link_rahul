/* ============================================================
   CAMPUSLINK — Database Pool & Connection Manager
   Real PostgreSQL connection pooling via 'pg' with SSL support
   and fallback in-memory simulation for offline development.
   Strictly synchronized with PostgreSQL 11-table schema.
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
 * In-memory fallback database that simulates schema tables for offline / testing.
 * Strictly adheres to the 11-table PostgreSQL schema in infra/db/schema.sql.
 */
const memoryDb = (() => {
  const bcrypt = require('bcryptjs');
  const defaultHash = bcrypt.hashSync('demo123', 10);

  const tables = {
    users: [
      { id: 'u-1', name: 'Ananya Sharma', email: 'student@campuslink.in', password_hash: defaultHash, role: 'student', avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'u-2', name: 'Dr. Rajesh Nayak', email: 'admin@campuslink.in', password_hash: defaultHash, role: 'admin', avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'u-3', name: 'Sneha Patel', email: 'recruiter@campuslink.in', password_hash: defaultHash, role: 'recruiter', avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'u-4', name: 'Prof. Suresh Mishra', email: 'mentor@campuslink.in', password_hash: defaultHash, role: 'mentor', avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    companies: [
      { id: 'c-1', name: 'TechNova Solutions', industry: 'Software & Cloud', website: 'https://technova.example.com', status: 'active', created_at: new Date().toISOString() },
      { id: 'c-2', name: 'AxisGrid Analytics', industry: 'FinTech & Analytics', website: 'https://axisgrid.example.com', status: 'active', created_at: new Date().toISOString() },
      { id: 'c-3', name: 'CloudCraft Tech', industry: 'Cloud Engineering', website: 'https://cloudcraft.example.com', status: 'active', created_at: new Date().toISOString() },
    ],
    jobs: [
      {
        id: 'job-1',
        company_id: 'c-1',
        recruiter_id: 'u-3',
        title: 'Graduate Data Analyst',
        description: 'Analyze large-scale operational data, build dashboards, and report KPI trends.',
        location: 'Bhubaneswar',
        type: 'Full-time',
        skills_required: ['SQL', 'Python', 'Power BI'],
        min_cgpa: 7.0,
        deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 'job-2',
        company_id: 'c-2',
        recruiter_id: 'u-3',
        title: 'Business Intelligence Intern',
        description: 'Design interactive analytics dashboards and executive business reports.',
        location: 'Hybrid',
        type: 'Internship',
        skills_required: ['SQL', 'Excel', 'Tableau'],
        min_cgpa: 6.5,
        deadline: new Date(Date.now() + 20 * 86400000).toISOString(),
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 'job-3',
        company_id: 'c-3',
        recruiter_id: 'u-3',
        title: 'Junior Software Engineer',
        description: 'Build robust backend APIs and high-availability cloud microservices.',
        location: 'Bengaluru',
        type: 'Full-time',
        skills_required: ['JavaScript', 'React', 'Node.js'],
        min_cgpa: 7.5,
        deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
        status: 'active',
        created_at: new Date().toISOString()
      },
    ],
    applications: [
      {
        id: 'app-1',
        student_id: 'sp-1',
        job_id: 'job-1',
        status: 'interview',
        current_round: 'Technical Interview',
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'app-2',
        student_id: 'sp-1',
        job_id: 'job-2',
        status: 'applied',
        current_round: 'Resume Screening',
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    drives: [
      {
        id: 'drive-1',
        company_id: 'c-1',
        role: 'Graduate Software Engineer',
        drive_date: new Date(Date.now() + 5 * 86400000).toISOString(),
        venue: 'Auditorium Hall A',
        min_cgpa: 7.5,
        branches: ['CSE', 'IT', 'ECE'],
        status: 'scheduled',
        created_at: new Date().toISOString()
      }
    ]
  };

  // Helper to join job details with company info
  function populateJob(job) {
    const comp = tables.companies.find(c => c.id === job.company_id);
    return {
      ...job,
      skills: job.skills_required,
      company: comp ? comp.name : 'Unknown Company',
      company_name: comp ? comp.name : 'Unknown Company',
      company_industry: comp ? comp.industry : 'Technology',
    };
  }

  // Helper to join application details
  function populateApp(app) {
    const job = tables.jobs.find(j => j.id === app.job_id);
    const comp = job ? tables.companies.find(c => c.id === job.company_id) : null;
    const prof = tables.student_profiles.find(p => p.id === app.student_id);
    const user = prof ? tables.users.find(u => u.id === prof.user_id) : null;

    return {
      ...app,
      round: app.current_round,
      applied_date: app.applied_at,
      job: job ? job.title : 'Job Opportunity',
      job_title: job ? job.title : 'Job Opportunity',
      job_location: job ? job.location : 'Remote',
      job_type: job ? job.type : 'Full-time',
      company: comp ? comp.name : 'Company',
      company_name: comp ? comp.name : 'Company',
      student_name: user ? user.name : 'Student Candidate',
      student_email: user ? user.email : '',
      cgpa: prof ? prof.cgpa : 8.0,
      branch: prof ? prof.branch : 'Engineering',
    };
  }

  function query(text, params = []) {
    const q = text.trim().toLowerCase();

    // 1. SELECT FROM users WHERE email = $1
    if (q.includes('from users where email =')) {
      const email = String(params[0] || '').toLowerCase();
      const user = tables.users.find(u => u.email.toLowerCase() === email);
      return Promise.resolve({ rows: user ? [{ ...user }] : [], rowCount: user ? 1 : 0 });
    }

    // 2. SELECT FROM users WHERE id = $1
    if (q.includes('from users where id =')) {
      const id = params[0];
      const user = tables.users.find(u => u.id === id);
      return Promise.resolve({ rows: user ? [{ ...user }] : [], rowCount: user ? 1 : 0 });
    }

    // 3. SELECT FROM users (all)
    if (q.includes('from users') && !q.includes('where')) {
      return Promise.resolve({ rows: [...tables.users], rowCount: tables.users.length });
    }

    // 4. INSERT INTO users
    if (q.includes('insert into users')) {
      const [id, name, email, passwordHash, role] = params;
      const newUser = {
        id: id || `u-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        role: role || 'student',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      tables.users.push(newUser);
      return Promise.resolve({ rows: [newUser], rowCount: 1 });
    }

    // 5. SELECT FROM student_profiles
    if (q.includes('from student_profiles where user_id =') || q.includes('from student_profiles where id =')) {
      const idOrUserId = params[0];
      const prof = tables.student_profiles.find(p => p.user_id === idOrUserId || p.id === idOrUserId);
      return Promise.resolve({ rows: prof ? [{ ...prof }] : [], rowCount: prof ? 1 : 0 });
    }

    // 6. INSERT INTO student_profiles
    if (q.includes('insert into student_profiles')) {
      const [id, userId, regNo, branch, year, cgpa, targetRole, phone, linkedin, github, skills, certs, completion, score] = params;
      const newProf = {
        id: id || `sp-${Date.now()}`,
        user_id: userId,
        reg_no: regNo || null,
        branch: branch || 'Engineering',
        year: year || 2026,
        cgpa: cgpa || 8.0,
        target_role: targetRole || 'Software Engineer',
        phone: phone || '',
        linkedin: linkedin || '',
        github: github || '',
        skills: Array.isArray(skills) ? skills : [],
        certifications: Array.isArray(certs) ? certs : [],
        profile_completion: completion || 50,
        readiness_score: score || 70,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      tables.student_profiles.push(newProf);
      return Promise.resolve({ rows: [newProf], rowCount: 1 });
    }

    // 7. UPDATE student_profiles
    if (q.includes('update student_profiles')) {
      const [targetRole, skills, cgpa, phone, userId] = params;
      const prof = tables.student_profiles.find(p => p.user_id === userId);
      if (prof) {
        if (targetRole) prof.target_role = targetRole;
        if (skills) prof.skills = skills;
        if (cgpa) prof.cgpa = cgpa;
        if (phone) prof.phone = phone;
        prof.updated_at = new Date().toISOString();
        return Promise.resolve({ rows: [{ ...prof }], rowCount: 1 });
      }
      return Promise.resolve({ rows: [], rowCount: 0 });
    }

    // 8. SELECT FROM companies WHERE lower(name) = lower($1)
    if (q.includes('from companies where lower(name) = lower($1)')) {
      const name = String(params[0] || '').toLowerCase().trim();
      const comp = tables.companies.find(c => c.name.toLowerCase().trim() === name);
      return Promise.resolve({ rows: comp ? [{ ...comp }] : [], rowCount: comp ? 1 : 0 });
    }

    // 9. SELECT FROM companies WHERE id = $1
    if (q.includes('from companies where id =')) {
      const id = params[0];
      const comp = tables.companies.find(c => c.id === id);
      return Promise.resolve({ rows: comp ? [{ ...comp }] : [], rowCount: comp ? 1 : 0 });
    }

    // 10. INSERT INTO companies
    if (q.includes('insert into companies')) {
      const [id, name, industry, website, status] = params;
      const newComp = {
        id: id || `c-${Date.now()}`,
        name,
        industry: industry || 'Technology',
        website: website || null,
        status: status || 'active',
        created_at: new Date().toISOString()
      };
      tables.companies.unshift(newComp);
      return Promise.resolve({ rows: [newComp], rowCount: 1 });
    }

    // 11. SELECT FROM companies (all)
    if (q.includes('from companies')) {
      return Promise.resolve({ rows: [...tables.companies], rowCount: tables.companies.length });
    }

    // 12. SELECT FROM jobs WHERE j.id = $1 or id = $1
    if (q.includes('from jobs') && (q.includes('where j.id =') || q.includes('where id ='))) {
      const id = params[0];
      const job = tables.jobs.find(j => j.id === id);
      return Promise.resolve({ rows: job ? [populateJob(job)] : [], rowCount: job ? 1 : 0 });
    }

    // 13. SELECT FROM jobs
    if (q.includes('from jobs')) {
      return Promise.resolve({ rows: tables.jobs.map(populateJob), rowCount: tables.jobs.length });
    }

    // 14. INSERT INTO jobs (aligned with 11-column schema)
    if (q.includes('insert into jobs')) {
      const [id, companyId, recruiterId, title, description, location, type, skillsRequired, minCgpa, deadline, status] = params;
      const newJob = {
        id: id || `job-${Date.now()}`,
        company_id: companyId,
        recruiter_id: recruiterId,
        title,
        description: description || null,
        location: location || 'Bhubaneswar',
        type: type || 'Full-time',
        skills_required: Array.isArray(skillsRequired) ? skillsRequired : [],
        min_cgpa: minCgpa || 0,
        deadline: deadline || null,
        status: status || 'active',
        created_at: new Date().toISOString(),
      };
      tables.jobs.unshift(newJob);
      return Promise.resolve({ rows: [populateJob(newJob)], rowCount: 1 });
    }

    // 15. SELECT FROM applications WHERE a.id = $1
    if (q.includes('from applications') && q.includes('where a.id =')) {
      const id = params[0];
      const app = tables.applications.find(a => a.id === id);
      return Promise.resolve({ rows: app ? [populateApp(app)] : [], rowCount: app ? 1 : 0 });
    }

    // 16. SELECT FROM applications WHERE student_id = ...
    if (q.includes('from applications') && (q.includes('where a.student_id =') || q.includes('where student_id ='))) {
      const uid = params[0];
      const prof = tables.student_profiles.find(p => p.user_id === uid || p.id === uid);
      const targetId = prof ? prof.id : uid;
      const apps = tables.applications.filter(a => a.student_id === targetId || a.student_id === uid);
      return Promise.resolve({ rows: apps.map(populateApp), rowCount: apps.length });
    }

    // 17. SELECT FROM applications (all)
    if (q.includes('from applications')) {
      return Promise.resolve({ rows: tables.applications.map(populateApp), rowCount: tables.applications.length });
    }

    // 18. INSERT INTO applications
    if (q.includes('insert into applications')) {
      const [id, studentId, jobId, status, currentRound] = params;
      const newApp = {
        id: id || `app-${Date.now()}`,
        student_id: studentId,
        job_id: jobId,
        status: status || 'applied',
        current_round: currentRound || 'Resume Screening',
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      tables.applications.unshift(newApp);
      return Promise.resolve({ rows: [populateApp(newApp)], rowCount: 1 });
    }

    // 19. UPDATE applications SET status
    if (q.includes('update applications') && q.includes('status')) {
      const [status, currentRound, id] = params;
      const app = tables.applications.find(a => a.id === id);
      if (app) {
        if (status) app.status = status;
        if (currentRound) app.current_round = currentRound;
        app.updated_at = new Date().toISOString();
        return Promise.resolve({ rows: [populateApp(app)], rowCount: 1 });
      }
      return Promise.resolve({ rows: [], rowCount: 0 });
    }

    // 20. SELECT FROM drives
    if (q.includes('from drives')) {
      let drives = tables.drives;
      if (q.includes('where d.id =') || q.includes('where id =')) {
        const id = params[0];
        drives = tables.drives.filter(d => d.id === id);
      }
      const drivesWithComp = drives.map(d => {
        const comp = tables.companies.find(c => c.id === d.company_id);
        return {
          ...d,
          date: d.drive_date,
          company: comp ? comp.name : 'Company',
          company_name: comp ? comp.name : 'Company',
        };
      });
      return Promise.resolve({ rows: drivesWithComp, rowCount: drivesWithComp.length });
    }

    // 21. INSERT INTO drives
    if (q.includes('insert into drives')) {
      const [id, companyId, role, driveDate, venue, minCgpa, branches, status] = params;
      const newDrive = {
        id: id || `drive-${Date.now()}`,
        company_id: companyId,
        role,
        drive_date: driveDate,
        venue: venue || 'Auditorium',
        min_cgpa: minCgpa || 0,
        branches: Array.isArray(branches) ? branches : [],
        status: status || 'scheduled',
        created_at: new Date().toISOString()
      };
      tables.drives.unshift(newDrive);
      return Promise.resolve({ rows: [newDrive], rowCount: 1 });
    }

    // Fallback: empty rows
    return Promise.resolve({ rows: [], rowCount: 0 });
  }

  return { tables, query };
})();

module.exports = {
  query,
  pool,
  getPool: () => pool,
  isConnected: () => isConnected,
  isDatabaseConnected: () => isConnected,
};
