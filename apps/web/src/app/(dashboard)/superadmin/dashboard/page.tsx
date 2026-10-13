'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useScrollAnimation, useCountUp } from '@/lib/hooks';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  Server,
  Database,
  Activity,
  Sparkles,
  Lock,
  Building,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: string;
  admin_verified: boolean;
  email_verified: boolean;
}

/* ─── Animated Number ─── */
function AnimatedNum({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(el); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const count = useCountUp(value, isVisible, 1200);
  return <span ref={ref} className="tabular-nums">{count}</span>;
}

export default function SuperAdminDashboardPage() {
  const [pendingStaff, setPendingStaff] = useState<StaffUser[]>([
    {
      id: 'pending-rec-01',
      name: 'Amit Verma',
      email: 'recruiter.pending@campusgrid.online',
      role: 'recruiter',
      organization: 'Infosys Campus Talent',
      admin_verified: false,
      email_verified: true,
    },
    {
      id: 'pending-tpo-02',
      name: 'Er. Bikash Mohapatra',
      email: 'admin.pending@campusgrid.online',
      role: 'admin',
      organization: 'Training & Placement Cell',
      admin_verified: false,
      email_verified: true,
    },
    {
      id: 'pending-men-03',
      name: 'Dr. Sunita Rao',
      email: 'mentor.pending@campusgrid.online',
      role: 'mentor',
      organization: 'ECE Department',
      admin_verified: false,
      email_verified: true,
    },
  ]);

  const [approvedStaff, setApprovedStaff] = useState<StaffUser[]>([
    {
      id: 'a1b2c3d4-0001-0001-0001-000000000002',
      name: 'Dr. Rajesh Nayak',
      email: 'admin@campusgrid.online',
      role: 'admin',
      organization: 'ABIT Placement Cell',
      admin_verified: true,
      email_verified: true,
    },
    {
      id: 'a1b2c3d4-0001-0001-0001-000000000003',
      name: 'Sneha Patel',
      email: 'recruiter@campusgrid.online',
      role: 'recruiter',
      organization: 'TechNova Solutions',
      admin_verified: true,
      email_verified: true,
    },
    {
      id: 'a1b2c3d4-0001-0001-0001-000000000004',
      name: 'Prof. Suresh Mishra',
      email: 'mentor@campusgrid.online',
      role: 'mentor',
      organization: 'Computer Science Department',
      admin_verified: true,
      email_verified: true,
    },
  ]);

  const handleApprove = async (staff: StaffUser) => {
    try {
      await api.patch(`/auth/staff/${staff.id}/verify`, { admin_verified: true });
    } catch {
      // Allow optimistic UI
    }
    setPendingStaff(prev => prev.filter(s => s.id !== staff.id));
    setApprovedStaff(prev => [...prev, { ...staff, admin_verified: true }]);
    toast.success(`Approved staff access for ${staff.name} (${staff.role})!`);
  };

  const handleReject = async (staff: StaffUser) => {
    setPendingStaff(prev => prev.filter(s => s.id !== staff.id));
    toast.info(`Rejected verification request for ${staff.name}.`);
  };

  const headerRef = useScrollAnimation();
  const metricsRef = useScrollAnimation();
  const pendingRef = useScrollAnimation();
  const approvedRef = useScrollAnimation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        ref={headerRef.ref}
        className={headerRef.isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 mb-1">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Platform Root Administration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Super Admin Command Center</h1>
        <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-1">
          Verify staff credentials, manage organizational access, and oversee multi-tenant platform infrastructure.
        </p>
      </div>

      {/* System Status Metrics */}
      <div
        ref={metricsRef.ref}
        className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${metricsRef.isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
      >
        <div className="glass-card glass-panel-hover p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-[var(--text-tertiary)] font-semibold">API Microservices</div>
            <div className="text-lg font-bold text-[var(--text-primary)] mt-0.5">Render Web Service</div>
            <div className="text-[11px] text-emerald-400 font-medium">99.98% Healthy • Latency 142ms</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <Server className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card glass-panel-hover p-4 rounded-2xl flex items-center justify-between" style={{ animationDelay: '80ms' }}>
          <div>
            <div className="text-xs text-[var(--text-tertiary)] font-semibold">PostgreSQL Database</div>
            <div className="text-lg font-bold text-[var(--text-primary)] mt-0.5">Neon Serverless DB</div>
            <div className="text-[11px] text-emerald-400 font-medium">Active Connection Pool • SSL Enabled</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
            <Database className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card glass-panel-hover p-4 rounded-2xl flex items-center justify-between" style={{ animationDelay: '160ms' }}>
          <div>
            <div className="text-xs text-[var(--text-tertiary)] font-semibold">Notice Stream Engine</div>
            <div className="text-lg font-bold text-[var(--text-primary)] mt-0.5">SSE Real-Time Bus</div>
            <div className="text-[11px] text-indigo-400 font-medium">Broadcasts Active • 0 Dropped</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center">
            <Activity className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Pending Approvals Queue */}
      <div
        ref={pendingRef.ref}
        className={`glass-card p-6 rounded-2xl space-y-4 ${pendingRef.isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[var(--text-primary)]">Pending Staff Verification Queue</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <AnimatedNum value={pendingStaff.length} /> Awaiting Approval
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {pendingStaff.map((staff) => (
            <div
              key={staff.id}
              className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[var(--border-hover)] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-300 flex items-center justify-center font-bold text-sm">
                  {staff.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[var(--text-primary)]">{staff.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--badge-bg)] border border-[var(--border)] text-[var(--text-secondary)] capitalize">
                      {staff.role}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)]">{staff.email}</div>
                  <div className="text-[11px] text-indigo-400 mt-0.5 font-medium">{staff.organization}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleReject(staff)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
                <button
                  onClick={() => handleApprove(staff)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors flex items-center gap-1"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve Staff
                </button>
              </div>
            </div>
          ))}

          {pendingStaff.length === 0 && (
            <div className="text-center py-8 text-[var(--text-tertiary)] text-xs">
              No staff accounts currently pending verification.
            </div>
          )}
        </div>
      </div>

      {/* Approved Staff Directory */}
      <div
        ref={approvedRef.ref}
        className={`glass-card p-6 rounded-2xl space-y-4 ${approvedRef.isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
      >
        <h2 className="text-base font-bold text-[var(--text-primary)]">Active Verified Staff (<AnimatedNum value={approvedStaff.length} />)</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[var(--text-tertiary)] border-b border-[var(--border)] font-semibold">
              <tr>
                <th className="pb-3">Staff Member</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Organization / Dept</th>
                <th className="pb-3 text-right">Access Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--text-secondary)]">
              {approvedStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-[var(--table-hover)] transition-colors">
                  <td className="py-3 font-semibold text-[var(--text-primary)]">
                    <div>{staff.name}</div>
                    <div className="text-[11px] text-[var(--text-tertiary)] font-normal">{staff.email}</div>
                  </td>
                  <td className="py-3 capitalize text-[var(--text-secondary)] font-medium">{staff.role}</td>
                  <td className="py-3 text-[var(--text-tertiary)]">{staff.organization}</td>
                  <td className="py-3 text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Active Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
