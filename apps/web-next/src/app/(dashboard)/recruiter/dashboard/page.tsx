'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Briefcase, Users, Target, ArrowRight, BarChart3, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

export default function RecruiterDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/dashboard/recruiter');
        setData(res?.data || res || {});
      } catch {
        setData({
          kpis: [
            { label: 'Active Job Postings', value: 3, delta: '+1 this week' },
            { label: 'Total Applicants', value: 48, delta: '14 new submissions' },
            { label: 'Shortlisted for Rounds', value: 16, delta: 'Round 1 & 2 in progress' },
            { label: 'Offers Extended', value: 4, delta: '₹14.5 LPA avg' },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const kpis = data?.kpis || [
    { label: 'Active Job Postings', value: 3, delta: '+1 this week' },
    { label: 'Total Applicants', value: 48, delta: '14 new submissions' },
    { label: 'Shortlisted for Rounds', value: 16, delta: 'Round 1 & 2 in progress' },
    { label: 'Offers Extended', value: 4, delta: '₹14.5 LPA avg' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-1">
            <Briefcase className="h-3.5 w-3.5" />
            <span>Recruiter Operations Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Hiring Overview</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review candidate applications, manage multi-round technical interviews, and issue campus offers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/recruiter/pipeline"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all flex items-center gap-1.5"
          >
            <BarChart3 className="h-3.5 w-3.5" /> Multi-Round Pipeline
          </Link>
        </div>
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

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/recruiter/jobs"
          className="glass-panel p-5 rounded-2xl border border-white/8 hover:border-purple-500/30 transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <Briefcase className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-white group-hover:text-purple-300 transition-colors">Manage Postings</h3>
            <p className="text-xs text-slate-400 mt-1">Create new job vacancies, update skill requirements, and close filled roles.</p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-purple-400">
            <span>View Jobs</span> <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        <Link
          href="/recruiter/pipeline"
          className="glass-panel p-5 rounded-2xl border border-white/8 hover:border-purple-500/30 transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors">Candidate Pipeline</h3>
            <p className="text-xs text-slate-400 mt-1">Track candidates across Aptitude, Tech R1, Tech R2, HR, and Offer stages.</p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-400">
            <span>Open Pipeline</span> <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        <Link
          href="/recruiter/matches"
          className="glass-panel p-5 rounded-2xl border border-white/8 hover:border-purple-500/30 transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors">AI Match Engine</h3>
            <p className="text-xs text-slate-400 mt-1">Discover top-ranked student talent matched automatically to your job specs.</p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-400">
            <span>View Matches</span> <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>
    </div>
  );
}
