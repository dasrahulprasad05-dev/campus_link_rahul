'use client';

import { BarChart3, TrendingUp, Users, Award, Building, PieChart } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const branchStats = [
    { branch: 'Computer Science & Engg (CSE)', placed: '94.2%', total: 240, avgCtc: '₹12.4 LPA', color: 'bg-indigo-500' },
    { branch: 'Information Technology (IT)', placed: '91.8%', total: 180, avgCtc: '₹11.2 LPA', color: 'bg-violet-500' },
    { branch: 'Electronics & Comm. (ECE)', placed: '82.5%', total: 160, avgCtc: '₹8.6 LPA', color: 'bg-emerald-500' },
    { branch: 'Mechanical Engineering (ME)', placed: '68.0%', total: 120, avgCtc: '₹6.2 LPA', color: 'bg-amber-500' },
    { branch: 'Electrical Engineering (EE)', placed: '74.5%', total: 142, avgCtc: '₹7.1 LPA', color: 'bg-sky-500' },
  ];

  const tiers = [
    { tier: 'Super Dream (> ₹9.0 LPA)', count: 38, pct: 30, color: 'bg-purple-500' },
    { tier: 'Dream (₹5.0 - ₹9.0 LPA)', count: 54, pct: 43, color: 'bg-indigo-500' },
    { tier: 'Regular (< ₹5.0 LPA)', count: 34, pct: 27, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Placement Intelligence Reports</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Institutional Placement Analytics</h1>
        <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-1">
          Comprehensive cohort analytics, branch readiness distributions, and compensation tier splits.
        </p>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card glass-panel-hover p-5 rounded-2xl">
          <div className="text-xs font-semibold text-[var(--text-tertiary)]">Total Placement Rate</div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)] mt-1">86.4%</div>
          <div className="text-xs text-emerald-500 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="h-3.5 w-3.5" /> +4.2% increase from 2025 cycle
          </div>
        </div>

        <div className="glass-card glass-panel-hover p-5 rounded-2xl">
          <div className="text-xs font-semibold text-[var(--text-tertiary)]">Median Compensation</div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)] mt-1">₹8.4 LPA</div>
          <div className="text-xs text-indigo-500 dark:text-indigo-400 mt-1 font-medium">
            Super Dream Tier peak at ₹28.5 LPA
          </div>
        </div>

        <div className="glass-card glass-panel-hover p-5 rounded-2xl">
          <div className="text-xs font-semibold text-[var(--text-tertiary)]">Average Student Readiness</div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)] mt-1">78 / 100</div>
          <div className="text-xs text-violet-500 dark:text-violet-400 mt-1 font-medium">
            Calculated across 842 students
          </div>
        </div>
      </div>

      {/* Grid: Branch-wise and Tier Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch breakdown */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-[var(--text-primary)]">Branch Placement Success</h2>
          <div className="space-y-4">
            {branchStats.map((b, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--text-primary)]">{b.branch}</span>
                  <span className="font-mono font-bold text-indigo-500 dark:text-indigo-300">{b.placed} placed • {b.avgCtc} avg</span>
                </div>
                <div className="h-2 w-full bg-[var(--surface-elevated)] border border-[var(--border)] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${b.color} rounded-full transition-all`}
                    style={{ width: b.placed }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compensation Tiers */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-[var(--text-primary)]">Compensation Tier Distribution</h2>
          <div className="space-y-4">
            {tiers.map((t, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--text-primary)]">{t.tier}</span>
                  <span className="font-mono font-bold text-[var(--text-secondary)]">{t.count} offers ({t.pct}%)</span>
                </div>
                <div className="h-2 w-full bg-[var(--surface-elevated)] border border-[var(--border)] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${t.color} rounded-full transition-all`}
                    style={{ width: `${t.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
