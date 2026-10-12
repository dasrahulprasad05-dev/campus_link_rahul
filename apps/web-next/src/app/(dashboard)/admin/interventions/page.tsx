'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Zap, AlertTriangle, CheckCircle2, Clock, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminInterventionsPage() {
  const [interventions, setInterventions] = useState<any[]>([
    {
      id: '1',
      student_name: 'Rohan Verma',
      branch: 'ECE',
      readiness: 54,
      action: 'DSA & Coding Practice',
      note: 'Struggling with Trees and Dynamic Programming in initial aptitude rounds.',
      mentor: 'Prof. Suresh Mishra',
      status: 'In Progress',
      created_at: '2026-10-10',
    },
    {
      id: '2',
      student_name: 'Amit Kumar',
      branch: 'ME',
      readiness: 48,
      action: 'STAR Mock Interview Coach',
      note: 'Need structured answering practice for behavioral interview rounds.',
      mentor: 'Dr. Rajesh Nayak',
      status: 'Pending Review',
      created_at: '2026-10-11',
    },
    {
      id: '3',
      student_name: 'Pooja Hegde',
      branch: 'IT',
      readiness: 58,
      action: 'Resume ATS Alignment',
      note: 'Add missing project achievements and quantifiable impact metrics.',
      mentor: 'Prof. Suresh Mishra',
      status: 'Resolved',
      created_at: '2026-10-08',
    },
  ]);

  const markResolved = (id: string) => {
    setInterventions(prev => prev.map(item => item.id === id ? { ...item, status: 'Resolved' } : item));
    toast.success('Intervention status updated to Resolved!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Student Success Operations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">At-Risk Interventions</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Targeted interventions dispatched to students whose readiness scores indicate placement risk.
        </p>
      </div>

      {/* Interventions List */}
      <div className="space-y-4">
        {interventions.map((item) => {
          const isResolved = item.status === 'Resolved';
          return (
            <div
              key={item.id}
              className="glass-panel p-5 rounded-2xl border border-white/8 space-y-3 hover:border-white/15 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-300 flex items-center justify-center font-bold text-xs">
                    {(item.student_name || 'S')[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{item.student_name}</h3>
                    <div className="text-xs text-slate-400">{item.branch} • Readiness: <span className="font-semibold text-amber-400">{item.readiness}/100</span></div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isResolved
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    {item.status}
                  </span>

                  {!isResolved && (
                    <button
                      onClick={() => markResolved(item.id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/2 border border-white/6 text-xs space-y-1">
                <div className="font-semibold text-indigo-300">{item.action}</div>
                <p className="text-slate-300 leading-relaxed">{item.note}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Mentor: <strong className="text-white">{item.mentor}</strong></span>
                <span>Assigned: {item.created_at}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
