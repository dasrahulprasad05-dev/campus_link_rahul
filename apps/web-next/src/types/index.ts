export type UserRole = 'student' | 'admin' | 'recruiter' | 'mentor' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  email_verified: boolean;
  admin_verified?: boolean;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  reg_no?: string;
  branch?: string;
  year?: number;
  cgpa?: number;
  target_role?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  skills?: string[];
  certifications?: string[];
  profile_completion?: number;
  readiness_score?: number;
}

export interface Job {
  id: string;
  company_id?: string;
  company: string;
  title: string;
  description: string;
  location?: string;
  type?: string;
  skills_required?: string[];
  min_cgpa?: number;
  eligible_branches?: string[];
  max_backlogs?: number;
  deadline?: string;
  status?: string;
  created_at?: string;
}

export interface Application {
  id: string;
  student_id: string;
  job_id: string;
  job_title?: string;
  job?: string;
  company?: string;
  company_name?: string;
  status: 'applied' | 'shortlisted' | 'interview' | 'offered' | 'rejected' | 'withdrawn';
  current_round?: string;
  round?: string;
  applied_at?: string;
  cgpa?: number;
  branch?: string;
}

export interface HiringStageProgress {
  stage_id: string;
  stage_name: string;
  stage_order: number;
  stage_type: 'test' | 'interview' | 'gd' | 'hr' | 'offer';
  is_eliminatory: boolean;
  status: 'pending' | 'scheduled' | 'in-progress' | 'passed' | 'failed' | 'skipped';
  scheduled_at?: string | null;
  completed_at?: string | null;
  feedback?: string | null;
  score?: number | null;
  interviewer_name?: string | null;
}

export interface NotificationItem {
  id: string;
  user_id?: string | null;
  type: 'job_posted' | 'drive_announced' | 'shortlisted' | 'stage_updated' | 'mentor_feedback' | 'system_alert';
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface KPIData {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: string;
}
