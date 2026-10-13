'use client';

import { useState } from 'react';
import { Map, CheckCircle2, Clock, Check, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function MentorRoadmapsPage() {
  const [selectedStudent, setSelectedStudent] = useState('Ananya Sharma');

  const roadmapMilestones = [
    { week: 1, title: 'Data Analysis Foundations', topics: ['Pandas syntax', 'Numpy arrays', 'Data cleaning pipelines'], status: 'completed' },
    { week: 2, title: 'SQL & Relational Databases', topics: ['Window functions', 'Joins & Subqueries', 'Indexing performance'], status: 'completed' },
    { week: 3, title: 'Exploratory Data Analysis & Viz', topics: ['Matplotlib & Seaborn', 'Tableau interactive dashboards'], status: 'completed' },
    { week: 4, title: 'Machine Learning Models & Scikit-Learn', topics: ['Regression', 'Classification trees', 'Cross-validation'], status: 'in-progress' },
    { week: 5, title: 'Production ML & Docker APIs', topics: ['FastAPI backend', 'Container deployment', 'GitHub Actions'], status: 'upcoming' },
    { week: 6, title: 'End-to-End Capstone Project & Mock Drive', topics: ['Portfolio presentation', 'STAR behavioral drill'], status: 'upcoming' },
  ];

  const approveMilestone = (week: number) => {
    toast.success(`Week ${week} milestone approved for ${selectedStudent}!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
            <Map className="h-3.5 w-3.5" />
            <span>Curriculum & Career Progression</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Roadmap Reviews</h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Audit weekly preparation milestones for assigned mentees and sign off on skill benchmarks.
          </p>
        </div>

        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs sm:text-sm focus:outline-none"
        >
          <option value="Ananya Sharma">Ananya Sharma (Data Analyst)</option>
          <option value="Rohan Verma">Rohan Verma (Embedded Systems)</option>
          <option value="Priya Nair">Priya Nair (Cloud Ops)</option>
        </select>
      </div>

      {/* Timeline */}
      <div className="glass-card p-6 rounded-2xl border border-[var(--border)] space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">{selectedStudent}&apos;s Preparation Roadmap</h2>
            <div className="text-xs text-[var(--text-secondary)]">Target Role: Data Analyst & ML Associate • 6-Week Adaptive Track</div>
          </div>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
            68% Completed
          </span>
        </div>

        <div className="space-y-4">
          {roadmapMilestones.map((m) => {
            const isCompleted = m.status === 'completed';
            const isInProgress = m.status === 'in-progress';

            return (
              <div
                key={m.week}
                className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : isInProgress
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      : 'bg-[var(--surface-elevated)] text-[var(--text-tertiary)] border border-[var(--border)]'
                  }`}>
                    {isCompleted ? <Check className="h-4 w-4" /> : m.week}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-[var(--text-primary)]">Week {m.week}: {m.title}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {m.topics.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-[var(--surface-hover)] text-[10px] text-[var(--text-secondary)] border border-[var(--border)]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isInProgress && (
                    <button
                      onClick={() => approveMilestone(m.week)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Sign Off Milestone
                    </button>
                  )}

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isCompleted
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : isInProgress
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                      : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] border-[var(--border)]'
                  }`}>
                    {m.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
