'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/lib/api';
import { useScrollAnimation, useCountUp } from '@/lib/hooks';
import {
  Zap,
  Briefcase,
  FileText,
  Award,
  Mic,
  Bell,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  ChevronRight
} from 'lucide-react';

/* ─── Animated KPI Number ─── */
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const count = useCountUp(value, isVisible, 1500);

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

  return <span ref={ref} className="tabular-nums">{count}{suffix}</span>;
}

export default function StudentDashboardPage() {
  const { user } = useAuthStore();
  const [readinessScore, setReadinessScore] = useState(0);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [recentDrives, setRecentDrives] = useState<any[]>([]);

  useEffect(() => {
    // Fetch live dashboard metrics
    api.get('/dashboard')
      .then(res => {
        // Dashboard API returns data at root level (not res.data)
        if (res && res.kpis) {
          const kpiMap: Record<string, any> = {};
          (res.kpis as any[]).forEach(k => { kpiMap[k.label] = k.value; });
        }
        if (res && res.readiness) {
          const score = typeof res.readiness === 'object' ? res.readiness.score : res.readiness;
          if (typeof score === 'number') setReadinessScore(score);
        }
        if (res && typeof res.jobs === 'object' && Array.isArray(res.jobs)) {
          setActiveJobsCount(res.jobs.length);
        }
        if (res && typeof res.applications === 'object' && Array.isArray(res.applications)) {
          setApplicationsCount(res.applications.length);
        }
      })
      .catch(() => {});

    api.get('/drives')
      .then(res => {
        if (res && res.data && Array.isArray(res.data)) {
          setRecentDrives(res.data.slice(0, 3));
        } else if (Array.isArray(res)) {
          setRecentDrives((res as any[]).slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  const bannerRef = useScrollAnimation();
  const kpiRef = useScrollAnimation();
  const toolkitRef = useScrollAnimation();
  const drivesRef = useScrollAnimation();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div
        ref={bannerRef.ref}
        className={`relative overflow-hidden rounded-3xl glass-card p-6 sm:p-8 border-indigo-500/20 ${bannerRef.isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
      >
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-2">
              <Sparkles className="h-4 w-4" />
              <span>Campus Placement Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-200 to-violet-300">{user?.name || 'Student'}</span>!
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 max-w-xl leading-relaxed">
              Target Role: <strong className="text-[var(--text-primary)]">Software Engineer / Data Analyst</strong>. Your readiness score is in the top quartile. Practice interview rounds and review the notice board for new drive schedules.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/student/interview"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 group"
            >
              <Mic className="h-4 w-4" />
              <span>Practice AI Mock</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        ref={kpiRef.ref}
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${kpiRef.isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
      >
        {/* KPI 1: Readiness */}
        <div className="glass-card glass-panel-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[var(--text-tertiary)]">Readiness Score</span>
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--text-primary)]">
              <AnimatedNumber value={readinessScore} />
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +12% this week
            </span>
          </div>
          <div className="mt-3 w-full bg-[var(--surface-elevated)] h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${readinessScore}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Active Drives & Jobs */}
        <div className="glass-card glass-panel-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[var(--text-tertiary)]">Active Job Openings</span>
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/20">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--text-primary)]">
              <AnimatedNumber value={activeJobsCount} />
            </span>
            <span className="text-xs text-[var(--text-tertiary)] font-medium">Verified drives</span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-3 flex items-center gap-1">
            <span>TechNova, TCS, CloudScale</span>
          </p>
        </div>

        {/* KPI 3: In-Progress Applications */}
        <div className="glass-card glass-panel-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[var(--text-tertiary)]">My Applications</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--text-primary)]">
              <AnimatedNumber value={applicationsCount} />
            </span>
            <span className="text-xs font-bold text-amber-400">2 In Interview</span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-3 flex items-center gap-1">
            <Clock className="h-3 w-3 text-amber-400" />
            <span>Next round in 3 days</span>
          </p>
        </div>

        {/* KPI 4: Offer Pipeline */}
        <div className="glass-card glass-panel-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[var(--text-tertiary)]">Roadmap Progress</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--text-primary)]">
              <AnimatedNumber value={6} /> / <AnimatedNumber value={8} />
            </span>
            <span className="text-xs font-bold text-emerald-400">75% Done</span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-3 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>Mentor reviewed 2 days ago</span>
          </p>
        </div>
      </div>

      {/* Quick Launchpad & Active Rounds Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Quick Feature Launchpad */}
        <div
          ref={toolkitRef.ref}
          className={`lg:col-span-2 glass-card p-6 rounded-3xl space-y-4 ${toolkitRef.isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Placement Toolkit</h2>
              <p className="text-xs text-[var(--text-tertiary)]">10 AI-assisted preparation tools and opportunity streams</p>
            </div>
            <Link href="/student/jobs" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/student/notice-board"
              className="p-4 rounded-2xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-indigo-500/30 transition-all flex items-start gap-3.5 group"
            >
              <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                  Notice Board
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">LIVE</span>
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Real-time drive announcements, mentor actions & round updates.</div>
              </div>
            </Link>

            <Link
              href="/student/interview"
              className="p-4 rounded-2xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-indigo-500/30 transition-all flex items-start gap-3.5 group"
            >
              <div className="p-2.5 rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/20 group-hover:scale-105 transition-transform">
                <Mic className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                  AI Mock Interview Coach
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">STAR</span>
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Practice STAR behavioral & technical rounds with instant AI grading.</div>
              </div>
            </Link>

            <Link
              href="/student/resume"
              className="p-4 rounded-2xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-indigo-500/30 transition-all flex items-start gap-3.5 group"
            >
              <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/20 group-hover:scale-105 transition-transform">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-[var(--text-primary)]">Resume & JD Matcher</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Dense vector matching against real recruiter job descriptions (Text-only).</div>
              </div>
            </Link>

            <Link
              href="/student/applications"
              className="p-4 rounded-2xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-indigo-500/30 transition-all flex items-start gap-3.5 group"
            >
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-[var(--text-primary)]">Hiring Pipeline Tracker</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Track Aptitude, Technical R1/R2, and HR rounds with recruiter notes.</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Upcoming Placement Drives */}
        <div
          ref={drivesRef.ref}
          className={`glass-card p-6 rounded-3xl space-y-4 ${drivesRef.isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
          style={{ animationDelay: '150ms' }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span>Upcoming Drives</span>
            </h2>
            <Link href="/student/jobs" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[var(--text-primary)]">TechNova Solutions</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">Oct 24</span>
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Graduate Data Analyst (₹8.5 LPA)</div>
              <div className="text-[11px] text-[var(--text-tertiary)]">📍 Auditorium Hall A • CGPA &ge; 7.0</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[var(--text-primary)]">CloudScale Systems</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">Oct 29</span>
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Associate DevOps Engineer (₹9.5 LPA)</div>
              <div className="text-[11px] text-[var(--text-tertiary)]">📍 Online Assessment • CGPA &ge; 6.5</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[var(--text-primary)]">TCS Digital</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">Nov 05</span>
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Digital Systems Trainee (₹7.2 LPA)</div>
              <div className="text-[11px] text-[var(--text-tertiary)]">📍 Main Lab Complex • All Branches</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
