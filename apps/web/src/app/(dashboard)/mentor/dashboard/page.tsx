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
  const [students, setStudents] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [stuRes, intRes] = await Promise.all([
          api.get('/students').catch(() => null),
          api.get('/students/all/interventions').catch(() => null),
        ]);
        const stuList = Array.isArray(stuRes?.data) ? stuRes.data : (Array.isArray(stuRes) ? stuRes : []);
        const intList = Array.isArray(intRes?.data) ? intRes.data : (Array.isArray(intRes) ? intRes : []);
        setStudents(stuList);
        setInterventions(intList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalMentees = students.length;
  const avgScore = totalMentees > 0
    ? `${Math.round(students.reduce((acc, s) => acc + (Number(s.readiness_score || s.readiness) || 0), 0) / totalMentees)}%`
    : '0%';
  const activeInterventions = interventions.filter(i => i.status !== 'completed' && i.status !== 'Resolved').length;
  const readyCount = students.filter(s => (Number(s.readiness_score || s.readiness) || 0) >= 75).length;

  const kpis = [
    { label: 'Assigned Mentees', value: totalMentees, delta: `${totalMentees} active profiles` },
    { label: 'Average Mentee Score', value: avgScore, delta: 'Calculated across mentees' },
    { label: 'Active Interventions', value: activeInterventions, delta: `${activeInterventions} in review` },
    { label: 'Drive-Ready Students', value: readyCount, delta: `${readyCount} meeting benchmark` },
  ];

  const mentees = students.slice(0, 5).map(s => {
    const score = Number(s.readiness_score || s.readiness) || 70;
    return {
      name: s.name || 'Mentee',
      role: s.target_role || 'Software Engineering',
      readiness: score,
      status: score >= 80 ? 'Excellent' : score >= 60 ? 'On Track' : 'At Risk',
      branch: s.branch || 'CSE',
    };
  });

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
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
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
            <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
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
            <Link href="/mentor/students" className="text-xs text-amber-600 dark:text-amber-400 hover:underline">
              View All {totalMentees} Mentees →
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-[var(--text-tertiary)] text-xs">
                <div className="inline-block h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-1.5" />
                <div>Loading mentees from database...</div>
              </div>
            ) : mentees.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-tertiary)] text-xs">
                No mentees currently assigned.
              </div>
            ) : (
              mentees.map((m, idx) => {
                const isRisk = m.status === 'At Risk';
                const initials = (m.name || 'M').split(' ').map((n: string) => n[0]).join('').slice(0, 2);
                return (
                  <div key={idx} className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] flex items-center justify-center font-bold text-xs">
                        {initials}
                      </div>
                    <div>
                      <div className="font-semibold text-sm text-[var(--text-primary)]">{m.name}</div>
                      <div className="text-xs text-[var(--text-tertiary)]">{m.branch} • Target: {m.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-[var(--text-primary)]">{m.readiness}/100</div>
                      <span className={`text-[10px] font-semibold ${isRisk ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
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
            }))}
          </div>
        </div>

        {/* Advisory Tips */}
        <div
          ref={playbookRef.ref}
          className={`glass-card p-6 rounded-2xl space-y-4 ${playbookRef.isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
          style={{ animationDelay: '120ms' }}
        >
          <div className="flex items-center gap-2 font-bold text-base text-[var(--text-primary)]">
            <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>Faculty Playbook</span>
          </div>

          <div className="space-y-3 text-xs text-[var(--text-secondary)]">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
              <strong className="text-amber-700 dark:text-amber-300">Proactive Milestone Push:</strong>
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
