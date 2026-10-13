'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  Home,
  User,
  Bell,
  Briefcase,
  FileText,
  Award,
  Mic,
  HelpCircle,
  Map,
  Compass,
  Users,
  Building,
  Target,
  Calendar,
  BarChart3,
  Zap,
  LogOut,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  id: string;
  href: string;
  label: string;
  icon: any;
  badge?: string;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

export default function Sidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const pathname = usePathname();
  const { user, logout, getRole, unreadCount } = useAuthStore();
  const role = getRole();

  const NAV_CONFIG: Record<string, NavSection[]> = {
    student: [
      {
        section: 'Overview',
        items: [
          { id: 'dashboard', href: '/student/dashboard', label: 'Dashboard', icon: Home },
          { id: 'notice-board', href: '/student/notice-board', label: 'Notice Board', icon: Bell, badge: unreadCount > 0 ? String(unreadCount) : undefined },
          { id: 'profile', href: '/student/profile', label: 'My Profile', icon: User },
        ],
      },
      {
        section: 'Placement Intelligence',
        items: [
          { id: 'readiness', href: '/student/readiness', label: 'Readiness Score', icon: BarChart3 },
          { id: 'roadmap', href: '/student/roadmap', label: 'Career Roadmap', icon: Map },
          { id: 'career-finder', href: '/student/career-finder', label: 'Path Finder', icon: Compass, badge: 'AI' },
        ],
      },
      {
        section: 'Opportunities',
        items: [
          { id: 'jobs', href: '/student/jobs', label: 'Job Discovery', icon: Briefcase },
          { id: 'applications', href: '/student/applications', label: 'Applications', icon: FileText },
          { id: 'offers', href: '/student/offers', label: 'Offer Letters', icon: Award },
          { id: 'resume', href: '/student/resume', label: 'Resume Matcher', icon: FileText },
        ],
      },
      {
        section: 'Interview Prep',
        items: [
          { id: 'interview', href: '/student/interview', label: 'AI Mock Interview', icon: Mic, badge: 'STAR' },
          { id: 'policy-qa', href: '/student/policy-qa', label: 'Policy Assistant', icon: HelpCircle },
        ],
      },
    ],
    admin: [
      {
        section: 'TPO Command Center',
        items: [
          { id: 'dashboard', href: '/admin/dashboard', label: 'Dashboard', icon: Home },
          { id: 'analytics', href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'students', href: '/admin/students', label: 'Students', icon: Users },
          { id: 'companies', href: '/admin/companies', label: 'Companies', icon: Building },
          { id: 'drives', href: '/admin/drives', label: 'Placement Drives', icon: Target },
          { id: 'scheduler', href: '/admin/scheduler', label: 'Drive Scheduler', icon: Calendar },
          { id: 'interventions', href: '/admin/interventions', label: 'Interventions', icon: Zap },
          { id: 'offers', href: '/admin/offers', label: 'Offer Tracker', icon: Award },
        ],
      },
    ],
    recruiter: [
      {
        section: 'Recruitment Funnel',
        items: [
          { id: 'dashboard', href: '/recruiter/dashboard', label: 'Dashboard', icon: Home },
          { id: 'jobs', href: '/recruiter/jobs', label: 'My Postings', icon: Briefcase },
          { id: 'matches', href: '/recruiter/matches', label: 'Candidate Matcher', icon: Target, badge: 'ML' },
          { id: 'pipeline', href: '/recruiter/pipeline', label: 'Multi-Round Pipeline', icon: BarChart3 },
        ],
      },
    ],
    mentor: [
      {
        section: 'Mentorship',
        items: [
          { id: 'dashboard', href: '/mentor/dashboard', label: 'Dashboard', icon: Home },
          { id: 'students', href: '/mentor/students', label: 'Mentees', icon: Users },
          { id: 'roadmaps', href: '/mentor/roadmaps', label: 'Roadmap Reviews', icon: Map },
        ],
      },
    ],
    super_admin: [
      {
        section: 'Root Console',
        items: [
          { id: 'dashboard', href: '/superadmin/dashboard', label: 'Super Admin', icon: Home },
        ],
      },
    ],
  };

  const sections = NAV_CONFIG[role] || NAV_CONFIG.student;
  const initials = (user?.name || 'User').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside className="sidebar-container w-64 h-screen bg-[var(--sidebar-bg)] border-r border-[var(--border)] flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[var(--border)] gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Zap className="h-5 w-5 text-white fill-white" />
        </div>
        <div>
          <div className="font-bold text-base tracking-tight text-[var(--text-primary)] flex items-center gap-1.5">
            CampusGrid <span className="text-[11px] font-extrabold px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">2.0</span>
          </div>
          <div className="text-[11px] text-[var(--text-tertiary)] font-medium">Placement Intelligence</div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map(sec => (
          <div key={sec.section}>
            <div className="px-3 mb-2 text-[10.5px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              {sec.section}
            </div>
            <div className="space-y-1">
              {sec.items.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-indigo-600/10 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25 shadow-sm shadow-indigo-500/10'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        item.badge === 'Live' || item.badge === 'New'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Card & Logout */}
      <div className="p-3 border-t border-[var(--border)] bg-[var(--surface-elevated)]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[var(--text-primary)] truncate">{user?.name || 'Campus Student'}</div>
              <div className="text-[10px] text-[var(--text-tertiary)] capitalize truncate">{role.replace('_', ' ')}</div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Sign out of CampusGrid"
            aria-label="Logout"
            className="p-1.5 text-[var(--text-tertiary)] hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
