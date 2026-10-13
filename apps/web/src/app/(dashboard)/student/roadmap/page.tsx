'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { 
  Map, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Sparkles, 
  Award, 
  ArrowRight,
  BookOpen,
  Code2,
  FileCheck2
} from 'lucide-react';

interface Milestone {
  id: string;
  week: number;
  title: string;
  category: 'core' | 'project' | 'interview';
  description: string;
  deliverable: string;
  completed: boolean;
  mentor_approved?: boolean;
}

export default function StudentRoadmapPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: 'm-1',
      week: 1,
      title: 'Advanced SQL & Query Optimization',
      category: 'core',
      description: 'Master CTEs, window functions (ROW_NUMBER, DENSE_RANK), indexing types, and EXPLAIN query plan analysis.',
      deliverable: 'Complete 15 LeetCode SQL medium/hard problems and write query execution comparison notes.',
      completed: true,
      mentor_approved: true,
    },
    {
      id: 'm-2',
      week: 2,
      title: 'Python for Data Analysis & Automation',
      category: 'core',
      description: 'Pandas data wrangling, NumPy vectorized math, and automated data pipelines with ETL scripts.',
      deliverable: 'Build a Python ETL pipeline extracting CSV data and loading into PostgreSQL.',
      completed: true,
      mentor_approved: true,
    },
    {
      id: 'm-3',
      week: 3,
      title: 'Interactive KPI Dashboard with Power BI',
      category: 'project',
      description: 'Model star schemas, calculate DAX measures, and design executive business intelligence dashboards.',
      deliverable: 'Publish an interactive sales & inventory analytics dashboard.',
      completed: true,
      mentor_approved: false,
    },
    {
      id: 'm-4',
      week: 4,
      title: 'Data Modeling & Relational Architecture',
      category: 'core',
      description: 'Normalization (3NF/BCNF), primary/foreign key indexing, and ACID transaction guarantees.',
      deliverable: 'Design relational database schema for a multi-tenant university portal.',
      completed: false,
    },
    {
      id: 'm-5',
      week: 5,
      title: 'STAR Method Behavioral & Project Defense',
      category: 'interview',
      description: 'Structure past academic and internship projects using Situation, Task, Action, and Result.',
      deliverable: 'Complete 3 AI Mock Interview rounds with >= 80% scorecard rating.',
      completed: false,
    },
    {
      id: 'm-6',
      week: 6,
      title: 'System Design & Real-Time Data Streaming',
      category: 'project',
      description: 'High-availability architecture, caching strategies with Redis, and message queues.',
      deliverable: 'Write system architecture diagram for real-time placement notification stream.',
      completed: false,
    },
  ]);

  const toggleMilestone = (id: string) => {
    setMilestones(prev => prev.map(m => {
      if (m.id === id) {
        const next = !m.completed;
        toast.success(next ? `Marked "${m.title}" as completed!` : `Marked "${m.title}" as pending`);
        return { ...m, completed: next };
      }
      return m;
    }));
  };

  const completedCount = milestones.filter(m => m.completed).length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Faculty Mentor Guided Curriculum</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Personalized Career Roadmap</h1>
        <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-1">
          Structured 8-week placement preparation path tailored for your target role. Submit deliverables for mentor approval.
        </p>
      </div>

      {/* Progress Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Roadmap Progress</span>
            <div className="text-2xl font-black text-[var(--text-primary)] mt-1">
              {completedCount} of {milestones.length} Milestones Completed
            </div>
          </div>
          <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
        </div>

        <div className="w-full bg-[var(--surface-elevated)] border border-[var(--border)] h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 h-full rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] pt-2 border-t border-[var(--border)]">
          <span>Target Completion: <strong className="text-[var(--text-primary)]">4 Weeks Remaining</strong></span>
          <span className="text-emerald-500 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> 2 Milestones Approved by Mentor
          </span>
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        {milestones.map((milestone, idx) => {
          const isDone = milestone.completed;
          return (
            <div
              key={milestone.id}
              className={`glass-card p-5 sm:p-6 rounded-2xl border transition-all ${
                isDone
                  ? 'border-emerald-500/30 bg-emerald-500/10'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleMilestone(milestone.id)}
                    className="mt-1 text-[var(--text-tertiary)] hover:text-emerald-500 transition-colors cursor-pointer"
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 fill-emerald-500/20" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </button>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                        Week {milestone.week}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        milestone.category === 'project'
                          ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/25'
                          : milestone.category === 'interview'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/25'
                          : 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-500/25'
                      }`}>
                        {milestone.category}
                      </span>
                      {milestone.mentor_approved && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25">
                          ✓ Mentor Verified
                        </span>
                      )}
                    </div>

                    <h3 className={`font-bold text-base sm:text-lg ${isDone ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]'}`}>
                      {milestone.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {milestone.description}
                    </p>

                    <div className="pt-2">
                      <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
                        <strong className="text-indigo-500 dark:text-indigo-300 block mb-0.5">Deliverable to Submit:</strong>
                        <span>{milestone.deliverable}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
