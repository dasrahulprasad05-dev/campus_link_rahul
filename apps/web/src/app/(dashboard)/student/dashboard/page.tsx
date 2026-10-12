'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/lib/api';
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

export default function StudentDashboardPage() {
  const { user } = useAuthStore();
  const [readinessScore, setReadinessScore] = useState(78);
  const [activeJobsCount, setActiveJobsCount] = useState(8);
  const [applicationsCount, setApplicationsCount] = useState(4);
  const [recentDrives, setRecentDrives] = useState<any[]>([]);

  useEffect(() => {
    // Fetch live dashboard metrics
    api.get('/dashboard')
      .then(res => {
        if (res && res.data) {
          if (res.data.readiness) setReadinessScore(res.data.readiness);
          if (res.data.active_jobs) setActiveJobsCount(res.data.active_jobs);
          if (res.data.applications) setApplicationsCount(res.data.applications);
        }
      })
      .catch(() => {});

    api.get('/drives')
      .then(res => {
        if (res && res.data && Array.isArray(res.data)) {
          setRecentDrives(res.data.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-indigo-900/40 border border-indigo-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-2">
              <Sparkles className="h-4 w-4" />
              <span>Campus Placement Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-200 to-violet-300">{user?.name || 'Student'}</span>!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
              Target Role: <strong className="text-white">Software Engineer / Data Analyst</strong>. Your readiness score is in the top quartile. Practice interview rounds and review the notice board for new drive schedules.
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Readiness */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-white/8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Readiness Score</span>
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{readinessScore}</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +12% this week
            </span>
          </div>
          <div className="mt-3 w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${readinessScore}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Active Drives & Jobs */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-white/8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Active Job Openings</span>
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/20">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{activeJobsCount}</span>
            <span className="text-xs text-slate-400 font-medium">Verified drives</span>
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <span>TechNova, TCS, CloudScale</span>
          </p>
        </div>

        {/* KPI 3: In-Progress Applications */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-white/8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">My Applications</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{applicationsCount}</span>
            <span className="text-xs font-bold text-amber-400">2 In Interview</span>
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <Clock className="h-3 w-3 text-amber-400" />
            <span>Next round in 3 days</span>
          </p>
        </div>

        {/* KPI 4: Offer Pipeline */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-white/8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Roadmap Progress</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">6 / 8</span>
            <span className="text-xs font-bold text-emerald-400">75% Done</span>
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>Mentor reviewed 2 days ago</span>
          </p>
        </div>
      </div>

      {/* Quick Launchpad & Active Rounds Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Quick Feature Launchpad */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/8 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-white">Placement Toolkit</h2>
              <p className="text-xs text-slate-400">10 AI-assisted preparation tools and opportunity streams</p>
            </div>
            <Link href="/student/jobs" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/student/notice-board"
              className="p-4 rounded-2xl bg-white/3 hover:bg-white/6 border border-white/6 hover:border-indigo-500/30 transition-all flex items-start gap-3.5 group"
            >
              <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                  Notice Board
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">LIVE</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Real-time drive announcements, mentor actions & round updates.</div>
              </div>
            </Link>

            <Link
              href="/student/interview"
              className="p-4 rounded-2xl bg-white/3 hover:bg-white/6 border border-white/6 hover:border-indigo-500/30 transition-all flex items-start gap-3.5 group"
            >
              <div className="p-2.5 rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/20 group-hover:scale-105 transition-transform">
                <Mic className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                  AI Mock Interview Coach
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">STAR</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Practice STAR behavioral & technical rounds with instant AI grading.</div>
              </div>
            </Link>

            <Link
              href="/student/resume"
              className="p-4 rounded-2xl bg-white/3 hover:bg-white/6 border border-white/6 hover:border-indigo-500/30 transition-all flex items-start gap-3.5 group"
            >
              <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/20 group-hover:scale-105 transition-transform">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-white">Resume & JD Matcher</div>
                <div className="text-xs text-slate-400 mt-1">Dense vector matching against real recruiter job descriptions (Text-only).</div>
              </div>
            </Link>

            <Link
              href="/student/applications"
              className="p-4 rounded-2xl bg-white/3 hover:bg-white/6 border border-white/6 hover:border-indigo-500/30 transition-all flex items-start gap-3.5 group"
            >
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-white">Hiring Pipeline Tracker</div>
                <div className="text-xs text-slate-400 mt-1">Track Aptitude, Technical R1/R2, and HR rounds with recruiter notes.</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Upcoming Placement Drives */}
        <div className="glass-panel p-6 rounded-3xl border border-white/8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span>Upcoming Drives</span>
            </h2>
            <Link href="/student/jobs" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-white/3 border border-white/6 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">TechNova Solutions</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">Oct 24</span>
              </div>
              <div className="text-xs text-slate-300">Graduate Data Analyst (₹8.5 LPA)</div>
              <div className="text-[11px] text-slate-400">📍 Auditorium Hall A • CGPA &ge; 7.0</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/3 border border-white/6 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">CloudScale Systems</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">Oct 29</span>
              </div>
              <div className="text-xs text-slate-300">Associate DevOps Engineer (₹9.5 LPA)</div>
              <div className="text-[11px] text-slate-400">📍 Online Assessment • CGPA &ge; 6.5</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/3 border border-white/6 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">TCS Digital</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">Nov 05</span>
              </div>
              <div className="text-xs text-slate-300">Digital Systems Trainee (₹7.2 LPA)</div>
              <div className="text-[11px] text-slate-400">📍 Main Lab Complex • All Branches</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
