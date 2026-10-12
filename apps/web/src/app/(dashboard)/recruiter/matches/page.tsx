'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Target, Search, Sparkles, User, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function RecruiterMatchesPage() {
  const [candidates, setCandidates] = useState<any[]>([
    {
      id: '1',
      name: 'Ananya Sharma',
      branch: 'Computer Science & Engineering',
      cgpa: 8.42,
      match_score: 94,
      skills: ['Python', 'SQL', 'React', 'DSA'],
      matched_job: 'Data Analyst & ML Associate',
      status: 'Shortlisted',
    },
    {
      id: '2',
      name: 'Sneha Rao',
      branch: 'Computer Science & Engineering',
      cgpa: 9.10,
      match_score: 91,
      skills: ['DSA', 'React', 'Node.js', 'Docker'],
      matched_job: 'Full Stack Software Engineer',
      status: 'Available',
    },
    {
      id: '3',
      name: 'Priya Nair',
      branch: 'Information Technology',
      cgpa: 8.90,
      match_score: 87,
      skills: ['Java', 'Spring', 'AWS', 'SQL'],
      matched_job: 'Cloud Infrastructure Associate',
      status: 'Available',
    },
    {
      id: '4',
      name: 'Rohan Verma',
      branch: 'Electronics & Communication',
      cgpa: 7.15,
      match_score: 72,
      skills: ['C++', 'Embedded', 'Python'],
      matched_job: 'Software Development Associate',
      status: 'Available',
    },
  ]);

  const [search, setSearch] = useState('');

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
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Candidate Matcher</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Algorithmic candidate compatibility ranked against your job requirements and required competencies.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates or matched role..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0b0f19] border border-white/8 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500/50"
          />
        </div>
      </div>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((c) => {
          const isShortlisted = c.status === 'Shortlisted';
          return (
            <div key={c.id} className="glass-panel p-5 rounded-2xl border border-white/8 space-y-4 hover:border-purple-500/30 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-300 flex items-center justify-center font-bold text-sm">
                    {c.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{c.name}</h3>
                    <div className="text-xs text-slate-400">{c.branch} • CGPA: {c.cgpa}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-purple-400">{c.match_score}%</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">Match Score</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/3 border border-white/6 text-xs space-y-1">
                <div className="text-slate-400">Best Match Role:</div>
                <div className="font-semibold text-white">{c.matched_job}</div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 mb-1.5 font-medium">Verified Skills:</div>
                <div className="flex flex-wrap gap-1.5">
                  {c.skills.map((sk: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/8 text-[11px] text-slate-200">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/6 flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isShortlisted
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-white/5 text-slate-400 border-white/10'
                }`}>
                  {c.status}
                </span>

                {!isShortlisted ? (
                  <button
                    onClick={() => shortlistCandidate(c.id, c.name)}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5"
                  >
                    Shortlist Candidate →
                  </button>
                ) : (
                  <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Added to Pipeline
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
