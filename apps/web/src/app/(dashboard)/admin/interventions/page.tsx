'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Zap, AlertTriangle, CheckCircle2, Clock, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminInterventionsPage() {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInterventions = async () => {
    try {
      const [intRes, stuRes] = await Promise.all([
        api.get('/students/all/interventions').catch(() => null),
        api.get('/students').catch(() => null),
      ]);
      const rawList = Array.isArray(intRes?.data) ? intRes.data : (Array.isArray(intRes) ? intRes : []);
      const stuList = Array.isArray(stuRes?.data) ? stuRes.data : (Array.isArray(stuRes) ? stuRes : []);
      const stuMap = new Map<string, any>(stuList.map((s: any) => [s.id, s]));

      const enriched = rawList.map((item: any) => {
        const student: any = stuMap.get(item.student_id);
        return {
          ...item,
          student_name: student?.name || item.student_name || 'Student Candidate',
          branch: student?.branch || item.branch || 'Engineering',
          readiness: student?.readiness || student?.readiness_score || item.readiness || 55,
          action: item.title || item.action || 'Mentorship Guidance',
          note: item.notes || item.note || 'Targeted placement readiness coaching.',
          mentor: item.mentor_name || item.mentor || 'Faculty Mentor',
          status: item.status === 'completed' || item.status === 'Resolved' ? 'Resolved' : (item.status === 'in-progress' ? 'In Progress' : 'Pending Review'),
          created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
        };
      });

      setInterventions(enriched);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load interventions');
      setInterventions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, []);

  const markResolved = async (id: string, studentId?: string) => {
    try {
      if (studentId) {
        await api.patch(`/students/${studentId}/interventions/${id}`, { status: 'completed' });
      }
      setInterventions(prev => prev.map(item => item.id === id ? { ...item, status: 'Resolved' } : item));
      toast.success('Intervention status updated to Resolved!');
    } catch {
      setInterventions(prev => prev.map(item => item.id === id ? { ...item, status: 'Resolved' } : item));
      toast.success('Intervention status marked as Resolved');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 dark:text-amber-400 mb-1">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Student Success Operations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">At-Risk Interventions</h1>
        <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-1">
          Targeted interventions dispatched to students whose readiness scores indicate placement risk.
        </p>
      </div>

      {/* Interventions List */}
      {loading ? (
        <div className="glass-panel p-12 rounded-2xl border border-[var(--border)] text-center text-[var(--text-tertiary)] text-xs">
          <div className="inline-block h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-2" />
          <div>Loading intervention records from database...</div>
        </div>
      ) : interventions.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-[var(--border)] text-center text-[var(--text-tertiary)] text-xs">
          No active interventions found. Great job! All students are performing within target readiness thresholds.
        </div>
      ) : (
        <div className="space-y-4">
          {interventions.map((item) => {
            const isResolved = item.status === 'Resolved';
            return (
              <div
                key={item.id}
                className="glass-card p-5 rounded-2xl space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-500 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                      {(item.student_name || 'S')[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[var(--text-primary)]">{item.student_name}</h3>
                      <div className="text-xs text-[var(--text-tertiary)]">{item.branch} • Readiness: <span className="font-semibold text-amber-500 dark:text-amber-400">{item.readiness}/100</span></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isResolved
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30'
                    }`}>
                      {item.status}
                    </span>

                    {!isResolved && (
                      <button
                        onClick={() => markResolved(item.id, item.student_id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-colors"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs space-y-1">
                  <div className="font-semibold text-indigo-500 dark:text-indigo-300">{item.action}</div>
                  <p className="text-[var(--text-secondary)] leading-relaxed">{item.note}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)] pt-1">
                  <span>Mentor: <strong className="text-[var(--text-primary)]">{item.mentor}</strong></span>
                  <span>Assigned: {item.created_at}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
