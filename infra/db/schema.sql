-- ============================================================
-- CAMPUSLINK — Database Schema (PostgreSQL)
-- Production relational schema: 11 core tables
-- ============================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student','admin','recruiter','mentor')),
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Student Profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    reg_no VARCHAR(30) UNIQUE,
    branch VARCHAR(80),
    year INTEGER,
    cgpa DECIMAL(4,2),
    target_role VARCHAR(80),
    phone VARCHAR(20),
    linkedin VARCHAR(255),
    github VARCHAR(255),
    skills TEXT[] DEFAULT '{}',
    certifications TEXT[] DEFAULT '{}',
    profile_completion INTEGER DEFAULT 0,
    readiness_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    tech VARCHAR(255),
    description TEXT,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Companies
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    industry VARCHAR(100),
    website TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    recruiter_id UUID REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(100),
    type VARCHAR(30) DEFAULT 'Full-time',
    skills_required TEXT[] DEFAULT '{}',
    min_cgpa DECIMAL(4,2) DEFAULT 0,
    deadline TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Applications
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id),
    job_id UUID REFERENCES jobs(id),
    status VARCHAR(30) DEFAULT 'applied' CHECK (status IN ('applied','shortlisted','interview','offered','rejected','withdrawn')),
    current_round VARCHAR(100),
    applied_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, job_id)
);

-- Placement Drives
CREATE TABLE IF NOT EXISTS drives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    role VARCHAR(200) NOT NULL,
    drive_date TIMESTAMPTZ,
    venue VARCHAR(200),
    min_cgpa DECIMAL(4,2) DEFAULT 0,
    branches TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Roadmap Milestones
CREATE TABLE IF NOT EXISTS roadmap_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','in-progress','completed')),
    mentor_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Interview Sessions
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id),
    target_role VARCHAR(80),
    questions JSONB DEFAULT '[]',
    answers JSONB DEFAULT '[]',
    avg_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Mentor Assignments
CREATE TABLE IF NOT EXISTS mentor_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES users(id),
    student_id UUID REFERENCES student_profiles(id),
    assigned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(mentor_id, student_id)
);

-- Readiness History (for trend tracking)
CREATE TABLE IF NOT EXISTS readiness_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    factors JSONB DEFAULT '{}',
    recorded_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Extended Columns on Existing Tables
-- ============================================================

-- Student Profiles: additional readiness dimensions
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS aptitude_score INTEGER DEFAULT 0;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS communication_score INTEGER DEFAULT 0;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS interview_score INTEGER DEFAULT 0;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS backlogs INTEGER DEFAULT 0;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS projects_count INTEGER DEFAULT 0;

-- Jobs: eligibility constraints for hard-filter pipeline
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS eligible_branches TEXT[] DEFAULT '{}';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS max_backlogs INTEGER DEFAULT 0;

-- ============================================================
-- New Tables: Readiness, Scheduling, Offers, Audit
-- ============================================================

-- Role-Specific Readiness Weight Configurations
CREATE TABLE IF NOT EXISTS readiness_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(80) UNIQUE NOT NULL,
    weights JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Drive Time Slots (for conflict-free scheduling)
CREATE TABLE IF NOT EXISTS drive_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drive_id UUID REFERENCES drives(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    venue VARCHAR(200),
    panel_name VARCHAR(200),
    capacity INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Drive Candidates (which students are shortlisted for which drives)
CREATE TABLE IF NOT EXISTS drive_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drive_id UUID REFERENCES drives(id) ON DELETE CASCADE,
    student_id UUID REFERENCES student_profiles(id),
    slot_id UUID REFERENCES drive_slots(id),
    status VARCHAR(20) DEFAULT 'shortlisted'
        CHECK (status IN ('shortlisted','scheduled','interviewed','selected','rejected')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(drive_id, student_id)
);

-- Offers (complete lifecycle from selection to joining)
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) UNIQUE,
    student_id UUID REFERENCES student_profiles(id),
    job_id UUID REFERENCES jobs(id),
    company_id UUID REFERENCES companies(id),
    role VARCHAR(200) NOT NULL,
    ctc_lpa DECIMAL(6,2),
    offer_date TIMESTAMPTZ DEFAULT now(),
    acceptance_deadline TIMESTAMPTZ,
    status VARCHAR(30) DEFAULT 'pending'
        CHECK (status IN ('pending','accepted','declined','expired','withdrawn')),
    joining_date TIMESTAMPTZ,
    joining_status VARCHAR(20) DEFAULT 'not-joined'
        CHECK (joining_status IN ('not-joined','joining-pending','joined','no-show')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Offer Documents (document checklist per offer)
CREATE TABLE IF NOT EXISTS offer_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending','submitted','verified','rejected')),
    submitted_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Log (who did what, when)
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    user_role VARCHAR(20),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_student_profiles_user ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_readiness_history_student ON readiness_history(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_mentor ON mentor_assignments(mentor_id);
CREATE INDEX IF NOT EXISTS idx_offers_student ON offers(student_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_drive_slots_drive ON drive_slots(drive_id);
CREATE INDEX IF NOT EXISTS idx_drive_candidates_drive ON drive_candidates(drive_id);
CREATE INDEX IF NOT EXISTS idx_drive_candidates_student ON drive_candidates(student_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
