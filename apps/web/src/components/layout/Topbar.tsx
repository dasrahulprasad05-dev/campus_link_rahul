'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSidebarStore } from '@/stores/useSidebarStore';
import ThemeToggle from '@/components/ThemeToggle';
import { Menu, Bell, Search, ShieldCheck, LogOut, PanelLeftClose, PanelLeft } from 'lucide-react';

export default function Topbar({ onToggleMobile }: { onToggleMobile?: () => void }) {
  const pathname = usePathname();
  const { user, getRole, unreadCount, logout } = useAuthStore();
  const { collapsed, toggleSidebar } = useSidebarStore();
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
    <header className="topbar-container h-16 bg-[var(--topbar-bg)] backdrop-blur-md border-b border-[var(--border)] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Sidebar Toggle, Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-2">
        {/* Desktop Sidebar Collapse/Expand Toggle */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleMobile}
          className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-lg md:hidden hover:bg-[var(--surface-hover)] transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-[var(--text-tertiary)]">
          <Link href="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <Image
              src="/logo-icon.png"
              alt="CampusGrid"
              width={18}
              height={18}
              className="h-4.5 w-4.5 object-contain"
            />
            <span className="text-[var(--text-secondary)] font-semibold">CampusGrid</span>
          </Link>
          <span>/</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{breadcrumb}</span>
        </div>
      </div>

      {/* Right: Search, Theme Toggle, Notifications, Role Badge */}
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search drives, jobs, skills..."
            className="w-56 lg:w-72 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg pl-9 pr-4 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-indigo-500/50 focus:bg-[var(--surface-hover)] transition-all"
          />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Real-time Notice Bell */}
        <Link
          href={role === 'student' ? '/student/notice-board' : `/${role}/dashboard`}
          className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors"
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
        <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
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
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[var(--text-tertiary)] hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition-all text-xs font-medium cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
