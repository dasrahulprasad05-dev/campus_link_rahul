-- ============================================================
-- CAMPUSLINK — Seed Data (Comprehensive)
-- Replaces hardcoded API.DEMO with database-level realistic data.
-- Password for all seed accounts: rahul2005
-- ============================================================

-- ========== USERS ==========
INSERT INTO users (id, name, email, password_hash, role, email_verified) VALUES
-- Institutional
('a1b2c3d4-0001-0001-0001-000000000002', 'Training & Placement Office ABIT', 'rahulprasaddas9@gmail.com', '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'admin', true),
('a1b2c3d4-0001-0001-0001-000000000003', 'TCS BHUBANESWAR', 'ommprasadd363@gmail.com', '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'recruiter', true),
('a1b2c3d4-0001-0001-0001-000000000004', 'Prof. Rahul Prasad Das', 'rahulprsaddas@gmail.com', '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'mentor', true),
-- Students (20)
('u-stu-001', 'Ananya Sharma',     'ananya.sharma@campuslink.in',   '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'student', true),
('u-stu-002', 'Vikram Rao',        'vikram.rao@campuslink.in',      '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'student', true),
('u-stu-003', 'Soham Das',         'soham.das@campuslink.in',       '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'student', true),
('u-stu-004', 'Rohan Patel',       'rohan.patel@campuslink.in',     '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'student', true),
('u-stu-005', 'Meera Sahoo',       'meera.sahoo@campuslink.in',     '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'student', true),
('u-stu-006', 'Priya Das',         'priya.das@campuslink.in',       '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'student', true),
('u-stu-007', 'Rahul Kumar',       'rahul.kumar@campuslink.in',     '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'student', true),
('u-stu-008', 'Priti Mohanty',     'priti.mohanty@campuslink.in',   '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'student', true),
('u-stu-009', 'Arjun Behera',      'arjun.behera@campuslink.in',    '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'student', true),
('u-stu-010', 'Sneha Mishra',      'sneha.mishra@campuslink.in',    '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'student', true),
('u-stu-011', 'Aditya Nayak',      'aditya.nayak@campuslink.in',    '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'student', true),
('u-stu-012', 'Kavya Reddy',       'kavya.reddy@campuslink.in',     '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'student', true),
('u-stu-013', 'Deepak Pradhan',    'deepak.pradhan@campuslink.in',  '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'student', true),
('u-stu-014', 'Tanvi Patra',       'tanvi.patra@campuslink.in',     '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'student', true),
('u-stu-015', 'Nikhil Swain',      'nikhil.swain@campuslink.in',    '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'student', true),
('u-stu-016', 'Isha Tripathi',     'isha.tripathi@campuslink.in',   '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'student', true),
('u-stu-017', 'Saurav Mahapatra',  'saurav.mahapatra@campuslink.in','$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'student', true),
('u-stu-018', 'Ritika Samantray',  'ritika.samantray@campuslink.in','$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'student', true),
('u-stu-019', 'Aman Sethi',        'aman.sethi@campuslink.in',      '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'student', true),
('u-stu-020', 'Pooja Lenka',       'pooja.lenka@campuslink.in',     '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'student', true)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, name = EXCLUDED.name, email_verified = true;

-- ========== STUDENT PROFILES ==========
INSERT INTO student_profiles (id, user_id, reg_no, branch, year, cgpa, target_role, phone, linkedin, github, skills, certifications, profile_completion, readiness_score, aptitude_score, communication_score, interview_score, backlogs, projects_count) VALUES
('sp-001', 'u-stu-001', 'ABIT2022CSE001', 'Computer Science & Engineering', 2026, 8.42, 'Data Analyst',       '+91 98765 43210', 'linkedin.com/in/ananya-sharma',    'github.com/ananyasharma',     ARRAY['Python','SQL','Excel','Data Analysis','Communication','Statistics','Power BI'], ARRAY['Google Data Analytics Certificate','AWS Cloud Practitioner'], 91, 78, 72, 80, 65, 0, 3),
('sp-002', 'u-stu-002', 'ABIT2022IT001',  'Information Technology',         2026, 7.89, 'Software Engineer',   '+91 98765 43211', 'linkedin.com/in/vikram-rao',       'github.com/vikramrao',        ARRAY['Java','Python','Spring Boot','SQL','Git','DSA'], ARRAY['AWS Solutions Architect'], 85, 82, 78, 70, 75, 0, 4),
('sp-003', 'u-stu-003', 'ABIT2022ETC001', 'Electronics & Telecom',          2026, 7.65, 'Software Engineer',   '+91 98765 43212', 'linkedin.com/in/soham-das',        'github.com/sohamdas',         ARRAY['Python','C++','SQL','Statistics','Power BI'], ARRAY[], 72, 71, 68, 65, 58, 0, 2),
('sp-004', 'u-stu-004', 'ABIT2022CSE002', 'Computer Science & Engineering', 2026, 7.12, 'Software Engineer',   '+91 98765 43213', 'linkedin.com/in/rohan-patel',      'github.com/rohanpatel',       ARRAY['JavaScript','HTML','CSS'], ARRAY[], 45, 52, 48, 55, 40, 1, 1),
('sp-005', 'u-stu-005', 'ABIT2022IT002',  'Information Technology',         2026, 8.01, 'Data Analyst',        '+91 98765 43214', 'linkedin.com/in/meera-sahoo',      'github.com/meerasahoo',       ARRAY['SQL','Python','Excel'], ARRAY['Tableau Desktop Specialist'], 60, 61, 55, 62, 50, 0, 1),
('sp-006', 'u-stu-006', 'ABIT2022CSE003', 'Computer Science & Engineering', 2026, 6.78, 'Web Developer',       '+91 98765 43215', 'linkedin.com/in/priya-das',        'github.com/priyadeas',        ARRAY['HTML','CSS','JavaScript'], ARRAY[], 40, 45, 38, 50, 35, 2, 0),
('sp-007', 'u-stu-007', 'ABIT2022CSE004', 'Computer Science & Engineering', 2026, 8.65, 'Software Engineer',   '+91 98765 43216', 'linkedin.com/in/rahul-kumar',      'github.com/rahulkumar',       ARRAY['Java','Spring Boot','SQL','DSA','System Design','Docker','AWS','Git'], ARRAY['AWS Solutions Architect','Oracle Java SE'], 95, 88, 85, 78, 82, 0, 5),
('sp-008', 'u-stu-008', 'ABIT2022CSE005', 'Computer Science & Engineering', 2026, 8.15, 'Data Analyst',        '+91 98765 43217', 'linkedin.com/in/priti-mohanty',    'github.com/pritimohanty',     ARRAY['Python','SQL','Machine Learning','R','Statistics'], ARRAY[], 78, 79, 74, 72, 68, 0, 3),
('sp-009', 'u-stu-009', 'ABIT2022ETC002', 'Electronics & Telecom',          2026, 7.34, 'DevOps Engineer',     '+91 98765 43218', 'linkedin.com/in/arjun-behera',     'github.com/arjunbehera',      ARRAY['Docker','Kubernetes','AWS','Linux','Python','Git','Terraform'], ARRAY['AWS Cloud Practitioner'], 80, 74, 70, 60, 55, 0, 3),
('sp-010', 'u-stu-010', 'ABIT2022CSE006', 'Computer Science & Engineering', 2026, 8.92, 'Data Analyst',        '+91 98765 43219', 'linkedin.com/in/sneha-mishra',     'github.com/snehamis',         ARRAY['Python','SQL','Power BI','Tableau','Statistics','Excel','R'], ARRAY['Google Data Analytics Certificate','Tableau Desktop Specialist'], 92, 86, 82, 85, 78, 0, 4),
('sp-011', 'u-stu-011', 'ABIT2022IT003',  'Information Technology',         2026, 7.56, 'Software Engineer',   '+91 98765 43220', 'linkedin.com/in/aditya-nayak',     'github.com/adityanayak',      ARRAY['JavaScript','React','Node.js','MongoDB','Git'], ARRAY[], 68, 67, 62, 65, 55, 0, 2),
('sp-012', 'u-stu-012', 'ABIT2022CSE007', 'Computer Science & Engineering', 2026, 8.78, 'ML Engineer',         '+91 98765 43221', 'linkedin.com/in/kavya-reddy',      'github.com/kavyareddy',       ARRAY['Python','PyTorch','TensorFlow','Statistics','SQL','Linear Algebra'], ARRAY['DeepLearning.AI Specialization'], 88, 84, 80, 75, 72, 0, 4),
('sp-013', 'u-stu-013', 'ABIT2022ME001',  'Mechanical Engineering',         2026, 6.45, 'Business Analyst',    '+91 98765 43222', 'linkedin.com/in/deepak-pradhan',   'github.com/deepakp',          ARRAY['Excel','Communication','SQL'], ARRAY[], 50, 42, 40, 65, 38, 1, 1),
('sp-014', 'u-stu-014', 'ABIT2022CSE008', 'Computer Science & Engineering', 2026, 7.90, 'Web Developer',       '+91 98765 43223', 'linkedin.com/in/tanvi-patra',      'github.com/tanvipatra',       ARRAY['React','JavaScript','TypeScript','Node.js','Tailwind CSS','Git'], ARRAY[], 75, 73, 68, 70, 62, 0, 3),
('sp-015', 'u-stu-015', 'ABIT2022ETC003', 'Electronics & Telecom',          2026, 7.22, 'Software Engineer',   '+91 98765 43224', 'linkedin.com/in/nikhil-swain',     'github.com/nikhilswain',      ARRAY['C++','Java','Python','DSA'], ARRAY[], 55, 58, 52, 55, 45, 0, 1),
('sp-016', 'u-stu-016', 'ABIT2022IT004',  'Information Technology',         2026, 8.34, 'Data Analyst',        '+91 98765 43225', 'linkedin.com/in/isha-tripathi',    'github.com/ishatripathi',     ARRAY['Python','SQL','Excel','Power BI','Communication'], ARRAY['Google Data Analytics Certificate'], 82, 76, 72, 78, 64, 0, 2),
('sp-017', 'u-stu-017', 'ABIT2022CSE009', 'Computer Science & Engineering', 2026, 7.45, 'Software Engineer',   '+91 98765 43226', 'linkedin.com/in/saurav-mahapatra', 'github.com/sauravmaha',       ARRAY['Java','Python','SQL','Git'], ARRAY[], 62, 64, 58, 60, 50, 0, 2),
('sp-018', 'u-stu-018', 'ABIT2022CSE010', 'Computer Science & Engineering', 2026, 8.10, 'Software Engineer',   '+91 98765 43227', 'linkedin.com/in/ritika-samantray', 'github.com/ritikas',          ARRAY['Python','Java','React','SQL','Docker','Git'], ARRAY['AWS Cloud Practitioner'], 78, 75, 70, 68, 65, 0, 3),
('sp-019', 'u-stu-019', 'ABIT2022ME002',  'Mechanical Engineering',         2026, 6.90, 'Business Analyst',    '+91 98765 43228', 'linkedin.com/in/aman-sethi',       'github.com/amansethi',        ARRAY['Excel','Python','Communication'], ARRAY[], 48, 48, 42, 70, 35, 1, 0),
('sp-020', 'u-stu-020', 'ABIT2022IT005',  'Information Technology',         2026, 7.78, 'Web Developer',       '+91 98765 43229', 'linkedin.com/in/pooja-lenka',      'github.com/poojalenka',       ARRAY['HTML','CSS','JavaScript','React','Node.js','MongoDB'], ARRAY[], 70, 68, 60, 65, 55, 0, 2)
ON CONFLICT (user_id) DO NOTHING;

-- ========== COMPANIES ==========
INSERT INTO companies (id, name, industry, website, status) VALUES
('c-001', 'TechNova Solutions',  'IT Services',      'https://technova.example.com',  'active'),
('c-002', 'CloudCraft Tech',     'Cloud & DevOps',    'https://cloudcraft.example.com','active'),
('c-003', 'AxisGrid Analytics',  'Data Analytics',    'https://axisgrid.example.com',  'active'),
('c-004', 'Infosys',             'IT Services',       'https://infosys.com',           'active'),
('c-005', 'Wipro',               'IT Services',       'https://wipro.com',             'active'),
('c-006', 'TCS',                 'IT Services',       'https://tcs.com',               'active'),
('c-007', 'DeepSpark AI',        'AI & ML',           'https://deepspark.example.com', 'active')
ON CONFLICT DO NOTHING;

-- ========== JOBS ==========
INSERT INTO jobs (id, company_id, recruiter_id, title, description, location, type, skills_required, min_cgpa, eligible_branches, max_backlogs, deadline, status) VALUES
('job-001', 'c-001', 'a1b2c3d4-0001-0001-0001-000000000003', 'Graduate Data Analyst',         'Analyze large-scale operational data, build dashboards, and report KPI trends. Requires SQL, Python, and visualization skills.',                                        'Bhubaneswar', 'Full-time',  ARRAY['SQL','Python','Power BI'],                             7.0, ARRAY['CSE','IT','ETC'],  0, now() + interval '14 days', 'active'),
('job-002', 'c-003', 'a1b2c3d4-0001-0001-0001-000000000003', 'Business Intelligence Intern',  'Design interactive analytics dashboards and executive business reports. Must be detail-oriented with strong Excel and SQL skills.',                                       'Hybrid',      'Internship', ARRAY['SQL','Excel','Tableau'],                               6.5, ARRAY['CSE','IT','ETC','ME'], 1, now() + interval '20 days', 'active'),
('job-003', 'c-002', 'a1b2c3d4-0001-0001-0001-000000000003', 'Junior Software Engineer',      'Build robust backend APIs and high-availability cloud microservices. Strong DSA and system design thinking required.',                                                    'Bengaluru',   'Full-time',  ARRAY['Java','Spring Boot','SQL','DSA','System Design'],      7.5, ARRAY['CSE','IT'],        0, now() + interval '30 days', 'active'),
('job-004', 'c-007', 'a1b2c3d4-0001-0001-0001-000000000003', 'ML Research Intern',            'Apply deep learning techniques to NLP and computer vision projects. Publish-quality research output expected.',                                                           'Remote',      'Internship', ARRAY['Python','PyTorch','Statistics','Linear Algebra'],      7.0, ARRAY['CSE','IT','ETC'],  0, now() + interval '25 days', 'active'),
('job-005', 'c-004', 'a1b2c3d4-0001-0001-0001-000000000003', 'Systems Engineer',              'Core IT infrastructure role including application support, database management, and automation scripting.',                                                               'Pune',        'Full-time',  ARRAY['Java','SQL','Linux','Python'],                         6.0, ARRAY['CSE','IT','ETC','ME'], 1, now() + interval '18 days', 'active'),
('job-006', 'c-005', 'a1b2c3d4-0001-0001-0001-000000000003', 'Associate Developer',           'Full-stack development role building enterprise web applications with modern JavaScript frameworks.',                                                                     'Hyderabad',   'Full-time',  ARRAY['JavaScript','React','Node.js','SQL'],                  6.5, ARRAY['CSE','IT'],        1, now() + interval '22 days', 'active'),
('job-007', 'c-006', 'a1b2c3d4-0001-0001-0001-000000000003', 'Digital Trainee',               'Comprehensive training program covering cloud, AI, and enterprise systems. Strong aptitude and communication skills valued.',                                              'Chennai',     'Full-time',  ARRAY['Python','SQL','Communication'],                        6.0, ARRAY['CSE','IT','ETC','ME'], 2, now() + interval '35 days', 'active'),
('job-008', 'c-001', 'a1b2c3d4-0001-0001-0001-000000000003', 'DevOps Engineer',               'Manage CI/CD pipelines, container orchestration, and cloud infrastructure. AWS experience preferred.',                                                                    'Bhubaneswar', 'Full-time',  ARRAY['Docker','Kubernetes','AWS','Linux','Git','Terraform'], 7.0, ARRAY['CSE','IT','ETC'],  0, now() + interval '28 days', 'active')
ON CONFLICT DO NOTHING;

-- ========== APPLICATIONS ==========
INSERT INTO applications (id, student_id, job_id, status, current_round, applied_at) VALUES
-- Ananya (sp-001)
('app-001', 'sp-001', 'job-001', 'interview',    'Technical Round 2', now() - interval '17 days'),
('app-002', 'sp-001', 'job-002', 'shortlisted',  'Aptitude Test',     now() - interval '14 days'),
('app-003', 'sp-001', 'job-007', 'applied',      'Resume Screening',  now() - interval '5 days'),
-- Vikram (sp-002)
('app-004', 'sp-002', 'job-003', 'interview',    'Technical Round 1', now() - interval '12 days'),
('app-005', 'sp-002', 'job-005', 'offered',      'Offer Letter Sent', now() - interval '20 days'),
-- Soham (sp-003)
('app-006', 'sp-003', 'job-005', 'applied',      'Resume Screening',  now() - interval '8 days'),
('app-007', 'sp-003', 'job-001', 'shortlisted',  'Aptitude Test',     now() - interval '10 days'),
-- Rohan (sp-004)
('app-008', 'sp-004', 'job-007', 'applied',      'Resume Screening',  now() - interval '3 days'),
-- Rahul Kumar (sp-007) — top candidate
('app-009', 'sp-007', 'job-003', 'offered',      'Offer Letter Sent', now() - interval '22 days'),
('app-010', 'sp-007', 'job-005', 'interview',    'HR Round',          now() - interval '15 days'),
('app-011', 'sp-007', 'job-008', 'shortlisted',  'Technical Test',    now() - interval '7 days'),
-- Priti (sp-008)
('app-012', 'sp-008', 'job-001', 'interview',    'Technical Round 1', now() - interval '16 days'),
('app-013', 'sp-008', 'job-004', 'applied',      'Resume Screening',  now() - interval '6 days'),
-- Kavya (sp-012)
('app-014', 'sp-012', 'job-004', 'interview',    'Technical Round 1', now() - interval '14 days'),
-- Sneha (sp-010)
('app-015', 'sp-010', 'job-001', 'offered',      'Offer Letter Sent', now() - interval '10 days'),
('app-016', 'sp-010', 'job-002', 'interview',    'Final Round',       now() - interval '12 days'),
-- Aditya (sp-011)
('app-017', 'sp-011', 'job-006', 'shortlisted',  'Coding Test',       now() - interval '9 days'),
-- Tanvi (sp-014)
('app-018', 'sp-014', 'job-006', 'interview',    'Technical Round 1', now() - interval '11 days'),
-- Arjun (sp-009)
('app-019', 'sp-009', 'job-008', 'interview',    'Technical Round 1', now() - interval '13 days'),
-- Isha (sp-016)
('app-020', 'sp-016', 'job-001', 'shortlisted',  'Aptitude Test',     now() - interval '7 days'),
('app-021', 'sp-016', 'job-007', 'applied',      'Resume Screening',  now() - interval '4 days'),
-- Saurav (sp-017)
('app-022', 'sp-017', 'job-005', 'applied',      'Resume Screening',  now() - interval '6 days'),
-- Ritika (sp-018)
('app-023', 'sp-018', 'job-003', 'shortlisted',  'Coding Test',       now() - interval '8 days'),
-- Nikhil (sp-015)
('app-024', 'sp-015', 'job-005', 'applied',      'Resume Screening',  now() - interval '4 days'),
-- Pooja (sp-020)
('app-025', 'sp-020', 'job-006', 'applied',      'Resume Screening',  now() - interval '2 days')
ON CONFLICT DO NOTHING;

-- ========== DRIVES ==========
INSERT INTO drives (id, company_id, role, drive_date, venue, min_cgpa, branches, status) VALUES
('drive-001', 'c-001', 'Graduate Data Analyst',    now() + interval '5 days',  'Seminar Hall A',    7.0, ARRAY['CSE','IT','ETC'],      'scheduled'),
('drive-002', 'c-002', 'Associate Engineer',       now() + interval '8 days',  'Main Auditorium',   7.5, ARRAY['CSE','IT'],            'confirmed'),
('drive-003', 'c-003', 'BI Intern',                now() + interval '12 days', 'Lab 204',           6.5, ARRAY['CSE','IT','ETC','ME'], 'draft'),
('drive-004', 'c-004', 'Systems Engineer',         now() + interval '18 days', 'Seminar Hall A',    6.0, ARRAY['CSE','IT','ETC','ME'], 'draft'),
('drive-005', 'c-006', 'Digital Trainee',          now() + interval '25 days', 'Main Auditorium',   6.0, ARRAY['CSE','IT','ETC','ME'], 'draft')
ON CONFLICT DO NOTHING;

-- ========== DRIVE SLOTS ==========
INSERT INTO drive_slots (id, drive_id, start_time, end_time, venue, panel_name, capacity) VALUES
('slot-001', 'drive-001', now() + interval '5 days' + interval '9 hours',  now() + interval '5 days' + interval '11 hours', 'Seminar Hall A', 'Panel A - TechNova', 50),
('slot-002', 'drive-001', now() + interval '5 days' + interval '11 hours', now() + interval '5 days' + interval '13 hours', 'Seminar Hall A', 'Panel B - TechNova', 50),
('slot-003', 'drive-002', now() + interval '8 days' + interval '10 hours', now() + interval '8 days' + interval '12 hours', 'Main Auditorium', 'Panel A - CloudCraft', 40),
('slot-004', 'drive-002', now() + interval '8 days' + interval '14 hours', now() + interval '8 days' + interval '16 hours', 'Main Auditorium', 'Panel B - CloudCraft', 40),
-- Deliberately overlapping slot for conflict demo
('slot-005', 'drive-004', now() + interval '5 days' + interval '10 hours', now() + interval '5 days' + interval '12 hours', 'Seminar Hall A', 'Panel A - Infosys', 60)
ON CONFLICT DO NOTHING;

-- ========== DRIVE CANDIDATES ==========
INSERT INTO drive_candidates (id, drive_id, student_id, slot_id, status) VALUES
-- TechNova drive — data analyst candidates
('dc-001', 'drive-001', 'sp-001', 'slot-001', 'shortlisted'),
('dc-002', 'drive-001', 'sp-008', 'slot-001', 'shortlisted'),
('dc-003', 'drive-001', 'sp-010', 'slot-002', 'shortlisted'),
('dc-004', 'drive-001', 'sp-016', 'slot-002', 'shortlisted'),
-- CloudCraft drive — SDE candidates
('dc-005', 'drive-002', 'sp-002', 'slot-003', 'shortlisted'),
('dc-006', 'drive-002', 'sp-007', 'slot-003', 'shortlisted'),
('dc-007', 'drive-002', 'sp-018', 'slot-004', 'shortlisted'),
-- Rahul (sp-007) also shortlisted for Infosys (creates conflict with CloudCraft)
('dc-008', 'drive-004', 'sp-007', 'slot-005', 'shortlisted')
ON CONFLICT DO NOTHING;

-- ========== OFFERS ==========
INSERT INTO offers (id, application_id, student_id, job_id, company_id, role, ctc_lpa, offer_date, acceptance_deadline, status, joining_date, joining_status) VALUES
('offer-001', 'app-005', 'sp-002', 'job-005', 'c-004', 'Systems Engineer',         '6.50', now() - interval '18 days', now() + interval '10 days', 'accepted',  now() + interval '45 days', 'joining-pending'),
('offer-002', 'app-009', 'sp-007', 'job-003', 'c-002', 'Junior Software Engineer', '14.00', now() - interval '20 days', now() + interval '7 days', 'accepted',  now() + interval '30 days', 'joining-pending'),
('offer-003', 'app-015', 'sp-010', 'job-001', 'c-001', 'Graduate Data Analyst',    '8.50', now() - interval '8 days',  now() + interval '14 days', 'pending',   null,                       'not-joined'),
('offer-004', 'app-014', 'sp-012', 'job-004', 'c-007', 'ML Research Intern',       '4.00', now() - interval '5 days',  now() + interval '15 days', 'pending',   null,                       'not-joined')
ON CONFLICT DO NOTHING;

-- ========== OFFER DOCUMENTS ==========
INSERT INTO offer_documents (id, offer_id, document_type, status, submitted_at, verified_at, deadline) VALUES
-- Vikram (offer-001) — mostly done
('od-001', 'offer-001', 'Aadhaar Card',         'verified',  now() - interval '15 days', now() - interval '14 days', now() + interval '5 days'),
('od-002', 'offer-001', 'PAN Card',             'verified',  now() - interval '15 days', now() - interval '14 days', now() + interval '5 days'),
('od-003', 'offer-001', 'Resume',               'verified',  now() - interval '16 days', now() - interval '15 days', now() + interval '5 days'),
('od-004', 'offer-001', 'Degree Certificate',   'submitted', now() - interval '10 days', null,                       now() + interval '5 days'),
('od-005', 'offer-001', 'Marksheet',            'submitted', now() - interval '10 days', null,                       now() + interval '5 days'),
('od-006', 'offer-001', 'Photograph',           'verified',  now() - interval '15 days', now() - interval '14 days', now() + interval '5 days'),
('od-007', 'offer-001', 'Medical Certificate',  'pending',   null,                       null,                       now() + interval '3 days'),
('od-008', 'offer-001', 'Bank Details',         'verified',  now() - interval '12 days', now() - interval '11 days', now() + interval '5 days'),
-- Rahul (offer-002) — all done
('od-009', 'offer-002', 'Aadhaar Card',         'verified',  now() - interval '18 days', now() - interval '17 days', now() + interval '10 days'),
('od-010', 'offer-002', 'PAN Card',             'verified',  now() - interval '18 days', now() - interval '17 days', now() + interval '10 days'),
('od-011', 'offer-002', 'Resume',               'verified',  now() - interval '19 days', now() - interval '18 days', now() + interval '10 days'),
('od-012', 'offer-002', 'Degree Certificate',   'verified',  now() - interval '16 days', now() - interval '15 days', now() + interval '10 days'),
('od-013', 'offer-002', 'Marksheet',            'verified',  now() - interval '16 days', now() - interval '15 days', now() + interval '10 days'),
('od-014', 'offer-002', 'Photograph',           'verified',  now() - interval '18 days', now() - interval '17 days', now() + interval '10 days'),
('od-015', 'offer-002', 'Medical Certificate',  'verified',  now() - interval '14 days', now() - interval '13 days', now() + interval '10 days'),
('od-016', 'offer-002', 'Bank Details',         'verified',  now() - interval '15 days', now() - interval '14 days', now() + interval '10 days'),
-- Sneha (offer-003) — pending
('od-017', 'offer-003', 'Aadhaar Card',         'pending', null, null, now() + interval '12 days'),
('od-018', 'offer-003', 'PAN Card',             'pending', null, null, now() + interval '12 days'),
('od-019', 'offer-003', 'Resume',               'submitted', now() - interval '2 days', null, now() + interval '12 days'),
('od-020', 'offer-003', 'Degree Certificate',   'pending', null, null, now() + interval '12 days'),
('od-021', 'offer-003', 'Marksheet',            'pending', null, null, now() + interval '12 days'),
('od-022', 'offer-003', 'Photograph',           'pending', null, null, now() + interval '12 days'),
('od-023', 'offer-003', 'Medical Certificate',  'pending', null, null, now() + interval '12 days'),
('od-024', 'offer-003', 'Bank Details',         'pending', null, null, now() + interval '12 days')
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
('a1b2c3d4-0001-0001-0001-000000000004', 'sp-001'),
('a1b2c3d4-0001-0001-0001-000000000004', 'sp-004'),
('a1b2c3d4-0001-0001-0001-000000000004', 'sp-005'),
('a1b2c3d4-0001-0001-0001-000000000004', 'sp-002'),
('a1b2c3d4-0001-0001-0001-000000000004', 'sp-003')
ON CONFLICT DO NOTHING;
