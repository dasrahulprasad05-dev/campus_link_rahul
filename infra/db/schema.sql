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

-- Indexes
CREATE INDEX idx_student_profiles_user ON student_profiles(user_id);
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_readiness_history_student ON readiness_history(student_id);
CREATE INDEX idx_mentor_assignments_mentor ON mentor_assignments(mentor_id);
