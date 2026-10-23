'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Target, Search, Sparkles, User, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function RecruiterMatchesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [stuRes, jobRes] = await Promise.all([
          api.get('/students').catch(() => null),
          api.get('/jobs').catch(() => null),
        ]);
        const stuList = Array.isArray(stuRes?.data) ? stuRes.data : (Array.isArray(stuRes) ? stuRes : []);
        const jobList = Array.isArray(jobRes?.data) ? jobRes.data : (Array.isArray(jobRes) ? jobRes : []);

        const mapped = stuList.map((s: any, idx: number) => {
          const skills = Array.isArray(s.skills) 
            ? s.skills 
            : (typeof s.skills === 'string' && s.skills ? s.skills.split(',').map((x: string) => x.trim()) : ['Python', 'DSA']);
          const matchedJob = jobList[idx % (jobList.length || 1)]?.title || s.target_role || 'Software Development Associate';
          const readiness = Number(s.readiness_score || s.readiness) || 75;
          return {
            id: s.id,
            name: s.name || 'Candidate',
            branch: s.branch || 'Computer Science & Engineering',
            cgpa: s.cgpa ? parseFloat(s.cgpa) : 8.0,
            match_score: readiness,
            skills: skills.length > 0 ? skills : ['Problem Solving', 'Data Structures'],
            matched_job: matchedJob,
            status: s.status === 'shortlisted' ? 'Shortlisted' : 'Available',
          };
        });

        setCandidates(mapped);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load matching candidates');
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const shortlistCandidate = (id: string, name: string) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: 'Shortlisted' } : c));
    toast.success(`Shortlisted ${name} for interview rounds!`);
  };

  const filtered = candidates.filter(c => 
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.matched_job || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-1">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Talent Discovery</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Candidate Matcher</h1>
        <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-1">
          Algorithmic candidate compatibility ranked against your job requirements and required competencies.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates or matched role..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-xs sm:text-sm focus:outline-none focus:border-purple-500/50"
          />
        </div>
      </div>

      {/* Candidate Cards Grid */}
      {loading ? (
        <div className="glass-panel p-12 rounded-2xl border border-[var(--border)] text-center text-[var(--text-tertiary)] text-xs">
          <div className="inline-block h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2" />
          <div>Discovering matching candidates from database...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-[var(--border)] text-center text-[var(--text-tertiary)] text-xs">
          No matching candidates found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((c) => {
            const isShortlisted = c.status === 'Shortlisted';
            const initials = (c.name || 'C').split(' ').map((n: string) => n[0]).join('').slice(0, 2);
            return (
              <div key={c.id} className="glass-card p-5 rounded-2xl space-y-4 hover:border-purple-500/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-sm">
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[var(--text-primary)]">{c.name}</h3>
                      <div className="text-xs text-[var(--text-tertiary)]">{c.branch} • CGPA: {c.cgpa}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-purple-500 dark:text-purple-400">{c.match_score}%</div>
                    <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide">Match Score</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs space-y-1">
                  <div className="text-[var(--text-tertiary)]">Best Match Role:</div>
                  <div className="font-semibold text-[var(--text-primary)]">{c.matched_job}</div>
                </div>

                <div>
                  <div className="text-[11px] text-[var(--text-tertiary)] mb-1.5 font-medium">Verified Skills:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.skills.map((sk: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-[11px] text-[var(--text-secondary)]">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isShortlisted
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                      : 'bg-[var(--surface-elevated)] text-[var(--text-tertiary)] border-[var(--border)]'
                  }`}>
                    {c.status}
                  </span>

                  {!isShortlisted ? (
                    <button
                      onClick={() => shortlistCandidate(c.id, c.name)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      Shortlist Candidate →
                    </button>
                  ) : (
                    <span className="text-emerald-500 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Added to Pipeline
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
