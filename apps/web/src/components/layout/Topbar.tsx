'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Menu, Bell, Search, ShieldCheck, LogOut } from 'lucide-react';

export default function Topbar({ onToggleMobile }: { onToggleMobile?: () => void }) {
  const pathname = usePathname();
  const { user, getRole, unreadCount, logout } = useAuthStore();
  const role = getRole();

  const roleLabels: Record<string, string> = {
    student: '👩‍🎓 Student Portal',
    admin: '🏛️ TPO Cell',
    recruiter: '🏢 Recruiter Portal',
    mentor: '👨‍🏫 Mentor Portal',
    super_admin: '🛡️ Super Admin',
  };

  const breadcrumb = pathname
    .split('/')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '))
    .join(' / ') || 'Dashboard';

  return (
    <header className="h-16 bg-[#090d16]/80 backdrop-blur-md border-b border-white/8 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="p-2 text-slate-400 hover:text-white rounded-lg md:hidden hover:bg-white/5 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
          <span className="text-slate-300 font-semibold">CampusGrid</span>
          <span>/</span>
          <span className="text-indigo-400 font-semibold">{breadcrumb}</span>
        </div>
      </div>

      {/* Right: Search, Notifications, Role Badge */}
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search drives, jobs, skills..."
            className="w-56 lg:w-72 bg-white/4 border border-white/8 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:bg-white/6 transition-all"
          />
        </div>

        {/* Real-time Notice Bell */}
        <Link
          href={role === 'student' ? '/student/notice-board' : `/${role}/dashboard`}
          className="relative p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          title="Notice Board & Real-Time Alerts"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[9.5px] font-extrabold flex items-center justify-center leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </Link>

        {/* Role Badge */}
        <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
          <span>{roleLabels[role] || role}</span>
        </div>

        {/* User Avatar */}
        <Link
          href="/student/profile"
          title="View Profile"
          className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-indigo-500/20 hover:opacity-90 transition-opacity"
        >
          {(user?.name || 'S').charAt(0).toUpperCase()}
        </Link>

        {/* Quick Logout Button */}
        <button
          onClick={() => logout()}
          title="Sign out of CampusGrid"
          aria-label="Logout"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition-all text-xs font-medium cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
