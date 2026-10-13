'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bell, Briefcase, FileText, User } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

export default function MobileNav() {
  const pathname = usePathname();
  const { unreadCount, getRole } = useAuthStore();
  const role = getRole();

  const getLinks = () => {
    if (role === 'admin') {
      return [
        { href: '/admin/dashboard', label: 'TPO', icon: Home },
        { href: '/admin/drives', label: 'Drives', icon: Briefcase },
        { href: '/admin/students', label: 'Students', icon: User },
        { href: '/admin/interventions', label: 'Action', icon: Bell },
      ];
    }
    if (role === 'recruiter') {
      return [
        { href: '/recruiter/dashboard', label: 'Home', icon: Home },
        { href: '/recruiter/jobs', label: 'Jobs', icon: Briefcase },
        { href: '/recruiter/pipeline', label: 'Pipeline', icon: FileText },
        { href: '/recruiter/matches', label: 'Matches', icon: User },
      ];
    }
    if (role === 'mentor') {
      return [
        { href: '/mentor/dashboard', label: 'Home', icon: Home },
        { href: '/mentor/students', label: 'Mentees', icon: User },
        { href: '/mentor/roadmaps', label: 'Roadmap', icon: FileText },
      ];
    }
    return [
      { href: '/student/dashboard', label: 'Home', icon: Home },
      { href: '/student/notice-board', label: 'Notices', icon: Bell, badge: unreadCount },
      { href: '/student/jobs', label: 'Jobs', icon: Briefcase },
      { href: '/student/applications', label: 'Pipeline', icon: FileText },
      { href: '/student/profile', label: 'Profile', icon: User },
    ];
  };

  const links = getLinks();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--topbar-bg)] backdrop-blur-xl border-t border-[var(--border)] px-2 flex items-center justify-around z-50">
      {links.map(link => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors relative ${
              isActive ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <div className="relative">
              <Icon className="h-5 w-5" />
              {link.badge !== undefined && link.badge > 0 && (
                <span className="absolute -top-1 -right-2 h-3.5 min-w-3.5 px-1 rounded-full bg-rose-500 text-white text-[8.5px] font-bold flex items-center justify-center leading-none">
                  {link.badge}
                </span>
              )}
            </div>
            <span className="mt-1">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
