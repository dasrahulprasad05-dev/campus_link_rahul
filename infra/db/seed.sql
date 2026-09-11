-- ============================================================
-- CAMPUSLINK — Seed Data
-- Populates the database with demo data for testing.
-- ============================================================

-- Permanent Institutional & Corporate Users (Password: rahul2005)
INSERT INTO users (id, name, email, password_hash, role, email_verified) VALUES
('a1b2c3d4-0001-0001-0001-000000000002', 'Training & Placement Office ABIT', 'rahulprasaddas9@gmail.com', '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'admin', true),
('a1b2c3d4-0001-0001-0001-000000000003', 'TCS BHUBANESWAR', 'ommprasadd363@gmail.com', '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'recruiter', true),
('a1b2c3d4-0001-0001-0001-000000000004', 'Prof. Rahul Prasad Das', 'rahulprsaddas@gmail.com', '$2a$10$fwZNNHQTfgM2kTXYKRrgE.4RRGbB84abxa93aGQUcRp5JJkZwg6F.', 'mentor', true)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, name = EXCLUDED.name, email_verified = true;

-- Student Profile
INSERT INTO student_profiles (user_id, reg_no, branch, year, cgpa, target_role, phone, linkedin, github, skills, certifications, profile_completion, readiness_score) VALUES
('a1b2c3d4-0001-0001-0001-000000000001', 'UNIV2022CSE1042', 'Computer Science & Engineering', 2026, 8.42, 'Data Analyst', '+91 98765 43210', 'linkedin.com/in/ananya-sharma', 'github.com/ananyasharma', ARRAY['Python','SQL','Excel','Data Analysis','Communication','Statistics'], ARRAY['Google Data Analytics Certificate','AWS Cloud Practitioner'], 91, 78)
ON CONFLICT (user_id) DO NOTHING;

-- Companies
INSERT INTO companies (id, name, industry, status) VALUES
('c1c2c3c4-0001-0001-0001-000000000001', 'TechNova Solutions', 'IT Services', 'active'),
('c1c2c3c4-0001-0001-0001-000000000002', 'CloudCraft Tech', 'Cloud & DevOps', 'active'),
('c1c2c3c4-0001-0001-0001-000000000003', 'AxisGrid Analytics', 'Data Analytics', 'new'),
('c1c2c3c4-0001-0001-0001-000000000004', 'Infosys', 'IT Services', 'active'),
('c1c2c3c4-0001-0001-0001-000000000005', 'Wipro', 'IT Services', 'active')
ON CONFLICT DO NOTHING;
