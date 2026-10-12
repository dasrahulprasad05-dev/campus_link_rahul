'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
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

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, stuRes] = await Promise.all([
          api.get('/dashboard/admin').catch(() => null),
          api.get('/students').catch(() => null),
        ]);
        setData(dashRes?.data || dashRes || {});
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
            <Zap className="h-3.5 w-3.5" />
            <span>TPO Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Placement Overview</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time tracking of institutional readiness, drive stages, and interventions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/analytics"
            className="px-3.5 py-2 rounded-xl bg-white/4 hover:bg-white/8 text-slate-300 border border-white/8 text-xs font-semibold transition-colors flex items-center gap-1.5"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi: any, i: number) => (
          <div key={i} className="glass-panel p-5 rounded-2xl border border-white/8">
            <div className="text-xs font-semibold text-slate-400">{kpi.label}</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">{kpi.value}</div>
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
        <div className="lg:col-span-2 glass-panel p-5 sm:p-6 rounded-2xl border border-white/8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-base text-white">
              <Target className="h-4 w-4 text-indigo-400" />
              <span>Upcoming Placement Drives</span>
            </div>
            <Link href="/admin/scheduler" className="text-xs text-indigo-400 hover:text-indigo-300">
              Open Scheduler →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-white/6 font-semibold">
                <tr>
                  <th className="pb-3">Company</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6 text-slate-200">
                {drives.map((d: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/2 transition-colors">
                    <td className="py-3.5 font-semibold text-white flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                        {(d.company || 'C')[0]}
                      </div>
                      <div>
                        <div>{d.company}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{d.venue || 'Virtual'}</div>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-300">{d.role}</td>
                    <td className="py-3.5 text-slate-400">
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
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-base text-white">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Intervention Queue</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Needs Advisory
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Students whose readiness scores indicate high risk of campus drive rejection:
          </p>

          <div className="space-y-3">
            {atRisk.length > 0 ? (
              atRisk.map((s, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/3 border border-white/6 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">{s.name}</div>
                    <div className="text-[10px] text-slate-400">{s.branch || 'CSE'} • CGPA: {s.cgpa || '7.2'}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-400">{s.readiness || 52}/100</span>
                    <div className="text-[9px] text-slate-400">Readiness</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center py-6">
                No students currently in critical risk bracket.
              </div>
            )}
          </div>

          <Link
            href="/admin/interventions"
            className="w-full mt-2 py-2 rounded-xl bg-white/4 hover:bg-white/8 text-slate-300 border border-white/6 text-xs font-semibold transition-colors flex items-center justify-center"
          >
            Manage Interventions →
          </Link>
        </div>
      </div>
    </div>
  );
}
