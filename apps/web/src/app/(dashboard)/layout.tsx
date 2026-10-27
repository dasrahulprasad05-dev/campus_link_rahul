'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MobileNav from '@/components/layout/MobileNav';
import { useAuthStore } from '@/stores/useAuthStore';
import WhatsAppFAB from '@/components/WhatsAppFAB';
import { useThemeStore } from '@/stores/useThemeStore';
import { useSSE } from '@/lib/useSSE';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();
  const { notifications, isConnected } = useSSE();
  const prevCountRef = useRef(0);

  // Show toast for new real-time notifications
  useEffect(() => {
    if (notifications.length > prevCountRef.current && prevCountRef.current > 0) {
      const latest = notifications[0];
      if (latest?.title && typeof window !== 'undefined') {
        // Use native Notification API if permitted, otherwise console
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(latest.title, { body: latest.message || '' });
        }
      }
    }
    prevCountRef.current = notifications.length;
  }, [notifications]);

  useEffect(() => {
    // Wait one tick for Zustand to hydrate from localStorage before checking auth
    setHydrated(true);
  }, []);

  // Sync theme class & data attribute
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!hydrated) return;
    // Verify client session token after hydration completes
    const storedToken = typeof window !== 'undefined'
      ? (localStorage.getItem('campusgrid_token') || localStorage.getItem('campuslink_token'))
      : null;
    if (!storedToken && !token && !isAuthenticated()) {
      router.replace('/login');
    }
  }, [hydrated, token, isAuthenticated, router]);

  return (
    <div className="dashboard-layout flex min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased overflow-x-hidden">
      {/* Desktop Sidebar — sticky so it stays visible on scroll */}
      <div className="hidden md:flex h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay & Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative z-50 w-72 max-w-[80vw] h-full shadow-2xl">
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        <Topbar onToggleMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* WhatsApp Floating Action Button (Students only) */}
      <WhatsAppFAB />

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
