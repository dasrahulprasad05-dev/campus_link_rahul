'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Users, ShieldCheck, Zap, ArrowRight, BarChart3, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Faculty Mentorship Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Mentorship Command Center</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k: any, i: number) => (
          <div key={i} className="glass-panel p-5 rounded-2xl border border-white/8">
            <div className="text-xs font-semibold text-slate-400">{k.label}</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">{k.value}</div>
            <div className="text-[11px] font-medium text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{k.delta}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Mentees & Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Assigned Mentees</h2>
            <Link href="/mentor/students" className="text-xs text-amber-400 hover:text-amber-300">
              View All 18 Mentees →
            </Link>
          </div>

          <div className="space-y-3">
            {mentees.map((m, idx) => {
              const isRisk = m.status === 'At Risk';
              return (
                <div key={idx} className="p-4 rounded-xl bg-white/3 border border-white/6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center font-bold text-xs">
                      {m.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-white">{m.name}</div>
                      <div className="text-xs text-slate-400">{m.branch} • Target: {m.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-white">{m.readiness}/100</div>
                      <span className={`text-[10px] font-semibold ${isRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {m.status}
                      </span>
                    </div>

                    <Link
                      href="/mentor/students"
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
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
        <div className="glass-panel p-6 rounded-2xl border border-white/8 space-y-4">
          <div className="flex items-center gap-2 font-bold text-base text-white">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <span>Faculty Playbook</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
              <strong className="text-amber-300">Proactive Milestone Push:</strong>
              <p className="leading-relaxed text-slate-300">
                Students who complete at least 2 mock interview sessions before day 1 campus drives show a 3.4x higher selection rate.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/3 border border-white/6 space-y-1">
              <strong className="text-white">Intervention Feedback:</strong>
              <p className="leading-relaxed text-slate-400">
                Adding structured notes to at-risk students triggers an instant live notice on their placement dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
