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
 * In-memory fallback database that simulates schema tables for offline / testing.
 * Strictly adheres to the 11-table PostgreSQL schema in infra/db/schema.sql.
 */
const memoryDb = (() => {
  const bcrypt = require('bcryptjs');
  const defaultHash = bcrypt.hashSync('rahul2005', 10);

  const now = new Date().toISOString();
  const d = (days) => new Date(Date.now() + days * 86400000).toISOString();

  const tables = {
    users: [
      { id: 'u-tpo-abit', name: 'Training & Placement Office ABIT', email: 'rahulprasaddas9@gmail.com', password_hash: defaultHash, role: 'admin', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
      { id: 'u-recruiter-tcs', name: 'TCS BHUBANESWAR', email: 'ommprasadd363@gmail.com', password_hash: defaultHash, role: 'recruiter', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
      { id: 'u-mentor-rahul', name: 'Prof. Rahul Prasad Das', email: 'rahulprsaddas@gmail.com', password_hash: defaultHash, role: 'mentor', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
      { id: 'u-stu-001', name: 'Ananya Sharma', email: 'ananya.sharma@campuslink.in', password_hash: defaultHash, role: 'student', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
      { id: 'u-stu-002', name: 'Vikram Rao', email: 'vikram.rao@campuslink.in', password_hash: defaultHash, role: 'student', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
      { id: 'u-stu-003', name: 'Soham Das', email: 'soham.das@campuslink.in', password_hash: defaultHash, role: 'student', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
      { id: 'u-stu-004', name: 'Rohan Patel', email: 'rohan.patel@campuslink.in', password_hash: defaultHash, role: 'student', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
      { id: 'u-stu-005', name: 'Meera Sahoo', email: 'meera.sahoo@campuslink.in', password_hash: defaultHash, role: 'student', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
      { id: 'u-stu-006', name: 'Priya Das', email: 'priya.das@campuslink.in', password_hash: defaultHash, role: 'student', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
      { id: 'u-stu-007', name: 'Rahul Kumar', email: 'rahul.kumar@campuslink.in', password_hash: defaultHash, role: 'student', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
      { id: 'u-stu-008', name: 'Priti Mohanty', email: 'priti.mohanty@campuslink.in', password_hash: defaultHash, role: 'student', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
      { id: 'u-stu-009', name: 'Arjun Behera', email: 'arjun.behera@campuslink.in', password_hash: defaultHash, role: 'student', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
      { id: 'u-stu-010', name: 'Sneha Mishra', email: 'sneha.mishra@campuslink.in', password_hash: defaultHash, role: 'student', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
      { id: 'u-stu-011', name: 'Aditya Nayak', email: 'aditya.nayak@campuslink.in', password_hash: defaultHash, role: 'student', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
      { id: 'u-stu-012', name: 'Kavya Reddy', email: 'kavya.reddy@campuslink.in', password_hash: defaultHash, role: 'student', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
      { id: 'u-stu-013', name: 'Deepak Pradhan', email: 'deepak.pradhan@campuslink.in', password_hash: defaultHash, role: 'student', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
      { id: 'u-stu-014', name: 'Tanvi Patra', email: 'tanvi.patra@campuslink.in', password_hash: defaultHash, role: 'student', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
      { id: 'u-stu-015', name: 'Nikhil Swain', email: 'nikhil.swain@campuslink.in', password_hash: defaultHash, role: 'student', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
      { id: 'u-stu-016', name: 'Isha Tripathi', email: 'isha.tripathi@campuslink.in', password_hash: defaultHash, role: 'student', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
      { id: 'u-stu-017', name: 'Saurav Mahapatra', email: 'saurav.mahapatra@campuslink.in', password_hash: defaultHash, role: 'student', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
      { id: 'u-stu-018', name: 'Ritika Samantray', email: 'ritika.samantray@campuslink.in', password_hash: defaultHash, role: 'student', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
      { id: 'u-stu-019', name: 'Aman Sethi', email: 'aman.sethi@campuslink.in', password_hash: defaultHash, role: 'student', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
      { id: 'u-stu-020', name: 'Pooja Lenka', email: 'pooja.lenka@campuslink.in', password_hash: defaultHash, role: 'student', avatar_url: null, created_at: now, updated_at: now, email_verified: true },
    ],
    student_profiles: [
      { id: 'sp-001', user_id: 'u-stu-001', reg_no: 'ABIT2022CSE001', branch: 'Computer Science & Engineering', year: 2026, cgpa: 8.42, target_role: 'Data Analyst', phone: '+91 98765 43210', linkedin: 'linkedin.com/in/ananya-sharma', github: 'github.com/ananyasharma', skills: ['Python','SQL','Excel','Data Analysis','Communication','Statistics','Power BI'], certifications: ['Google Data Analytics Certificate','AWS Cloud Practitioner'], profile_completion: 91, readiness_score: 78, aptitude_score: 72, communication_score: 80, interview_score: 65, backlogs: 0, projects_count: 3, created_at: now, updated_at: now },
      { id: 'sp-002', user_id: 'u-stu-002', reg_no: 'ABIT2022IT001', branch: 'Information Technology', year: 2026, cgpa: 7.89, target_role: 'Software Engineer', phone: '+91 98765 43211', linkedin: 'linkedin.com/in/vikram-rao', github: 'github.com/vikramrao', skills: ['Java','Python','Spring Boot','SQL','Git','DSA'], certifications: ['AWS Solutions Architect'], profile_completion: 85, readiness_score: 82, aptitude_score: 78, communication_score: 70, interview_score: 75, backlogs: 0, projects_count: 4, created_at: now, updated_at: now },
      { id: 'sp-003', user_id: 'u-stu-003', reg_no: 'ABIT2022ETC001', branch: 'Electronics & Telecom', year: 2026, cgpa: 7.65, target_role: 'Software Engineer', phone: '+91 98765 43212', linkedin: 'linkedin.com/in/soham-das', github: 'github.com/sohamdas', skills: ['Python','C++','SQL','Statistics','Power BI'], certifications: [], profile_completion: 72, readiness_score: 71, aptitude_score: 68, communication_score: 65, interview_score: 58, backlogs: 0, projects_count: 2, created_at: now, updated_at: now },
      { id: 'sp-004', user_id: 'u-stu-004', reg_no: 'ABIT2022CSE002', branch: 'Computer Science & Engineering', year: 2026, cgpa: 7.12, target_role: 'Software Engineer', phone: '+91 98765 43213', linkedin: 'linkedin.com/in/rohan-patel', github: 'github.com/rohanpatel', skills: ['JavaScript','HTML','CSS'], certifications: [], profile_completion: 45, readiness_score: 52, aptitude_score: 48, communication_score: 55, interview_score: 40, backlogs: 1, projects_count: 1, created_at: now, updated_at: now },
      { id: 'sp-005', user_id: 'u-stu-005', reg_no: 'ABIT2022IT002', branch: 'Information Technology', year: 2026, cgpa: 8.01, target_role: 'Data Analyst', phone: '+91 98765 43214', linkedin: 'linkedin.com/in/meera-sahoo', github: 'github.com/meerasahoo', skills: ['SQL','Python','Excel'], certifications: ['Tableau Desktop Specialist'], profile_completion: 60, readiness_score: 61, aptitude_score: 55, communication_score: 62, interview_score: 50, backlogs: 0, projects_count: 1, created_at: now, updated_at: now },
      { id: 'sp-006', user_id: 'u-stu-006', reg_no: 'ABIT2022CSE003', branch: 'Computer Science & Engineering', year: 2026, cgpa: 6.78, target_role: 'Web Developer', phone: '+91 98765 43215', linkedin: 'linkedin.com/in/priya-das', github: 'github.com/priyadeas', skills: ['HTML','CSS','JavaScript'], certifications: [], profile_completion: 40, readiness_score: 45, aptitude_score: 38, communication_score: 50, interview_score: 35, backlogs: 2, projects_count: 0, created_at: now, updated_at: now },
      { id: 'sp-007', user_id: 'u-stu-007', reg_no: 'ABIT2022CSE004', branch: 'Computer Science & Engineering', year: 2026, cgpa: 8.65, target_role: 'Software Engineer', phone: '+91 98765 43216', linkedin: 'linkedin.com/in/rahul-kumar', github: 'github.com/rahulkumar', skills: ['Java','Spring Boot','SQL','DSA','System Design','Docker','AWS','Git'], certifications: ['AWS Solutions Architect','Oracle Java SE'], profile_completion: 95, readiness_score: 88, aptitude_score: 85, communication_score: 78, interview_score: 82, backlogs: 0, projects_count: 5, created_at: now, updated_at: now },
      { id: 'sp-008', user_id: 'u-stu-008', reg_no: 'ABIT2022CSE005', branch: 'Computer Science & Engineering', year: 2026, cgpa: 8.15, target_role: 'Data Analyst', phone: '+91 98765 43217', linkedin: 'linkedin.com/in/priti-mohanty', github: 'github.com/pritimohanty', skills: ['Python','SQL','Machine Learning','R','Statistics'], certifications: [], profile_completion: 78, readiness_score: 79, aptitude_score: 74, communication_score: 72, interview_score: 68, backlogs: 0, projects_count: 3, created_at: now, updated_at: now },
      { id: 'sp-009', user_id: 'u-stu-009', reg_no: 'ABIT2022ETC002', branch: 'Electronics & Telecom', year: 2026, cgpa: 7.34, target_role: 'DevOps Engineer', phone: '+91 98765 43218', linkedin: 'linkedin.com/in/arjun-behera', github: 'github.com/arjunbehera', skills: ['Docker','Kubernetes','AWS','Linux','Python','Git','Terraform'], certifications: ['AWS Cloud Practitioner'], profile_completion: 80, readiness_score: 74, aptitude_score: 70, communication_score: 60, interview_score: 55, backlogs: 0, projects_count: 3, created_at: now, updated_at: now },
      { id: 'sp-010', user_id: 'u-stu-010', reg_no: 'ABIT2022CSE006', branch: 'Computer Science & Engineering', year: 2026, cgpa: 8.92, target_role: 'Data Analyst', phone: '+91 98765 43219', linkedin: 'linkedin.com/in/sneha-mishra', github: 'github.com/snehamis', skills: ['Python','SQL','Power BI','Tableau','Statistics','Excel','R'], certifications: ['Google Data Analytics Certificate','Tableau Desktop Specialist'], profile_completion: 92, readiness_score: 86, aptitude_score: 82, communication_score: 85, interview_score: 78, backlogs: 0, projects_count: 4, created_at: now, updated_at: now },
      { id: 'sp-011', user_id: 'u-stu-011', reg_no: 'ABIT2022IT003', branch: 'Information Technology', year: 2026, cgpa: 7.56, target_role: 'Software Engineer', phone: '+91 98765 43220', linkedin: 'linkedin.com/in/aditya-nayak', github: 'github.com/adityanayak', skills: ['JavaScript','React','Node.js','MongoDB','Git'], certifications: [], profile_completion: 68, readiness_score: 67, aptitude_score: 62, communication_score: 65, interview_score: 55, backlogs: 0, projects_count: 2, created_at: now, updated_at: now },
      { id: 'sp-012', user_id: 'u-stu-012', reg_no: 'ABIT2022CSE007', branch: 'Computer Science & Engineering', year: 2026, cgpa: 8.78, target_role: 'ML Engineer', phone: '+91 98765 43221', linkedin: 'linkedin.com/in/kavya-reddy', github: 'github.com/kavyareddy', skills: ['Python','PyTorch','TensorFlow','Statistics','SQL','Linear Algebra'], certifications: ['DeepLearning.AI Specialization'], profile_completion: 88, readiness_score: 84, aptitude_score: 80, communication_score: 75, interview_score: 72, backlogs: 0, projects_count: 4, created_at: now, updated_at: now },
      { id: 'sp-013', user_id: 'u-stu-013', reg_no: 'ABIT2022ME001', branch: 'Mechanical Engineering', year: 2026, cgpa: 6.45, target_role: 'Business Analyst', phone: '+91 98765 43222', linkedin: 'linkedin.com/in/deepak-pradhan', github: 'github.com/deepakp', skills: ['Excel','Communication','SQL'], certifications: [], profile_completion: 50, readiness_score: 42, aptitude_score: 40, communication_score: 65, interview_score: 38, backlogs: 1, projects_count: 1, created_at: now, updated_at: now },
      { id: 'sp-014', user_id: 'u-stu-014', reg_no: 'ABIT2022CSE008', branch: 'Computer Science & Engineering', year: 2026, cgpa: 7.90, target_role: 'Web Developer', phone: '+91 98765 43223', linkedin: 'linkedin.com/in/tanvi-patra', github: 'github.com/tanvipatra', skills: ['React','JavaScript','TypeScript','Node.js','Tailwind CSS','Git'], certifications: [], profile_completion: 75, readiness_score: 73, aptitude_score: 68, communication_score: 70, interview_score: 62, backlogs: 0, projects_count: 3, created_at: now, updated_at: now },
      { id: 'sp-015', user_id: 'u-stu-015', reg_no: 'ABIT2022ETC003', branch: 'Electronics & Telecom', year: 2026, cgpa: 7.22, target_role: 'Software Engineer', phone: '+91 98765 43224', linkedin: 'linkedin.com/in/nikhil-swain', github: 'github.com/nikhilswain', skills: ['C++','Java','Python','DSA'], certifications: [], profile_completion: 55, readiness_score: 58, aptitude_score: 52, communication_score: 55, interview_score: 45, backlogs: 0, projects_count: 1, created_at: now, updated_at: now },
      { id: 'sp-016', user_id: 'u-stu-016', reg_no: 'ABIT2022IT004', branch: 'Information Technology', year: 2026, cgpa: 8.34, target_role: 'Data Analyst', phone: '+91 98765 43225', linkedin: 'linkedin.com/in/isha-tripathi', github: 'github.com/ishatripathi', skills: ['Python','SQL','Excel','Power BI','Communication'], certifications: ['Google Data Analytics Certificate'], profile_completion: 82, readiness_score: 76, aptitude_score: 72, communication_score: 78, interview_score: 64, backlogs: 0, projects_count: 2, created_at: now, updated_at: now },
      { id: 'sp-017', user_id: 'u-stu-017', reg_no: 'ABIT2022CSE009', branch: 'Computer Science & Engineering', year: 2026, cgpa: 7.45, target_role: 'Software Engineer', phone: '+91 98765 43226', linkedin: 'linkedin.com/in/saurav-mahapatra', github: 'github.com/sauravmaha', skills: ['Java','Python','SQL','Git'], certifications: [], profile_completion: 62, readiness_score: 64, aptitude_score: 58, communication_score: 60, interview_score: 50, backlogs: 0, projects_count: 2, created_at: now, updated_at: now },
      { id: 'sp-018', user_id: 'u-stu-018', reg_no: 'ABIT2022CSE010', branch: 'Computer Science & Engineering', year: 2026, cgpa: 8.10, target_role: 'Software Engineer', phone: '+91 98765 43227', linkedin: 'linkedin.com/in/ritika-samantray', github: 'github.com/ritikas', skills: ['Python','Java','React','SQL','Docker','Git'], certifications: ['AWS Cloud Practitioner'], profile_completion: 78, readiness_score: 75, aptitude_score: 70, communication_score: 68, interview_score: 65, backlogs: 0, projects_count: 3, created_at: now, updated_at: now },
      { id: 'sp-019', user_id: 'u-stu-019', reg_no: 'ABIT2022ME002', branch: 'Mechanical Engineering', year: 2026, cgpa: 6.90, target_role: 'Business Analyst', phone: '+91 98765 43228', linkedin: 'linkedin.com/in/aman-sethi', github: 'github.com/amansethi', skills: ['Excel','Python','Communication'], certifications: [], profile_completion: 48, readiness_score: 48, aptitude_score: 42, communication_score: 70, interview_score: 35, backlogs: 1, projects_count: 0, created_at: now, updated_at: now },
      { id: 'sp-020', user_id: 'u-stu-020', reg_no: 'ABIT2022IT005', branch: 'Information Technology', year: 2026, cgpa: 7.78, target_role: 'Web Developer', phone: '+91 98765 43229', linkedin: 'linkedin.com/in/pooja-lenka', github: 'github.com/poojalenka', skills: ['HTML','CSS','JavaScript','React','Node.js','MongoDB'], certifications: [], profile_completion: 70, readiness_score: 68, aptitude_score: 60, communication_score: 65, interview_score: 55, backlogs: 0, projects_count: 2, created_at: now, updated_at: now },
    ],
    companies: [
      { id: 'c-001', name: 'TechNova Solutions', industry: 'IT Services', website: 'https://technova.example.com', status: 'active', created_at: now },
      { id: 'c-002', name: 'CloudCraft Tech', industry: 'Cloud & DevOps', website: 'https://cloudcraft.example.com', status: 'active', created_at: now },
      { id: 'c-003', name: 'AxisGrid Analytics', industry: 'Data Analytics', website: 'https://axisgrid.example.com', status: 'active', created_at: now },
      { id: 'c-004', name: 'Infosys', industry: 'IT Services', website: 'https://infosys.com', status: 'active', created_at: now },
      { id: 'c-005', name: 'Wipro', industry: 'IT Services', website: 'https://wipro.com', status: 'active', created_at: now },
      { id: 'c-006', name: 'TCS', industry: 'IT Services', website: 'https://tcs.com', status: 'active', created_at: now },
      { id: 'c-007', name: 'DeepSpark AI', industry: 'AI & ML', website: 'https://deepspark.example.com', status: 'active', created_at: now },
    ],
    jobs: [
      { id: 'job-001', company_id: 'c-001', recruiter_id: 'u-recruiter-tcs', title: 'Graduate Data Analyst', description: 'Analyze large-scale operational data, build dashboards, and report KPI trends. Requires SQL, Python, and visualization skills.', location: 'Bhubaneswar', type: 'Full-time', skills_required: ['SQL','Python','Power BI'], min_cgpa: 7.0, eligible_branches: ['CSE','IT','ETC'], max_backlogs: 0, deadline: d(14), status: 'active', created_at: now },
      { id: 'job-002', company_id: 'c-003', recruiter_id: 'u-recruiter-tcs', title: 'Business Intelligence Intern', description: 'Design interactive analytics dashboards and executive business reports.', location: 'Hybrid', type: 'Internship', skills_required: ['SQL','Excel','Tableau'], min_cgpa: 6.5, eligible_branches: ['CSE','IT','ETC','ME'], max_backlogs: 1, deadline: d(20), status: 'active', created_at: now },
      { id: 'job-003', company_id: 'c-002', recruiter_id: 'u-recruiter-tcs', title: 'Junior Software Engineer', description: 'Build robust backend APIs and high-availability cloud microservices. Strong DSA and system design thinking required.', location: 'Bengaluru', type: 'Full-time', skills_required: ['Java','Spring Boot','SQL','DSA','System Design'], min_cgpa: 7.5, eligible_branches: ['CSE','IT'], max_backlogs: 0, deadline: d(30), status: 'active', created_at: now },
      { id: 'job-004', company_id: 'c-007', recruiter_id: 'u-recruiter-tcs', title: 'ML Research Intern', description: 'Apply deep learning techniques to NLP and computer vision projects.', location: 'Remote', type: 'Internship', skills_required: ['Python','PyTorch','Statistics','Linear Algebra'], min_cgpa: 7.0, eligible_branches: ['CSE','IT','ETC'], max_backlogs: 0, deadline: d(25), status: 'active', created_at: now },
      { id: 'job-005', company_id: 'c-004', recruiter_id: 'u-recruiter-tcs', title: 'Systems Engineer', description: 'Core IT infrastructure role including application support, database management, and automation scripting.', location: 'Pune', type: 'Full-time', skills_required: ['Java','SQL','Linux','Python'], min_cgpa: 6.0, eligible_branches: ['CSE','IT','ETC','ME'], max_backlogs: 1, deadline: d(18), status: 'active', created_at: now },
      { id: 'job-006', company_id: 'c-005', recruiter_id: 'u-recruiter-tcs', title: 'Associate Developer', description: 'Full-stack development role building enterprise web applications with modern JavaScript frameworks.', location: 'Hyderabad', type: 'Full-time', skills_required: ['JavaScript','React','Node.js','SQL'], min_cgpa: 6.5, eligible_branches: ['CSE','IT'], max_backlogs: 1, deadline: d(22), status: 'active', created_at: now },
      { id: 'job-007', company_id: 'c-006', recruiter_id: 'u-recruiter-tcs', title: 'Digital Trainee', description: 'Comprehensive training program covering cloud, AI, and enterprise systems.', location: 'Chennai', type: 'Full-time', skills_required: ['Python','SQL','Communication'], min_cgpa: 6.0, eligible_branches: ['CSE','IT','ETC','ME'], max_backlogs: 2, deadline: d(35), status: 'active', created_at: now },
      { id: 'job-008', company_id: 'c-001', recruiter_id: 'u-recruiter-tcs', title: 'DevOps Engineer', description: 'Manage CI/CD pipelines, container orchestration, and cloud infrastructure.', location: 'Bhubaneswar', type: 'Full-time', skills_required: ['Docker','Kubernetes','AWS','Linux','Git','Terraform'], min_cgpa: 7.0, eligible_branches: ['CSE','IT','ETC'], max_backlogs: 0, deadline: d(28), status: 'active', created_at: now },
    ],
    applications: [
      { id: 'app-001', student_id: 'sp-001', job_id: 'job-001', status: 'interview', current_round: 'Technical Round 2', applied_at: d(-17), updated_at: now },
      { id: 'app-002', student_id: 'sp-001', job_id: 'job-002', status: 'shortlisted', current_round: 'Aptitude Test', applied_at: d(-14), updated_at: now },
      { id: 'app-003', student_id: 'sp-001', job_id: 'job-007', status: 'applied', current_round: 'Resume Screening', applied_at: d(-5), updated_at: now },
      { id: 'app-004', student_id: 'sp-002', job_id: 'job-003', status: 'interview', current_round: 'Technical Round 1', applied_at: d(-12), updated_at: now },
      { id: 'app-005', student_id: 'sp-002', job_id: 'job-005', status: 'offered', current_round: 'Offer Letter Sent', applied_at: d(-20), updated_at: now },
      { id: 'app-006', student_id: 'sp-003', job_id: 'job-005', status: 'applied', current_round: 'Resume Screening', applied_at: d(-8), updated_at: now },
      { id: 'app-007', student_id: 'sp-003', job_id: 'job-001', status: 'shortlisted', current_round: 'Aptitude Test', applied_at: d(-10), updated_at: now },
      { id: 'app-008', student_id: 'sp-004', job_id: 'job-007', status: 'applied', current_round: 'Resume Screening', applied_at: d(-3), updated_at: now },
      { id: 'app-009', student_id: 'sp-007', job_id: 'job-003', status: 'offered', current_round: 'Offer Letter Sent', applied_at: d(-22), updated_at: now },
      { id: 'app-010', student_id: 'sp-007', job_id: 'job-005', status: 'interview', current_round: 'HR Round', applied_at: d(-15), updated_at: now },
      { id: 'app-011', student_id: 'sp-007', job_id: 'job-008', status: 'shortlisted', current_round: 'Technical Test', applied_at: d(-7), updated_at: now },
      { id: 'app-012', student_id: 'sp-008', job_id: 'job-001', status: 'interview', current_round: 'Technical Round 1', applied_at: d(-16), updated_at: now },
      { id: 'app-013', student_id: 'sp-008', job_id: 'job-004', status: 'applied', current_round: 'Resume Screening', applied_at: d(-6), updated_at: now },
      { id: 'app-014', student_id: 'sp-012', job_id: 'job-004', status: 'interview', current_round: 'Technical Round 1', applied_at: d(-14), updated_at: now },
      { id: 'app-015', student_id: 'sp-010', job_id: 'job-001', status: 'offered', current_round: 'Offer Letter Sent', applied_at: d(-10), updated_at: now },
      { id: 'app-016', student_id: 'sp-010', job_id: 'job-002', status: 'interview', current_round: 'Final Round', applied_at: d(-12), updated_at: now },
      { id: 'app-017', student_id: 'sp-011', job_id: 'job-006', status: 'shortlisted', current_round: 'Coding Test', applied_at: d(-9), updated_at: now },
      { id: 'app-018', student_id: 'sp-014', job_id: 'job-006', status: 'interview', current_round: 'Technical Round 1', applied_at: d(-11), updated_at: now },
      { id: 'app-019', student_id: 'sp-009', job_id: 'job-008', status: 'interview', current_round: 'Technical Round 1', applied_at: d(-13), updated_at: now },
      { id: 'app-020', student_id: 'sp-016', job_id: 'job-001', status: 'shortlisted', current_round: 'Aptitude Test', applied_at: d(-7), updated_at: now },
      { id: 'app-021', student_id: 'sp-016', job_id: 'job-007', status: 'applied', current_round: 'Resume Screening', applied_at: d(-4), updated_at: now },
      { id: 'app-022', student_id: 'sp-017', job_id: 'job-005', status: 'applied', current_round: 'Resume Screening', applied_at: d(-6), updated_at: now },
      { id: 'app-023', student_id: 'sp-018', job_id: 'job-003', status: 'shortlisted', current_round: 'Coding Test', applied_at: d(-8), updated_at: now },
      { id: 'app-024', student_id: 'sp-015', job_id: 'job-005', status: 'applied', current_round: 'Resume Screening', applied_at: d(-4), updated_at: now },
      { id: 'app-025', student_id: 'sp-020', job_id: 'job-006', status: 'applied', current_round: 'Resume Screening', applied_at: d(-2), updated_at: now },
    ],
    drives: [
      { id: 'drive-001', company_id: 'c-001', role: 'Graduate Data Analyst', drive_date: d(5), venue: 'Seminar Hall A', min_cgpa: 7.0, branches: ['CSE','IT','ETC'], status: 'scheduled', created_at: now },
      { id: 'drive-002', company_id: 'c-002', role: 'Associate Engineer', drive_date: d(8), venue: 'Main Auditorium', min_cgpa: 7.5, branches: ['CSE','IT'], status: 'confirmed', created_at: now },
      { id: 'drive-003', company_id: 'c-003', role: 'BI Intern', drive_date: d(12), venue: 'Lab 204', min_cgpa: 6.5, branches: ['CSE','IT','ETC','ME'], status: 'draft', created_at: now },
      { id: 'drive-004', company_id: 'c-004', role: 'Systems Engineer', drive_date: d(18), venue: 'Seminar Hall A', min_cgpa: 6.0, branches: ['CSE','IT','ETC','ME'], status: 'draft', created_at: now },
      { id: 'drive-005', company_id: 'c-006', role: 'Digital Trainee', drive_date: d(25), venue: 'Main Auditorium', min_cgpa: 6.0, branches: ['CSE','IT','ETC','ME'], status: 'draft', created_at: now },
    ],
    // New tables for scheduling, offers, audit
    drive_slots: [
      { id: 'slot-001', drive_id: 'drive-001', start_time: d(5), end_time: d(5), venue: 'Seminar Hall A', panel_name: 'Panel A - TechNova', capacity: 50, created_at: now },
      { id: 'slot-002', drive_id: 'drive-001', start_time: d(5), end_time: d(5), venue: 'Seminar Hall A', panel_name: 'Panel B - TechNova', capacity: 50, created_at: now },
      { id: 'slot-003', drive_id: 'drive-002', start_time: d(8), end_time: d(8), venue: 'Main Auditorium', panel_name: 'Panel A - CloudCraft', capacity: 40, created_at: now },
      { id: 'slot-004', drive_id: 'drive-002', start_time: d(8), end_time: d(8), venue: 'Main Auditorium', panel_name: 'Panel B - CloudCraft', capacity: 40, created_at: now },
      { id: 'slot-005', drive_id: 'drive-004', start_time: d(5), end_time: d(5), venue: 'Seminar Hall A', panel_name: 'Panel A - Infosys', capacity: 60, created_at: now },
    ],
    drive_candidates: [
      { id: 'dc-001', drive_id: 'drive-001', student_id: 'sp-001', slot_id: 'slot-001', status: 'shortlisted', created_at: now },
      { id: 'dc-002', drive_id: 'drive-001', student_id: 'sp-008', slot_id: 'slot-001', status: 'shortlisted', created_at: now },
      { id: 'dc-003', drive_id: 'drive-001', student_id: 'sp-010', slot_id: 'slot-002', status: 'shortlisted', created_at: now },
      { id: 'dc-004', drive_id: 'drive-001', student_id: 'sp-016', slot_id: 'slot-002', status: 'shortlisted', created_at: now },
      { id: 'dc-005', drive_id: 'drive-002', student_id: 'sp-002', slot_id: 'slot-003', status: 'shortlisted', created_at: now },
      { id: 'dc-006', drive_id: 'drive-002', student_id: 'sp-007', slot_id: 'slot-003', status: 'shortlisted', created_at: now },
      { id: 'dc-007', drive_id: 'drive-002', student_id: 'sp-018', slot_id: 'slot-004', status: 'shortlisted', created_at: now },
      { id: 'dc-008', drive_id: 'drive-004', student_id: 'sp-007', slot_id: 'slot-005', status: 'shortlisted', created_at: now },
    ],
    offers: [
      { id: 'offer-001', application_id: 'app-005', student_id: 'sp-002', job_id: 'job-005', company_id: 'c-004', role: 'Systems Engineer', ctc_lpa: 6.50, offer_date: d(-18), acceptance_deadline: d(10), status: 'accepted', joining_date: d(45), joining_status: 'joining-pending', created_at: now, updated_at: now },
      { id: 'offer-002', application_id: 'app-009', student_id: 'sp-007', job_id: 'job-003', company_id: 'c-002', role: 'Junior Software Engineer', ctc_lpa: 14.00, offer_date: d(-20), acceptance_deadline: d(7), status: 'accepted', joining_date: d(30), joining_status: 'joining-pending', created_at: now, updated_at: now },
      { id: 'offer-003', application_id: 'app-015', student_id: 'sp-010', job_id: 'job-001', company_id: 'c-001', role: 'Graduate Data Analyst', ctc_lpa: 8.50, offer_date: d(-8), acceptance_deadline: d(14), status: 'pending', joining_date: null, joining_status: 'not-joined', created_at: now, updated_at: now },
      { id: 'offer-004', application_id: 'app-014', student_id: 'sp-012', job_id: 'job-004', company_id: 'c-007', role: 'ML Research Intern', ctc_lpa: 4.00, offer_date: d(-5), acceptance_deadline: d(15), status: 'pending', joining_date: null, joining_status: 'not-joined', created_at: now, updated_at: now },
    ],
    offer_documents: [
      { id: 'od-001', offer_id: 'offer-001', document_type: 'Aadhaar Card', status: 'verified', submitted_at: d(-15), verified_at: d(-14), deadline: d(5), created_at: now },
      { id: 'od-002', offer_id: 'offer-001', document_type: 'PAN Card', status: 'verified', submitted_at: d(-15), verified_at: d(-14), deadline: d(5), created_at: now },
      { id: 'od-003', offer_id: 'offer-001', document_type: 'Resume', status: 'verified', submitted_at: d(-16), verified_at: d(-15), deadline: d(5), created_at: now },
      { id: 'od-004', offer_id: 'offer-001', document_type: 'Degree Certificate', status: 'submitted', submitted_at: d(-10), verified_at: null, deadline: d(5), created_at: now },
      { id: 'od-005', offer_id: 'offer-001', document_type: 'Marksheet', status: 'submitted', submitted_at: d(-10), verified_at: null, deadline: d(5), created_at: now },
      { id: 'od-006', offer_id: 'offer-001', document_type: 'Photograph', status: 'verified', submitted_at: d(-15), verified_at: d(-14), deadline: d(5), created_at: now },
      { id: 'od-007', offer_id: 'offer-001', document_type: 'Medical Certificate', status: 'pending', submitted_at: null, verified_at: null, deadline: d(3), created_at: now },
      { id: 'od-008', offer_id: 'offer-001', document_type: 'Bank Details', status: 'verified', submitted_at: d(-12), verified_at: d(-11), deadline: d(5), created_at: now },
      { id: 'od-009', offer_id: 'offer-002', document_type: 'Aadhaar Card', status: 'verified', submitted_at: d(-18), verified_at: d(-17), deadline: d(10), created_at: now },
      { id: 'od-010', offer_id: 'offer-002', document_type: 'PAN Card', status: 'verified', submitted_at: d(-18), verified_at: d(-17), deadline: d(10), created_at: now },
      { id: 'od-011', offer_id: 'offer-002', document_type: 'Resume', status: 'verified', submitted_at: d(-19), verified_at: d(-18), deadline: d(10), created_at: now },
      { id: 'od-012', offer_id: 'offer-002', document_type: 'Degree Certificate', status: 'verified', submitted_at: d(-16), verified_at: d(-15), deadline: d(10), created_at: now },
      { id: 'od-013', offer_id: 'offer-002', document_type: 'Marksheet', status: 'verified', submitted_at: d(-16), verified_at: d(-15), deadline: d(10), created_at: now },
      { id: 'od-014', offer_id: 'offer-002', document_type: 'Photograph', status: 'verified', submitted_at: d(-18), verified_at: d(-17), deadline: d(10), created_at: now },
      { id: 'od-015', offer_id: 'offer-002', document_type: 'Medical Certificate', status: 'verified', submitted_at: d(-14), verified_at: d(-13), deadline: d(10), created_at: now },
      { id: 'od-016', offer_id: 'offer-002', document_type: 'Bank Details', status: 'verified', submitted_at: d(-15), verified_at: d(-14), deadline: d(10), created_at: now },
      { id: 'od-017', offer_id: 'offer-003', document_type: 'Aadhaar Card', status: 'pending', submitted_at: null, verified_at: null, deadline: d(12), created_at: now },
      { id: 'od-018', offer_id: 'offer-003', document_type: 'PAN Card', status: 'pending', submitted_at: null, verified_at: null, deadline: d(12), created_at: now },
      { id: 'od-019', offer_id: 'offer-003', document_type: 'Resume', status: 'submitted', submitted_at: d(-2), verified_at: null, deadline: d(12), created_at: now },
      { id: 'od-020', offer_id: 'offer-003', document_type: 'Degree Certificate', status: 'pending', submitted_at: null, verified_at: null, deadline: d(12), created_at: now },
      { id: 'od-021', offer_id: 'offer-003', document_type: 'Marksheet', status: 'pending', submitted_at: null, verified_at: null, deadline: d(12), created_at: now },
      { id: 'od-022', offer_id: 'offer-003', document_type: 'Photograph', status: 'pending', submitted_at: null, verified_at: null, deadline: d(12), created_at: now },
      { id: 'od-023', offer_id: 'offer-003', document_type: 'Medical Certificate', status: 'pending', submitted_at: null, verified_at: null, deadline: d(12), created_at: now },
      { id: 'od-024', offer_id: 'offer-003', document_type: 'Bank Details', status: 'pending', submitted_at: null, verified_at: null, deadline: d(12), created_at: now },
    ],
    readiness_configs: [
      { id: 'rc-001', role_name: 'Software Engineer', weights: { technical: 0.30, projects: 0.20, academics: 0.15, aptitude: 0.10, certifications: 0.10, communication: 0.05, interview: 0.10 }, created_at: now },
      { id: 'rc-002', role_name: 'Data Analyst', weights: { technical: 0.25, projects: 0.15, academics: 0.15, aptitude: 0.15, certifications: 0.10, communication: 0.10, interview: 0.10 }, created_at: now },
      { id: 'rc-003', role_name: 'Web Developer', weights: { technical: 0.30, projects: 0.25, academics: 0.10, aptitude: 0.10, certifications: 0.05, communication: 0.10, interview: 0.10 }, created_at: now },
      { id: 'rc-004', role_name: 'DevOps Engineer', weights: { technical: 0.30, projects: 0.20, academics: 0.10, aptitude: 0.10, certifications: 0.15, communication: 0.05, interview: 0.10 }, created_at: now },
      { id: 'rc-005', role_name: 'ML Engineer', weights: { technical: 0.30, projects: 0.20, academics: 0.15, aptitude: 0.10, certifications: 0.10, communication: 0.05, interview: 0.10 }, created_at: now },
      { id: 'rc-006', role_name: 'Business Analyst', weights: { technical: 0.15, projects: 0.15, academics: 0.15, aptitude: 0.15, certifications: 0.10, communication: 0.20, interview: 0.10 }, created_at: now },
    ],
    mentor_assignments: [
      { id: 'ma-001', mentor_id: 'u-mentor-rahul', student_id: 'sp-001', assigned_at: now },
      { id: 'ma-002', mentor_id: 'u-mentor-rahul', student_id: 'sp-004', assigned_at: now },
      { id: 'ma-003', mentor_id: 'u-mentor-rahul', student_id: 'sp-005', assigned_at: now },
      { id: 'ma-004', mentor_id: 'u-mentor-rahul', student_id: 'sp-002', assigned_at: now },
      { id: 'ma-005', mentor_id: 'u-mentor-rahul', student_id: 'sp-003', assigned_at: now },
    ],
    audit_log: [],
    roadmap_milestones: [],
    interview_sessions: [],
    readiness_history: [],
    projects: [],
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
      const [id, name, email, passwordHash, role, emailVerified, verificationToken] = params;
      const newUser = {
        id: id || `u-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        role: role || 'student',
        avatar_url: null,
        email_verified: emailVerified || false,
        verification_token: verificationToken || null,
        reset_password_token: null,
        reset_password_expires: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      tables.users.push(newUser);
      return Promise.resolve({ rows: [newUser], rowCount: 1 });
    }

    // 4a. SELECT FROM users WHERE verification_token = $1
    if (q.includes('from users where verification_token =')) {
      const token = params[0];
      const user = tables.users.find(u => u.verification_token === token);
      return Promise.resolve({ rows: user ? [{ ...user }] : [], rowCount: user ? 1 : 0 });
    }

    // 4b. UPDATE users SET email_verified = true
    if (q.includes('update users') && q.includes('email_verified = true')) {
      const userId = params[0];
      const user = tables.users.find(u => u.id === userId);
      if (user) {
        user.email_verified = true;
        user.verification_token = null;
        return Promise.resolve({ rows: [{ ...user }], rowCount: 1 });
      }
      return Promise.resolve({ rows: [], rowCount: 0 });
    }

    // 4c. UPDATE users SET reset_password_token
    if (q.includes('update users') && q.includes('reset_password_token = $1')) {
      const [token, expires, email] = params;
      const user = tables.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        user.reset_password_token = token;
        user.reset_password_expires = expires;
        return Promise.resolve({ rows: [{ ...user }], rowCount: 1 });
      }
      return Promise.resolve({ rows: [], rowCount: 0 });
    }

    // 4d. SELECT FROM users WHERE reset_password_token = $1
    if (q.includes('from users') && q.includes('reset_password_token = $1')) {
      const token = params[0];
      const user = tables.users.find(u => u.reset_password_token === token);
      return Promise.resolve({ rows: user ? [{ ...user }] : [], rowCount: user ? 1 : 0 });
    }

    // 4e. UPDATE users SET password_hash = $1
    if (q.includes('update users') && q.includes('password_hash = $1')) {
      const [newHash, userId] = params;
      const user = tables.users.find(u => u.id === userId);
      if (user) {
        user.password_hash = newHash;
        user.reset_password_token = null;
        user.reset_password_expires = null;
        return Promise.resolve({ rows: [{ ...user }], rowCount: 1 });
      }
      return Promise.resolve({ rows: [], rowCount: 0 });
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

    // ---- OFFERS ----
    if (q.includes('from offers') && (q.includes('where o.id =') || q.includes('where id ='))) {
      const id = params[0];
      const offer = tables.offers.find(o => o.id === id);
      if (offer) {
        const comp = tables.companies.find(c => c.id === offer.company_id);
        const prof = tables.student_profiles.find(p => p.id === offer.student_id);
        const user = prof ? tables.users.find(u => u.id === prof.user_id) : null;
        return Promise.resolve({ rows: [{ ...offer, company_name: comp?.name || '', student_name: user?.name || '' }], rowCount: 1 });
      }
      return Promise.resolve({ rows: [], rowCount: 0 });
    }

    if (q.includes('from offers') && q.includes('where student_id =')) {
      const sid = params[0];
      const offs = tables.offers.filter(o => o.student_id === sid);
      const enriched = offs.map(o => {
        const comp = tables.companies.find(c => c.id === o.company_id);
        const docs = tables.offer_documents.filter(d => d.offer_id === o.id);
        return { ...o, company_name: comp?.name || '', documents: docs, docs_total: docs.length, docs_submitted: docs.filter(dd => dd.status !== 'pending').length };
      });
      return Promise.resolve({ rows: enriched, rowCount: enriched.length });
    }

    if (q.includes('from offers') && !q.includes('where')) {
      const enriched = tables.offers.map(o => {
        const comp = tables.companies.find(c => c.id === o.company_id);
        const prof = tables.student_profiles.find(p => p.id === o.student_id);
        const user = prof ? tables.users.find(u => u.id === prof.user_id) : null;
        const docs = tables.offer_documents.filter(d => d.offer_id === o.id);
        return { ...o, company_name: comp?.name || '', student_name: user?.name || '', branch: prof?.branch || '', docs_total: docs.length, docs_submitted: docs.filter(dd => dd.status !== 'pending').length };
      });
      return Promise.resolve({ rows: enriched, rowCount: enriched.length });
    }

    if (q.includes('insert into offers')) {
      const [id, applicationId, studentId, jobId, companyId, role, ctcLpa, acceptanceDeadline, status] = params;
      const newOffer = {
        id: id || `offer-${Date.now()}`, application_id: applicationId, student_id: studentId,
        job_id: jobId, company_id: companyId, role, ctc_lpa: ctcLpa || 0,
        offer_date: new Date().toISOString(), acceptance_deadline: acceptanceDeadline,
        status: status || 'pending', joining_date: null, joining_status: 'not-joined',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      tables.offers.unshift(newOffer);
      // Auto-create document checklist
      const docTypes = ['Aadhaar Card','PAN Card','Resume','Degree Certificate','Marksheet','Photograph','Medical Certificate','Bank Details'];
      docTypes.forEach((dt, i) => {
        tables.offer_documents.push({ id: `od-auto-${Date.now()}-${i}`, offer_id: newOffer.id, document_type: dt, status: 'pending', submitted_at: null, verified_at: null, deadline: acceptanceDeadline, created_at: new Date().toISOString() });
      });
      return Promise.resolve({ rows: [newOffer], rowCount: 1 });
    }

    if (q.includes('update offers') && q.includes('status')) {
      const [status, id] = params;
      const offer = tables.offers.find(o => o.id === id);
      if (offer) {
        const old = { ...offer };
        offer.status = status;
        offer.updated_at = new Date().toISOString();
        tables.audit_log.push({ id: `audit-${Date.now()}`, user_id: null, user_role: 'system', action: 'offer_status_change', entity_type: 'offer', entity_id: id, old_value: { status: old.status }, new_value: { status }, timestamp: new Date().toISOString() });
        return Promise.resolve({ rows: [offer], rowCount: 1 });
      }
      return Promise.resolve({ rows: [], rowCount: 0 });
    }

    // ---- OFFER DOCUMENTS ----
    if (q.includes('from offer_documents') && q.includes('where offer_id =')) {
      const offerId = params[0];
      const docs = tables.offer_documents.filter(d => d.offer_id === offerId);
      return Promise.resolve({ rows: docs, rowCount: docs.length });
    }

    if (q.includes('update offer_documents') && q.includes('status')) {
      const [status, id] = params;
      const doc = tables.offer_documents.find(d => d.id === id);
      if (doc) {
        doc.status = status;
        if (status === 'submitted') doc.submitted_at = new Date().toISOString();
        if (status === 'verified') doc.verified_at = new Date().toISOString();
        return Promise.resolve({ rows: [doc], rowCount: 1 });
      }
      return Promise.resolve({ rows: [], rowCount: 0 });
    }

    // ---- DRIVE SLOTS ----
    if (q.includes('from drive_slots') && q.includes('where drive_id =')) {
      const driveId = params[0];
      const slots = tables.drive_slots.filter(s => s.drive_id === driveId);
      return Promise.resolve({ rows: slots, rowCount: slots.length });
    }

    if (q.includes('from drive_slots') && !q.includes('where')) {
      return Promise.resolve({ rows: [...tables.drive_slots], rowCount: tables.drive_slots.length });
    }

    if (q.includes('insert into drive_slots')) {
      const [id, driveId, startTime, endTime, venue, panelName, capacity] = params;
      const newSlot = { id: id || `slot-${Date.now()}`, drive_id: driveId, start_time: startTime, end_time: endTime, venue, panel_name: panelName, capacity: capacity || 50, created_at: new Date().toISOString() };
      tables.drive_slots.push(newSlot);
      return Promise.resolve({ rows: [newSlot], rowCount: 1 });
    }

    // ---- DRIVE CANDIDATES ----
    if (q.includes('from drive_candidates') && q.includes('where drive_id =')) {
      const driveId = params[0];
      const cands = tables.drive_candidates.filter(c => c.drive_id === driveId).map(c => {
        const prof = tables.student_profiles.find(p => p.id === c.student_id);
        const user = prof ? tables.users.find(u => u.id === prof.user_id) : null;
        return { ...c, student_name: user?.name || '', branch: prof?.branch || '', cgpa: prof?.cgpa || 0 };
      });
      return Promise.resolve({ rows: cands, rowCount: cands.length });
    }

    if (q.includes('from drive_candidates') && q.includes('where student_id =')) {
      const studentId = params[0];
      const cands = tables.drive_candidates.filter(c => c.student_id === studentId).map(c => {
        const drive = tables.drives.find(dr => dr.id === c.drive_id);
        const slot = tables.drive_slots.find(s => s.id === c.slot_id);
        const comp = drive ? tables.companies.find(co => co.id === drive.company_id) : null;
        return { ...c, drive_role: drive?.role || '', company_name: comp?.name || '', slot_start: slot?.start_time, slot_end: slot?.end_time, venue: slot?.venue || drive?.venue || '' };
      });
      return Promise.resolve({ rows: cands, rowCount: cands.length });
    }

    if (q.includes('from drive_candidates') && !q.includes('where')) {
      return Promise.resolve({ rows: [...tables.drive_candidates], rowCount: tables.drive_candidates.length });
    }

    if (q.includes('insert into drive_candidates')) {
      const [id, driveId, studentId, slotId, status] = params;
      const newCand = { id: id || `dc-${Date.now()}`, drive_id: driveId, student_id: studentId, slot_id: slotId || null, status: status || 'shortlisted', created_at: new Date().toISOString() };
      tables.drive_candidates.push(newCand);
      return Promise.resolve({ rows: [newCand], rowCount: 1 });
    }

    // ---- READINESS CONFIGS ----
    if (q.includes('from readiness_configs') && q.includes('where role_name =')) {
      const roleName = params[0];
      const config = tables.readiness_configs.find(c => c.role_name.toLowerCase() === roleName.toLowerCase());
      return Promise.resolve({ rows: config ? [config] : [], rowCount: config ? 1 : 0 });
    }

    if (q.includes('from readiness_configs') && !q.includes('where')) {
      return Promise.resolve({ rows: [...tables.readiness_configs], rowCount: tables.readiness_configs.length });
    }

    // ---- AUDIT LOG ----
    if (q.includes('insert into audit_log')) {
      const [id, userId, userRole, action, entityType, entityId, oldValue, newValue] = params;
      const entry = { id: id || `audit-${Date.now()}`, user_id: userId, user_role: userRole, action, entity_type: entityType, entity_id: entityId, old_value: oldValue, new_value: newValue, timestamp: new Date().toISOString() };
      tables.audit_log.push(entry);
      return Promise.resolve({ rows: [entry], rowCount: 1 });
    }

    if (q.includes('from audit_log')) {
      return Promise.resolve({ rows: [...tables.audit_log], rowCount: tables.audit_log.length });
    }

    // ---- MENTOR ASSIGNMENTS ----
    if (q.includes('from mentor_assignments') && q.includes('where mentor_id =')) {
      const mentorId = params[0];
      const assignments = tables.mentor_assignments.filter(a => a.mentor_id === mentorId).map(a => {
        const prof = tables.student_profiles.find(p => p.id === a.student_id);
        const user = prof ? tables.users.find(u => u.id === prof.user_id) : null;
        return { ...a, student_name: user?.name || '', branch: prof?.branch || '', readiness_score: prof?.readiness_score || 0, target_role: prof?.target_role || '' };
      });
      return Promise.resolve({ rows: assignments, rowCount: assignments.length });
    }

    // ---- STUDENT PROFILES (all) ----
    if (q.includes('from student_profiles') && !q.includes('where')) {
      const all = tables.student_profiles.map(p => {
        const user = tables.users.find(u => u.id === p.user_id);
        return { ...p, name: user?.name || 'Student', email: user?.email || '', readiness: p.readiness_score };
      });
      return Promise.resolve({ rows: all, rowCount: all.length });
    }

    // Fallback: empty rows
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
