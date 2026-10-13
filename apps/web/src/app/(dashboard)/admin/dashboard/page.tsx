'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useScrollAnimation, useCountUp, parseNumericValue } from '@/lib/hooks';
import {
  Users,
  Building,
  Target,
  Award,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  BarChart3,
  TrendingUp,
  Sparkles,
  Zap
} from 'lucide-react';

/* ─── Animated KPI Number ─── */
function AnimatedKPI({ value }: { value: string | number }) {
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

  const strVal = String(value);
  const { num, suffix } = parseNumericValue(strVal);
  const count = useCountUp(num, isVisible, 1500);

  return <span ref={ref} className="tabular-nums">{count}{suffix}</span>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, stuRes] = await Promise.all([
          api.get('/dashboard').catch(() => null),
          api.get('/students').catch(() => null),
        ]);
        // Dashboard API returns data at root level for admin role
        setData(dashRes || {});
        const stuList = Array.isArray(stuRes?.data) ? stuRes.data : (Array.isArray(stuRes) ? stuRes : []);
        setStudents(stuList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const kpis = data?.kpis || [
    { label: 'Total Students', value: students.length || 842, delta: '+12% vs last year', color: 'indigo' },
    { label: 'Average Readiness', value: '78%', delta: '+5 pts this semester', color: 'emerald' },
    { label: 'Active Placement Drives', value: data?.drives?.length || 14, delta: '3 closing this week', color: 'violet' },
    { label: 'Verified Offers', value: '126', delta: 'Highest: ₹28.5 LPA', color: 'amber' },
  ];

  const atRisk = students.filter(s => (s.readiness || 0) < 60).slice(0, 5);
  const drives = data?.drives || [
    { company: 'Google', role: 'Software Engineer', date: '2026-10-18', status: 'Registration Open', venue: 'Virtual' },
    { company: 'Microsoft', role: 'Support Engineer', date: '2026-10-22', status: 'Upcoming', venue: 'Campus Aud-1' },
    { company: 'TechNova', role: 'Data Analyst', date: '2026-10-25', status: 'Shortlisting', venue: 'Virtual' },
  ];

  const headerRef = useScrollAnimation();
  const kpiRef = useScrollAnimation();
  const tableRef = useScrollAnimation();
  const riskRef = useScrollAnimation();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        ref={headerRef.ref}
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${headerRef.isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
            <Zap className="h-3.5 w-3.5" />
            <span>TPO Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Placement Overview</h1>
          <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-1">
            Real-time tracking of institutional readiness, drive stages, and interventions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/analytics"
            className="px-3.5 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)] text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <BarChart3 className="h-3.5 w-3.5" /> Full Analytics
          </Link>
          <Link
            href="/admin/drives"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            + Create Drive
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        ref={kpiRef.ref}
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${kpiRef.isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
      >
        {kpis.map((kpi: any, i: number) => (
          <div key={i} className="glass-card glass-panel-hover p-5 rounded-2xl" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="text-xs font-semibold text-[var(--text-tertiary)]">{kpi.label}</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mt-1 tracking-tight">
              <AnimatedKPI value={kpi.value} />
            </div>
            <div className="text-[11px] font-medium text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{kpi.delta}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drives Schedule Table */}
        <div
          ref={tableRef.ref}
          className={`lg:col-span-2 glass-card p-5 sm:p-6 rounded-2xl space-y-4 ${tableRef.isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-base text-[var(--text-primary)]">
              <Target className="h-4 w-4 text-indigo-400" />
              <span>Upcoming Placement Drives</span>
            </div>
            <Link href="/admin/scheduler" className="text-xs text-indigo-400 hover:text-indigo-300">
              Open Scheduler →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[var(--text-tertiary)] border-b border-[var(--border)] font-semibold">
                <tr>
                  <th className="pb-3">Company</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[var(--text-secondary)]">
                {drives.map((d: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[var(--table-hover)] transition-colors">
                    <td className="py-3.5 font-semibold text-[var(--text-primary)] flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                        {(d.company || 'C')[0]}
                      </div>
                      <div>
                        <div>{d.company}</div>
                        <div className="text-[10px] text-[var(--text-tertiary)] font-normal">{d.venue || 'Virtual'}</div>
                      </div>
                    </td>
                    <td className="py-3.5 text-[var(--text-secondary)]">{d.role}</td>
                    <td className="py-3.5 text-[var(--text-tertiary)]">
                      {d.date ? new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                        {d.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* At-Risk Queue & Intervention Advisory */}
        <div
          ref={riskRef.ref}
          className={`glass-card p-5 sm:p-6 rounded-2xl space-y-4 ${riskRef.isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
          style={{ animationDelay: '120ms' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-base text-[var(--text-primary)]">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Intervention Queue</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Needs Advisory
            </span>
          </div>

          <p className="text-xs text-[var(--text-tertiary)]">
            Students whose readiness scores indicate high risk of campus drive rejection:
          </p>

          <div className="space-y-3">
            {atRisk.length > 0 ? (
              atRisk.map((s, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">{s.name}</div>
                    <div className="text-[10px] text-[var(--text-tertiary)]">{s.branch || 'CSE'} • CGPA: {s.cgpa || '7.2'}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-400">{s.readiness || 52}/100</span>
                    <div className="text-[9px] text-[var(--text-tertiary)]">Readiness</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-[var(--text-tertiary)] text-center py-6">
                No students currently in critical risk bracket.
              </div>
            )}
          </div>

          <Link
            href="/admin/interventions"
            className="w-full mt-2 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)] text-xs font-semibold transition-colors flex items-center justify-center"
          >
            Manage Interventions →
          </Link>
        </div>
      </div>
    </div>
  );
}
