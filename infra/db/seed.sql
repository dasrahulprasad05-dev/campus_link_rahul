-- ============================================================
-- CAMPUSLINK — Seed Data (Comprehensive)
-- Replaces hardcoded API.DEMO with database-level realistic data.
-- Password hash: Bcrypt (10 rounds) for local development seeds
-- ============================================================

-- ========== USERS ==========
-- Super Admin (password: CampusSuper@2026)
INSERT INTO users (id, name, email, password_hash, role, email_verified, admin_verified) VALUES
('00000000-0000-4000-8000-000000000001', 'System Super Admin', 'superadmin@campuslink.in', '$2a$10$XYdaeuLbZw7TsMjImKHzsOqUNYAI.FPGc38CVVir5E5WO4N9Yfjli', 'super_admin', true, true)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, email_verified = true, admin_verified = true;

-- Staff Accounts (password: CampusLink@2026, all pre-verified by super_admin)
INSERT INTO users (id, name, email, password_hash, role, email_verified, admin_verified) VALUES
('a1b2c3d4-0001-0001-0001-000000000002', 'Training & Placement Office ABIT', 'admin@campuslink.in', '$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'admin', true, true),
('a1b2c3d4-0001-0001-0001-000000000003', 'TCS Campus Recruitment', 'recruiter@campuslink.in', '$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'recruiter', true, true),
('a1b2c3d4-0001-0001-0001-000000000004', 'Faculty Mentor ABIT', 'mentor@campuslink.in', '$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'mentor', true, true),
-- Students (20)
('10000000-0000-4000-8000-000000000001', 'Ananya Sharma',     'ananya.sharma@campuslink.in',   '$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'student', true),
('10000000-0000-4000-8000-000000000002', 'Vikram Rao',        'vikram.rao@campuslink.in',      '$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'student', true),
('10000000-0000-4000-8000-000000000003', 'Soham Das',         'soham.das@campuslink.in',       '$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'student', true),
('10000000-0000-4000-8000-000000000004', 'Rohan Patel',       'rohan.patel@campuslink.in',     '$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'student', true),
('10000000-0000-4000-8000-000000000005', 'Meera Sahoo',       'meera.sahoo@campuslink.in',     '$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'student', true),
('10000000-0000-4000-8000-000000000006', 'Priya Das',         'priya.das@campuslink.in',       '$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'student', true),
('10000000-0000-4000-8000-000000000007', 'Rahul Kumar',       'rahul.kumar@campuslink.in',     '$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'student', true),
('10000000-0000-4000-8000-000000000008', 'Priti Mohanty',     'priti.mohanty@campuslink.in',   '$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'student', true),
('10000000-0000-4000-8000-000000000009', 'Arjun Behera',      'arjun.behera@campuslink.in',    '$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'student', true),
('10000000-0000-4000-8000-000000000010', 'Sneha Mishra',      'sneha.mishra@campuslink.in',    '$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'student', true),
('10000000-0000-4000-8000-000000000011', 'Aditya Nayak',      'aditya.nayak@campuslink.in',    '$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'student', true),
('10000000-0000-4000-8000-000000000012', 'Kavya Reddy',       'kavya.reddy@campuslink.in',     '$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'student', true),
('10000000-0000-4000-8000-000000000013', 'Deepak Pradhan',    'deepak.pradhan@campuslink.in',  '$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'student', true),
('10000000-0000-4000-8000-000000000014', 'Tanvi Patra',       'tanvi.patra@campuslink.in',     '$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'student', true),
('10000000-0000-4000-8000-000000000015', 'Nikhil Swain',      'nikhil.swain@campuslink.in',    '$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'student', true),
('10000000-0000-4000-8000-000000000016', 'Isha Tripathi',     'isha.tripathi@campuslink.in',   '$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'student', true),
('10000000-0000-4000-8000-000000000017', 'Saurav Mahapatra',  'saurav.mahapatra@campuslink.in','$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'student', true),
('10000000-0000-4000-8000-000000000018', 'Ritika Samantray',  'ritika.samantray@campuslink.in','$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'student', true),
('10000000-0000-4000-8000-000000000019', 'Aman Sethi',        'aman.sethi@campuslink.in',      '$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'student', true),
('10000000-0000-4000-8000-000000000020', 'Pooja Lenka',       'pooja.lenka@campuslink.in',     '$2a$10$7WESn6ndDPNAabWjobNCEOwVFCn4.CwILQVoGLmwKLEl/i.l3f.96', 'student', true)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, name = EXCLUDED.name, email_verified = true;

-- ========== STUDENT PROFILES ==========
INSERT INTO student_profiles (id, user_id, reg_no, branch, year, cgpa, target_role, phone, linkedin, github, skills, certifications, profile_completion, readiness_score, aptitude_score, communication_score, interview_score, backlogs, projects_count) VALUES
('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'ABIT2022CSE001', 'Computer Science & Engineering', 2026, 8.42, 'Data Analyst',       '+91 98765 43210', 'linkedin.com/in/ananya-sharma',    'github.com/ananyasharma',     ARRAY['Python','SQL','Excel','Data Analysis','Communication','Statistics','Power BI'], ARRAY['Google Data Analytics Certificate','AWS Cloud Practitioner'], 91, 78, 72, 80, 65, 0, 3),
('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'ABIT2022IT001',  'Information Technology',         2026, 7.89, 'Software Engineer',   '+91 98765 43211', 'linkedin.com/in/vikram-rao',       'github.com/vikramrao',        ARRAY['Java','Python','Spring Boot','SQL','Git','DSA'], ARRAY['AWS Solutions Architect'], 85, 82, 78, 70, 75, 0, 4),
('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', 'ABIT2022ETC001', 'Electronics & Telecom',          2026, 7.65, 'Software Engineer',   '+91 98765 43212', 'linkedin.com/in/soham-das',        'github.com/sohamdas',         ARRAY['Python','C++','SQL','Statistics','Power BI'], ARRAY[]::text[], 72, 71, 68, 65, 58, 0, 2),
('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000004', 'ABIT2022CSE002', 'Computer Science & Engineering', 2026, 7.12, 'Software Engineer',   '+91 98765 43213', 'linkedin.com/in/rohan-patel',      'github.com/rohanpatel',       ARRAY['JavaScript','HTML','CSS'], ARRAY[]::text[], 45, 52, 48, 55, 40, 1, 1),
('20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000005', 'ABIT2022IT002',  'Information Technology',         2026, 8.01, 'Data Analyst',        '+91 98765 43214', 'linkedin.com/in/meera-sahoo',      'github.com/meerasahoo',       ARRAY['SQL','Python','Excel'], ARRAY['Tableau Desktop Specialist'], 60, 61, 55, 62, 50, 0, 1),
('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000006', 'ABIT2022CSE003', 'Computer Science & Engineering', 2026, 6.78, 'Web Developer',       '+91 98765 43215', 'linkedin.com/in/priya-das',        'github.com/priyadeas',        ARRAY['HTML','CSS','JavaScript'], ARRAY[]::text[], 40, 45, 38, 50, 35, 2, 0),
('20000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000007', 'ABIT2022CSE004', 'Computer Science & Engineering', 2026, 8.65, 'Software Engineer',   '+91 98765 43216', 'linkedin.com/in/rahul-kumar',      'github.com/rahulkumar',       ARRAY['Java','Spring Boot','SQL','DSA','System Design','Docker','AWS','Git'], ARRAY['AWS Solutions Architect','Oracle Java SE'], 95, 88, 85, 78, 82, 0, 5),
('20000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000008', 'ABIT2022CSE005', 'Computer Science & Engineering', 2026, 8.15, 'Data Analyst',        '+91 98765 43217', 'linkedin.com/in/priti-mohanty',    'github.com/pritimohanty',     ARRAY['Python','SQL','Machine Learning','R','Statistics'], ARRAY[]::text[], 78, 79, 74, 72, 68, 0, 3),
('20000000-0000-4000-8000-000000000009', '10000000-0000-4000-8000-000000000009', 'ABIT2022ETC002', 'Electronics & Telecom',          2026, 7.34, 'DevOps Engineer',     '+91 98765 43218', 'linkedin.com/in/arjun-behera',     'github.com/arjunbehera',      ARRAY['Docker','Kubernetes','AWS','Linux','Python','Git','Terraform'], ARRAY['AWS Cloud Practitioner'], 80, 74, 70, 60, 55, 0, 3),
('20000000-0000-4000-8000-000000000010', '10000000-0000-4000-8000-000000000010', 'ABIT2022CSE006', 'Computer Science & Engineering', 2026, 8.92, 'Data Analyst',        '+91 98765 43219', 'linkedin.com/in/sneha-mishra',     'github.com/snehamis',         ARRAY['Python','SQL','Power BI','Tableau','Statistics','Excel','R'], ARRAY['Google Data Analytics Certificate','Tableau Desktop Specialist'], 92, 86, 82, 85, 78, 0, 4),
('20000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000011', 'ABIT2022IT003',  'Information Technology',         2026, 7.56, 'Software Engineer',   '+91 98765 43220', 'linkedin.com/in/aditya-nayak',     'github.com/adityanayak',      ARRAY['JavaScript','React','Node.js','MongoDB','Git'], ARRAY[]::text[], 68, 67, 62, 65, 55, 0, 2),
('20000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000012', 'ABIT2022CSE007', 'Computer Science & Engineering', 2026, 8.78, 'ML Engineer',         '+91 98765 43221', 'linkedin.com/in/kavya-reddy',      'github.com/kavyareddy',       ARRAY['Python','PyTorch','TensorFlow','Statistics','SQL','Linear Algebra'], ARRAY['DeepLearning.AI Specialization'], 88, 84, 80, 75, 72, 0, 4),
('20000000-0000-4000-8000-000000000013', '10000000-0000-4000-8000-000000000013', 'ABIT2022ME001',  'Mechanical Engineering',         2026, 6.45, 'Business Analyst',    '+91 98765 43222', 'linkedin.com/in/deepak-pradhan',   'github.com/deepakp',          ARRAY['Excel','Communication','SQL'], ARRAY[]::text[], 50, 42, 40, 65, 38, 1, 1),
('20000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000014', 'ABIT2022CSE008', 'Computer Science & Engineering', 2026, 7.90, 'Web Developer',       '+91 98765 43223', 'linkedin.com/in/tanvi-patra',      'github.com/tanvipatra',       ARRAY['React','JavaScript','TypeScript','Node.js','Tailwind CSS','Git'], ARRAY[]::text[], 75, 73, 68, 70, 62, 0, 3),
('20000000-0000-4000-8000-000000000015', '10000000-0000-4000-8000-000000000015', 'ABIT2022ETC003', 'Electronics & Telecom',          2026, 7.22, 'Software Engineer',   '+91 98765 43224', 'linkedin.com/in/nikhil-swain',     'github.com/nikhilswain',      ARRAY['C++','Java','Python','DSA'], ARRAY[]::text[], 55, 58, 52, 55, 45, 0, 1),
('20000000-0000-4000-8000-000000000016', '10000000-0000-4000-8000-000000000016', 'ABIT2022IT004',  'Information Technology',         2026, 8.34, 'Data Analyst',        '+91 98765 43225', 'linkedin.com/in/isha-tripathi',    'github.com/ishatripathi',     ARRAY['Python','SQL','Excel','Power BI','Communication'], ARRAY['Google Data Analytics Certificate'], 82, 76, 72, 78, 64, 0, 2),
('20000000-0000-4000-8000-000000000017', '10000000-0000-4000-8000-000000000017', 'ABIT2022CSE009', 'Computer Science & Engineering', 2026, 7.45, 'Software Engineer',   '+91 98765 43226', 'linkedin.com/in/saurav-mahapatra', 'github.com/sauravmaha',       ARRAY['Java','Python','SQL','Git'], ARRAY[]::text[], 62, 64, 58, 60, 50, 0, 2),
('20000000-0000-4000-8000-000000000018', '10000000-0000-4000-8000-000000000018', 'ABIT2022CSE010', 'Computer Science & Engineering', 2026, 8.10, 'Software Engineer',   '+91 98765 43227', 'linkedin.com/in/ritika-samantray', 'github.com/ritikas',          ARRAY['Python','Java','React','SQL','Docker','Git'], ARRAY['AWS Cloud Practitioner'], 78, 75, 70, 68, 65, 0, 3),
('20000000-0000-4000-8000-000000000019', '10000000-0000-4000-8000-000000000019', 'ABIT2022ME002',  'Mechanical Engineering',         2026, 6.90, 'Business Analyst',    '+91 98765 43228', 'linkedin.com/in/aman-sethi',       'github.com/amansethi',        ARRAY['Excel','Python','Communication'], ARRAY[]::text[], 48, 48, 42, 70, 35, 1, 0),
('20000000-0000-4000-8000-000000000020', '10000000-0000-4000-8000-000000000020', 'ABIT2022IT005',  'Information Technology',         2026, 7.78, 'Web Developer',       '+91 98765 43229', 'linkedin.com/in/pooja-lenka',      'github.com/poojalenka',       ARRAY['HTML','CSS','JavaScript','React','Node.js','MongoDB'], ARRAY[]::text[], 70, 68, 60, 65, 55, 0, 2)
ON CONFLICT (user_id) DO NOTHING;

-- ========== COMPANIES ==========
INSERT INTO companies (id, name, industry, website, status) VALUES
('30000000-0000-4000-8000-000000000001', 'TechNova Solutions',  'IT Services',      'https://technova.example.com',  'active'),
('30000000-0000-4000-8000-000000000002', 'CloudCraft Tech',     'Cloud & DevOps',    'https://cloudcraft.example.com','active'),
('30000000-0000-4000-8000-000000000003', 'AxisGrid Analytics',  'Data Analytics',    'https://axisgrid.example.com',  'active'),
('30000000-0000-4000-8000-000000000004', 'Infosys',             'IT Services',       'https://infosys.com',           'active'),
('30000000-0000-4000-8000-000000000005', 'Wipro',               'IT Services',       'https://wipro.com',             'active'),
('30000000-0000-4000-8000-000000000006', 'TCS',                 'IT Services',       'https://tcs.com',               'active'),
('30000000-0000-4000-8000-000000000007', 'DeepSpark AI',        'AI & ML',           'https://deepspark.example.com', 'active')
ON CONFLICT DO NOTHING;

-- ========== JOBS ==========
INSERT INTO jobs (id, company_id, recruiter_id, title, description, location, type, skills_required, min_cgpa, eligible_branches, max_backlogs, deadline, status) VALUES
('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'a1b2c3d4-0001-0001-0001-000000000003', 'Graduate Data Analyst',         'Analyze large-scale operational data, build dashboards, and report KPI trends. Requires SQL, Python, and visualization skills.',                                        'Bhubaneswar', 'Full-time',  ARRAY['SQL','Python','Power BI'],                             7.0, ARRAY['CSE','IT','ETC'],  0, now() + interval '14 days', 'active'),
('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000003', 'a1b2c3d4-0001-0001-0001-000000000003', 'Business Intelligence Intern',  'Design interactive analytics dashboards and executive business reports. Must be detail-oriented with strong Excel and SQL skills.',                                       'Hybrid',      'Internship', ARRAY['SQL','Excel','Tableau'],                               6.5, ARRAY['CSE','IT','ETC','ME'], 1, now() + interval '20 days', 'active'),
('40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000002', 'a1b2c3d4-0001-0001-0001-000000000003', 'Junior Software Engineer',      'Build robust backend APIs and high-availability cloud microservices. Strong DSA and system design thinking required.',                                                    'Bengaluru',   'Full-time',  ARRAY['Java','Spring Boot','SQL','DSA','System Design'],      7.5, ARRAY['CSE','IT'],        0, now() + interval '30 days', 'active'),
('40000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000007', 'a1b2c3d4-0001-0001-0001-000000000003', 'ML Research Intern',            'Apply deep learning techniques to NLP and computer vision projects. Publish-quality research output expected.',                                                           'Remote',      'Internship', ARRAY['Python','PyTorch','Statistics','Linear Algebra'],      7.0, ARRAY['CSE','IT','ETC'],  0, now() + interval '25 days', 'active'),
('40000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000004', 'a1b2c3d4-0001-0001-0001-000000000003', 'Systems Engineer',              'Core IT infrastructure role including application support, database management, and automation scripting.',                                                               'Pune',        'Full-time',  ARRAY['Java','SQL','Linux','Python'],                         6.0, ARRAY['CSE','IT','ETC','ME'], 1, now() + interval '18 days', 'active'),
('40000000-0000-4000-8000-000000000006', '30000000-0000-4000-8000-000000000005', 'a1b2c3d4-0001-0001-0001-000000000003', 'Associate Developer',           'Full-stack development role building enterprise web applications with modern JavaScript frameworks.',                                                                     'Hyderabad',   'Full-time',  ARRAY['JavaScript','React','Node.js','SQL'],                  6.5, ARRAY['CSE','IT'],        1, now() + interval '22 days', 'active'),
('40000000-0000-4000-8000-000000000007', '30000000-0000-4000-8000-000000000006', 'a1b2c3d4-0001-0001-0001-000000000003', 'Digital Trainee',               'Comprehensive training program covering cloud, AI, and enterprise systems. Strong aptitude and communication skills valued.',                                              'Chennai',     'Full-time',  ARRAY['Python','SQL','Communication'],                        6.0, ARRAY['CSE','IT','ETC','ME'], 2, now() + interval '35 days', 'active'),
('40000000-0000-4000-8000-000000000008', '30000000-0000-4000-8000-000000000001', 'a1b2c3d4-0001-0001-0001-000000000003', 'DevOps Engineer',               'Manage CI/CD pipelines, container orchestration, and cloud infrastructure. AWS experience preferred.',                                                                    'Bhubaneswar', 'Full-time',  ARRAY['Docker','Kubernetes','AWS','Linux','Git','Terraform'], 7.0, ARRAY['CSE','IT','ETC'],  0, now() + interval '28 days', 'active')
ON CONFLICT DO NOTHING;

-- ========== APPLICATIONS ==========
INSERT INTO applications (id, student_id, job_id, status, current_round, applied_at) VALUES
-- Ananya (20000000-0000-4000-8000-000000000001)
('50000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'interview',    'Technical Round 2', now() - interval '17 days'),
('50000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000002', 'shortlisted',  'Aptitude Test',     now() - interval '14 days'),
('50000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000007', 'applied',      'Resume Screening',  now() - interval '5 days'),
-- Vikram (20000000-0000-4000-8000-000000000002)
('50000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000003', 'interview',    'Technical Round 1', now() - interval '12 days'),
('50000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000005', 'offered',      'Offer Letter Sent', now() - interval '20 days'),
-- Soham (20000000-0000-4000-8000-000000000003)
('50000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000005', 'applied',      'Resume Screening',  now() - interval '8 days'),
('50000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000001', 'shortlisted',  'Aptitude Test',     now() - interval '10 days'),
-- Rohan (20000000-0000-4000-8000-000000000004)
('50000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000007', 'applied',      'Resume Screening',  now() - interval '3 days'),
-- Rahul Kumar (20000000-0000-4000-8000-000000000007) — top candidate
('50000000-0000-4000-8000-000000000009', '20000000-0000-4000-8000-000000000007', '40000000-0000-4000-8000-000000000003', 'offered',      'Offer Letter Sent', now() - interval '22 days'),
('50000000-0000-4000-8000-000000000010', '20000000-0000-4000-8000-000000000007', '40000000-0000-4000-8000-000000000005', 'interview',    'HR Round',          now() - interval '15 days'),
('50000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000007', '40000000-0000-4000-8000-000000000008', 'shortlisted',  'Technical Test',    now() - interval '7 days'),
-- Priti (20000000-0000-4000-8000-000000000008)
('50000000-0000-4000-8000-000000000012', '20000000-0000-4000-8000-000000000008', '40000000-0000-4000-8000-000000000001', 'interview',    'Technical Round 1', now() - interval '16 days'),
('50000000-0000-4000-8000-000000000013', '20000000-0000-4000-8000-000000000008', '40000000-0000-4000-8000-000000000004', 'applied',      'Resume Screening',  now() - interval '6 days'),
-- Kavya (20000000-0000-4000-8000-000000000012)
('50000000-0000-4000-8000-000000000014', '20000000-0000-4000-8000-000000000012', '40000000-0000-4000-8000-000000000004', 'interview',    'Technical Round 1', now() - interval '14 days'),
-- Sneha (20000000-0000-4000-8000-000000000010)
('50000000-0000-4000-8000-000000000015', '20000000-0000-4000-8000-000000000010', '40000000-0000-4000-8000-000000000001', 'offered',      'Offer Letter Sent', now() - interval '10 days'),
('50000000-0000-4000-8000-000000000016', '20000000-0000-4000-8000-000000000010', '40000000-0000-4000-8000-000000000002', 'interview',    'Final Round',       now() - interval '12 days'),
-- Aditya (20000000-0000-4000-8000-000000000011)
('50000000-0000-4000-8000-000000000017', '20000000-0000-4000-8000-000000000011', '40000000-0000-4000-8000-000000000006', 'shortlisted',  'Coding Test',       now() - interval '9 days'),
-- Tanvi (20000000-0000-4000-8000-000000000014)
('50000000-0000-4000-8000-000000000018', '20000000-0000-4000-8000-000000000014', '40000000-0000-4000-8000-000000000006', 'interview',    'Technical Round 1', now() - interval '11 days'),
-- Arjun (20000000-0000-4000-8000-000000000009)
('50000000-0000-4000-8000-000000000019', '20000000-0000-4000-8000-000000000009', '40000000-0000-4000-8000-000000000008', 'interview',    'Technical Round 1', now() - interval '13 days'),
-- Isha (20000000-0000-4000-8000-000000000016)
('50000000-0000-4000-8000-000000000020', '20000000-0000-4000-8000-000000000016', '40000000-0000-4000-8000-000000000001', 'shortlisted',  'Aptitude Test',     now() - interval '7 days'),
('50000000-0000-4000-8000-000000000021', '20000000-0000-4000-8000-000000000016', '40000000-0000-4000-8000-000000000007', 'applied',      'Resume Screening',  now() - interval '4 days'),
-- Saurav (20000000-0000-4000-8000-000000000017)
('50000000-0000-4000-8000-000000000022', '20000000-0000-4000-8000-000000000017', '40000000-0000-4000-8000-000000000005', 'applied',      'Resume Screening',  now() - interval '6 days'),
-- Ritika (20000000-0000-4000-8000-000000000018)
('50000000-0000-4000-8000-000000000023', '20000000-0000-4000-8000-000000000018', '40000000-0000-4000-8000-000000000003', 'shortlisted',  'Coding Test',       now() - interval '8 days'),
-- Nikhil (20000000-0000-4000-8000-000000000015)
('50000000-0000-4000-8000-000000000024', '20000000-0000-4000-8000-000000000015', '40000000-0000-4000-8000-000000000005', 'applied',      'Resume Screening',  now() - interval '4 days'),
-- Pooja (20000000-0000-4000-8000-000000000020)
('50000000-0000-4000-8000-000000000025', '20000000-0000-4000-8000-000000000020', '40000000-0000-4000-8000-000000000006', 'applied',      'Resume Screening',  now() - interval '2 days')
ON CONFLICT DO NOTHING;

-- ========== DRIVES ==========
INSERT INTO drives (id, company_id, role, drive_date, venue, min_cgpa, branches, status) VALUES
('60000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'Graduate Data Analyst',    now() + interval '5 days',  'Seminar Hall A',    7.0, ARRAY['CSE','IT','ETC'],      'scheduled'),
('60000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', 'Associate Engineer',       now() + interval '8 days',  'Main Auditorium',   7.5, ARRAY['CSE','IT'],            'confirmed'),
('60000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000003', 'BI Intern',                now() + interval '12 days', 'Lab 204',           6.5, ARRAY['CSE','IT','ETC','ME'], 'draft'),
('60000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000004', 'Systems Engineer',         now() + interval '18 days', 'Seminar Hall A',    6.0, ARRAY['CSE','IT','ETC','ME'], 'draft'),
('60000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000006', 'Digital Trainee',          now() + interval '25 days', 'Main Auditorium',   6.0, ARRAY['CSE','IT','ETC','ME'], 'draft')
ON CONFLICT DO NOTHING;

-- ========== DRIVE SLOTS ==========
INSERT INTO drive_slots (id, drive_id, start_time, end_time, venue, panel_name, capacity) VALUES
('70000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000001', now() + interval '5 days' + interval '9 hours',  now() + interval '5 days' + interval '11 hours', 'Seminar Hall A', 'Panel A - TechNova', 50),
('70000000-0000-4000-8000-000000000002', '60000000-0000-4000-8000-000000000001', now() + interval '5 days' + interval '11 hours', now() + interval '5 days' + interval '13 hours', 'Seminar Hall A', 'Panel B - TechNova', 50),
('70000000-0000-4000-8000-000000000003', '60000000-0000-4000-8000-000000000002', now() + interval '8 days' + interval '10 hours', now() + interval '8 days' + interval '12 hours', 'Main Auditorium', 'Panel A - CloudCraft', 40),
('70000000-0000-4000-8000-000000000004', '60000000-0000-4000-8000-000000000002', now() + interval '8 days' + interval '14 hours', now() + interval '8 days' + interval '16 hours', 'Main Auditorium', 'Panel B - CloudCraft', 40),
-- Deliberately overlapping slot for conflict demo
('70000000-0000-4000-8000-000000000005', '60000000-0000-4000-8000-000000000004', now() + interval '5 days' + interval '10 hours', now() + interval '5 days' + interval '12 hours', 'Seminar Hall A', 'Panel A - Infosys', 60)
ON CONFLICT DO NOTHING;

-- ========== DRIVE CANDIDATES ==========
INSERT INTO drive_candidates (id, drive_id, student_id, slot_id, status) VALUES
-- TechNova drive — data analyst candidates
('80000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000001', 'shortlisted'),
('80000000-0000-4000-8000-000000000002', '60000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000008', '70000000-0000-4000-8000-000000000001', 'shortlisted'),
('80000000-0000-4000-8000-000000000003', '60000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000010', '70000000-0000-4000-8000-000000000002', 'shortlisted'),
('80000000-0000-4000-8000-000000000004', '60000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000016', '70000000-0000-4000-8000-000000000002', 'shortlisted'),
-- CloudCraft drive — SDE candidates
('80000000-0000-4000-8000-000000000005', '60000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', '70000000-0000-4000-8000-000000000003', 'shortlisted'),
('80000000-0000-4000-8000-000000000006', '60000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000007', '70000000-0000-4000-8000-000000000003', 'shortlisted'),
('80000000-0000-4000-8000-000000000007', '60000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000018', '70000000-0000-4000-8000-000000000004', 'shortlisted'),
-- Rahul (20000000-0000-4000-8000-000000000007) also shortlisted for Infosys (creates conflict with CloudCraft)
('80000000-0000-4000-8000-000000000008', '60000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000007', '70000000-0000-4000-8000-000000000005', 'shortlisted')
ON CONFLICT DO NOTHING;

-- ========== OFFERS ==========
INSERT INTO offers (id, application_id, student_id, job_id, company_id, role, ctc_lpa, offer_date, acceptance_deadline, status, joining_date, joining_status) VALUES
('90000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000004', 'Systems Engineer',         '6.50', now() - interval '18 days', now() + interval '10 days', 'accepted',  now() + interval '45 days', 'joining-pending'),
('90000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000009', '20000000-0000-4000-8000-000000000007', '40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000002', 'Junior Software Engineer', '14.00', now() - interval '20 days', now() + interval '7 days', 'accepted',  now() + interval '30 days', 'joining-pending'),
('90000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000015', '20000000-0000-4000-8000-000000000010', '40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'Graduate Data Analyst',    '8.50', now() - interval '8 days',  now() + interval '14 days', 'pending',   null,                       'not-joined'),
('90000000-0000-4000-8000-000000000004', '50000000-0000-4000-8000-000000000014', '20000000-0000-4000-8000-000000000012', '40000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000007', 'ML Research Intern',       '4.00', now() - interval '5 days',  now() + interval '15 days', 'pending',   null,                       'not-joined')
ON CONFLICT DO NOTHING;

-- ========== OFFER DOCUMENTS ==========
INSERT INTO offer_documents (id, offer_id, document_type, status, submitted_at, verified_at, deadline) VALUES
-- Vikram (90000000-0000-4000-8000-000000000001) — mostly done
('a0000000-0000-4000-8000-000000000001', '90000000-0000-4000-8000-000000000001', 'Aadhaar Card',         'verified',  now() - interval '15 days', now() - interval '14 days', now() + interval '5 days'),
('a0000000-0000-4000-8000-000000000002', '90000000-0000-4000-8000-000000000001', 'PAN Card',             'verified',  now() - interval '15 days', now() - interval '14 days', now() + interval '5 days'),
('a0000000-0000-4000-8000-000000000003', '90000000-0000-4000-8000-000000000001', 'Resume',               'verified',  now() - interval '16 days', now() - interval '15 days', now() + interval '5 days'),
('a0000000-0000-4000-8000-000000000004', '90000000-0000-4000-8000-000000000001', 'Degree Certificate',   'submitted', now() - interval '10 days', null,                       now() + interval '5 days'),
('a0000000-0000-4000-8000-000000000005', '90000000-0000-4000-8000-000000000001', 'Marksheet',            'submitted', now() - interval '10 days', null,                       now() + interval '5 days'),
('a0000000-0000-4000-8000-000000000006', '90000000-0000-4000-8000-000000000001', 'Photograph',           'verified',  now() - interval '15 days', now() - interval '14 days', now() + interval '5 days'),
('a0000000-0000-4000-8000-000000000007', '90000000-0000-4000-8000-000000000001', 'Medical Certificate',  'pending',   null,                       null,                       now() + interval '3 days'),
('a0000000-0000-4000-8000-000000000008', '90000000-0000-4000-8000-000000000001', 'Bank Details',         'verified',  now() - interval '12 days', now() - interval '11 days', now() + interval '5 days'),
-- Rahul (90000000-0000-4000-8000-000000000002) — all done
('a0000000-0000-4000-8000-000000000009', '90000000-0000-4000-8000-000000000002', 'Aadhaar Card',         'verified',  now() - interval '18 days', now() - interval '17 days', now() + interval '10 days'),
('a0000000-0000-4000-8000-000000000010', '90000000-0000-4000-8000-000000000002', 'PAN Card',             'verified',  now() - interval '18 days', now() - interval '17 days', now() + interval '10 days'),
('a0000000-0000-4000-8000-000000000011', '90000000-0000-4000-8000-000000000002', 'Resume',               'verified',  now() - interval '19 days', now() - interval '18 days', now() + interval '10 days'),
('a0000000-0000-4000-8000-000000000012', '90000000-0000-4000-8000-000000000002', 'Degree Certificate',   'verified',  now() - interval '16 days', now() - interval '15 days', now() + interval '10 days'),
('a0000000-0000-4000-8000-000000000013', '90000000-0000-4000-8000-000000000002', 'Marksheet',            'verified',  now() - interval '16 days', now() - interval '15 days', now() + interval '10 days'),
('a0000000-0000-4000-8000-000000000014', '90000000-0000-4000-8000-000000000002', 'Photograph',           'verified',  now() - interval '18 days', now() - interval '17 days', now() + interval '10 days'),
('a0000000-0000-4000-8000-000000000015', '90000000-0000-4000-8000-000000000002', 'Medical Certificate',  'verified',  now() - interval '14 days', now() - interval '13 days', now() + interval '10 days'),
('a0000000-0000-4000-8000-000000000016', '90000000-0000-4000-8000-000000000002', 'Bank Details',         'verified',  now() - interval '15 days', now() - interval '14 days', now() + interval '10 days'),
-- Sneha (90000000-0000-4000-8000-000000000003) — pending
('a0000000-0000-4000-8000-000000000017', '90000000-0000-4000-8000-000000000003', 'Aadhaar Card',         'pending', null, null, now() + interval '12 days'),
('a0000000-0000-4000-8000-000000000018', '90000000-0000-4000-8000-000000000003', 'PAN Card',             'pending', null, null, now() + interval '12 days'),
('a0000000-0000-4000-8000-000000000019', '90000000-0000-4000-8000-000000000003', 'Resume',               'submitted', now() - interval '2 days', null, now() + interval '12 days'),
('a0000000-0000-4000-8000-000000000020', '90000000-0000-4000-8000-000000000003', 'Degree Certificate',   'pending', null, null, now() + interval '12 days'),
('a0000000-0000-4000-8000-000000000021', '90000000-0000-4000-8000-000000000003', 'Marksheet',            'pending', null, null, now() + interval '12 days'),
('a0000000-0000-4000-8000-000000000022', '90000000-0000-4000-8000-000000000003', 'Photograph',           'pending', null, null, now() + interval '12 days'),
('a0000000-0000-4000-8000-000000000023', '90000000-0000-4000-8000-000000000003', 'Medical Certificate',  'pending', null, null, now() + interval '12 days'),
('a0000000-0000-4000-8000-000000000024', '90000000-0000-4000-8000-000000000003', 'Bank Details',         'pending', null, null, now() + interval '12 days')
ON CONFLICT DO NOTHING;

-- ========== READINESS CONFIGS (Role-Specific Weights) ==========
INSERT INTO readiness_configs (role_name, weights) VALUES
('Software Engineer',  '{"technical": 0.30, "projects": 0.20, "academics": 0.15, "aptitude": 0.10, "certifications": 0.10, "communication": 0.05, "interview": 0.10}'),
('Data Analyst',       '{"technical": 0.25, "projects": 0.15, "academics": 0.15, "aptitude": 0.15, "certifications": 0.10, "communication": 0.10, "interview": 0.10}'),
('Web Developer',      '{"technical": 0.30, "projects": 0.25, "academics": 0.10, "aptitude": 0.10, "certifications": 0.05, "communication": 0.10, "interview": 0.10}'),
('DevOps Engineer',    '{"technical": 0.30, "projects": 0.20, "academics": 0.10, "aptitude": 0.10, "certifications": 0.15, "communication": 0.05, "interview": 0.10}'),
('ML Engineer',        '{"technical": 0.30, "projects": 0.20, "academics": 0.15, "aptitude": 0.10, "certifications": 0.10, "communication": 0.05, "interview": 0.10}'),
('Business Analyst',   '{"technical": 0.15, "projects": 0.15, "academics": 0.15, "aptitude": 0.15, "certifications": 0.10, "communication": 0.20, "interview": 0.10}')
ON CONFLICT (role_name) DO NOTHING;

-- ========== MENTOR ASSIGNMENTS ==========
INSERT INTO mentor_assignments (mentor_id, student_id) VALUES
('a1b2c3d4-0001-0001-0001-000000000004', '20000000-0000-4000-8000-000000000001'),
('a1b2c3d4-0001-0001-0001-000000000004', '20000000-0000-4000-8000-000000000004'),
('a1b2c3d4-0001-0001-0001-000000000004', '20000000-0000-4000-8000-000000000005'),
('a1b2c3d4-0001-0001-0001-000000000004', '20000000-0000-4000-8000-000000000002'),
('a1b2c3d4-0001-0001-0001-000000000004', '20000000-0000-4000-8000-000000000003')
ON CONFLICT DO NOTHING;
