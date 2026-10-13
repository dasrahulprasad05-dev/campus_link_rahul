'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function StudentReadinessPage() {
  const [readiness] = useState(78);

  const dimensions = [
    { name: 'Academic & CGPA Eligibility', score: 84, benchmark: 75, status: 'strong', desc: 'CGPA 8.4 comfortably exceeds min cutoff for 92% of visiting companies.' },
    { name: 'Core Technical Competence', score: 82, benchmark: 70, status: 'strong', desc: 'Proficient in SQL, Python, relational schema design, and Git version control.' },
    { name: 'Practical Projects & Portfolio', score: 80, benchmark: 65, status: 'strong', desc: '2 full-stack projects with live deployment and database architecture.' },
    { name: 'Problem Solving & Coding', score: 72, benchmark: 75, status: 'developing', desc: 'Good array/string fundamentals. Practice more tree/graph and dynamic programming problems.' },
    { name: 'STAR Behavioral & Interview Defense', score: 70, benchmark: 70, status: 'developing', desc: 'Needs more practice articulating measurable project outcomes under time constraints.' },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Explainable ML Placement Model</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Placement Readiness Score</h1>
        <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-1 max-w-2xl">
          Multi-dimensional placement readiness evaluation trained on historical campus recruitment outcomes.
        </p>
      </div>

      {/* Main Scorecard Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-indigo-500/25 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
            {/* SVG Radial Gauge */}
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-[var(--border)]"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-indigo-500 transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 * (1 - readiness / 100)}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-[var(--text-primary)]">{readiness}</span>
              <span className="text-[10px] text-indigo-500 dark:text-indigo-300 font-bold uppercase tracking-wider">INDEX</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                Tier 1 Placement Ready
              </span>
              <span className="text-xs text-[var(--text-tertiary)] font-medium">88th Percentile</span>
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mt-2">Strong Candidate Profile</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-md leading-relaxed">
              Based on your academic standing and project portfolio, you qualify for 90%+ of current company drives. Focusing on DSA problem speed will boost your odds.
            </p>
          </div>
        </div>

        <Link
          href="/student/interview"
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <span>Boost Score with Mock</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* 5 Dimensional Breakdown */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">5-Factor Explainability Breakdown</h3>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">How your overall readiness index is computed across key placement pillars</p>
        </div>

        <div className="space-y-4">
          {dimensions.map(dim => (
            <div key={dim.name} className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-[var(--text-primary)]">{dim.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--text-tertiary)]">Benchmark: {dim.benchmark}%</span>
                  <span className="font-black text-indigo-500 dark:text-indigo-400 text-sm">{dim.score}%</span>
                </div>
              </div>

              <div className="w-full bg-[var(--surface-hover)] border border-[var(--border)] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    dim.score >= dim.benchmark ? 'bg-indigo-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>

              <p className="text-xs text-[var(--text-secondary)] pt-0.5 leading-relaxed">{dim.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
