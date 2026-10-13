'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useScrollAnimation, useCountUp, parseNumericValue } from '@/lib/hooks';
import { Users, ShieldCheck, Zap, ArrowRight, BarChart3, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

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

export default function MentorDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/dashboard/mentor');
        setData(res?.data || res || {});
      } catch {
        setData({
          kpis: [
            { label: 'Assigned Mentees', value: 18, delta: 'All active' },
            { label: 'Average Mentee Score', value: '76%', delta: '+4% this month' },
            { label: 'Active Interventions', value: 3, delta: 'Requires review' },
            { label: 'Completed Milestones', value: 42, delta: '12 completed this week' },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const kpis = data?.kpis || [
    { label: 'Assigned Mentees', value: 18, delta: 'All active' },
    { label: 'Average Mentee Score', value: '76%', delta: '+4% this month' },
    { label: 'Active Interventions', value: 3, delta: 'Requires review' },
    { label: 'Completed Milestones', value: 42, delta: '12 completed this week' },
  ];

  const mentees = [
    { name: 'Ananya Sharma', role: 'Data Analyst & ML', readiness: 78, status: 'On Track', branch: 'CSE' },
    { name: 'Rohan Verma', role: 'Embedded Systems', readiness: 54, status: 'At Risk', branch: 'ECE' },
    { name: 'Priya Nair', role: 'Cloud Engineer', readiness: 88, status: 'Excellent', branch: 'IT' },
    { name: 'Amit Kumar', role: 'Full Stack Developer', readiness: 48, status: 'At Risk', branch: 'ME' },
  ];

  const headerRef = useScrollAnimation();
  const kpiRef = useScrollAnimation();
  const menteesRef = useScrollAnimation();
  const playbookRef = useScrollAnimation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        ref={headerRef.ref}
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${headerRef.isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Faculty Mentorship Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Mentorship Command Center</h1>
          <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-1">
            Monitor assigned mentees, track roadmap milestones, and deploy recovery interventions.
          </p>
        </div>

        <Link
          href="/mentor/students"
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Zap className="h-3.5 w-3.5" /> Manage Mentees
        </Link>
      </div>

      {/* KPI Cards */}
      <div
        ref={kpiRef.ref}
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${kpiRef.isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
      >
        {kpis.map((k: any, i: number) => (
          <div key={i} className="glass-card glass-panel-hover p-5 rounded-2xl" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="text-xs font-semibold text-[var(--text-tertiary)]">{k.label}</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mt-1 tracking-tight">
              <AnimatedKPI value={k.value} />
            </div>
            <div className="text-[11px] font-medium text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{k.delta}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Mentees & Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          ref={menteesRef.ref}
          className={`lg:col-span-2 glass-card p-6 rounded-2xl space-y-4 ${menteesRef.isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text-primary)]">Assigned Mentees</h2>
            <Link href="/mentor/students" className="text-xs text-amber-400 hover:text-amber-300">
              View All 18 Mentees →
            </Link>
          </div>

          <div className="space-y-3">
            {mentees.map((m, idx) => {
              const isRisk = m.status === 'At Risk';
              return (
                <div key={idx} className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] flex items-center justify-center font-bold text-xs">
                      {m.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[var(--text-primary)]">{m.name}</div>
                      <div className="text-xs text-[var(--text-tertiary)]">{m.branch} • Target: {m.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-[var(--text-primary)]">{m.readiness}/100</div>
                      <span className={`text-[10px] font-semibold ${isRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {m.status}
                      </span>
                    </div>

                    <Link
                      href="/mentor/students"
                      className="px-2.5 py-1 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] text-xs font-medium transition-colors border border-[var(--border)]"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Advisory Tips */}
        <div
          ref={playbookRef.ref}
          className={`glass-card p-6 rounded-2xl space-y-4 ${playbookRef.isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
          style={{ animationDelay: '120ms' }}
        >
          <div className="flex items-center gap-2 font-bold text-base text-[var(--text-primary)]">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <span>Faculty Playbook</span>
          </div>

          <div className="space-y-3 text-xs text-[var(--text-secondary)]">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
              <strong className="text-amber-300">Proactive Milestone Push:</strong>
              <p className="leading-relaxed text-[var(--text-secondary)]">
                Students who complete at least 2 mock interview sessions before day 1 campus drives show a 3.4x higher selection rate.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-1">
              <strong className="text-[var(--text-primary)]">Intervention Feedback:</strong>
              <p className="leading-relaxed text-[var(--text-tertiary)]">
                Adding structured notes to at-risk students triggers an instant live notice on their placement dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
