'use client';

import { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Sliders, 
  Building2, 
  Award, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function StudentWhatIfPage() {
  const [cgpa, setCgpa] = useState(8.4);
  const [hasAwsCert, setHasAwsCert] = useState(true);
  const [hasDsaPractice, setHasDsaPractice] = useState(false);
  const [hasProductionProject, setHasProductionProject] = useState(true);

  // Dynamic simulation algorithm
  const baseScore = Math.round(cgpa * 8);
  const certBonus = hasAwsCert ? 10 : 0;
  const dsaBonus = hasDsaPractice ? 12 : 0;
  const projBonus = hasProductionProject ? 8 : 0;
  const simulatedOdds = Math.min(98, Math.max(45, baseScore + certBonus + dsaBonus + projBonus - 15));

  const eligibleCount = Math.round((simulatedOdds / 100) * 35);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Interactive Career & Placement Simulator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">What-If Placement Simulator</h1>
        <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-1 max-w-2xl">
          Simulate how improving your CGPA, earning certifications, or building production projects directly shifts your placement odds and company eligibility.
        </p>
      </div>

      {/* Main Simulation Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls Column */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
            <Sliders className="h-4 w-4 text-indigo-400" />
            <h2 className="text-base font-bold text-[var(--text-primary)]">Adjust Candidate Factors</h2>
          </div>

          {/* CGPA Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-[var(--text-secondary)]">Projected CGPA</span>
              <span className="font-black text-indigo-500 dark:text-indigo-400 text-base">{cgpa.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="6.0"
              max="10.0"
              step="0.1"
              value={cgpa}
              onChange={e => setCgpa(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] font-bold">
              <span>6.0 (Min Cutoff)</span>
              <span>8.0 (Tier 1 Cutoff)</span>
              <span>10.0 (Max)</span>
            </div>
          </div>

          {/* Toggle Checklist */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Target Milestones & Credentials</span>

            <label className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] cursor-pointer hover:bg-[var(--surface-hover)] transition-colors">
              <input
                type="checkbox"
                checked={hasAwsCert}
                onChange={e => setHasAwsCert(e.target.checked)}
                className="h-4 w-4 rounded accent-indigo-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-[var(--text-primary)] block">Cloud Certification (AWS / GCP / Azure)</span>
                <span className="text-[var(--text-tertiary)]">+10% Placement Odds Boost</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] cursor-pointer hover:bg-[var(--surface-hover)] transition-colors">
              <input
                type="checkbox"
                checked={hasDsaPractice}
                onChange={e => setHasDsaPractice(e.target.checked)}
                className="h-4 w-4 rounded accent-indigo-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-[var(--text-primary)] block">Complete 100+ LeetCode DSA Problems</span>
                <span className="text-[var(--text-tertiary)]">+12% Coding Assessment Clearance</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] cursor-pointer hover:bg-[var(--surface-hover)] transition-colors">
              <input
                type="checkbox"
                checked={hasProductionProject}
                onChange={e => setHasProductionProject(e.target.checked)}
                className="h-4 w-4 rounded accent-indigo-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-[var(--text-primary)] block">Deploy Full-Stack Portfolio App on Cloud</span>
                <span className="text-[var(--text-tertiary)]">+8% Technical Defense Rating</span>
              </div>
            </label>
          </div>
        </div>

        {/* Real-time Outcome Column */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-indigo-500/30 flex flex-col justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">Simulated Outcome</span>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">
                {simulatedOdds}%
              </span>
              <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> High Confidence
              </span>
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">Predicted Day-1 Campus Placement Probability</div>

            <div className="mt-6 p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-tertiary)]">Visiting Companies Eligible:</span>
                <strong className="text-[var(--text-primary)] font-bold">{eligibleCount} of 35 Companies</strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-tertiary)]">Estimated Compensation Band:</span>
                <strong className="text-emerald-500 dark:text-emerald-400 font-bold">
                  {simulatedOdds >= 80 ? '₹8.0 - ₹14.5 LPA' : simulatedOdds >= 65 ? '₹5.5 - ₹8.0 LPA' : '₹3.6 - ₹5.0 LPA'}
                </strong>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-[var(--text-secondary)] leading-relaxed">
            💡 <strong>AI Recommendation:</strong> {
              !hasDsaPractice
                ? 'Practicing core algorithms will yield the largest immediate increase in coding test clearance.'
                : !hasAwsCert
                ? 'Adding a cloud credential gives enterprise recruiters tangible proof of deployment capability.'
                : 'Excellent profile alignment. You are well-positioned for Tier 1 super-dream placement rounds.'
            }
          </div>
        </div>
      </div>
    </div>
  );
}
