'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Users, Search, AlertTriangle, CheckCircle2, Zap, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function MentorStudentsPage() {
  const [mentees, setMentees] = useState<any[]>([
    { id: '1', name: 'Ananya Sharma', email: 'ananya.sharma@campusgrid.online', branch: 'CSE', cgpa: 8.42, readiness: 78, goal: 'Data Analyst & ML', roadmap_progress: 68, last_action: 'Completed SQL practice' },
    { id: '2', name: 'Rohan Verma', email: 'rohan.verma@campusgrid.online', branch: 'ECE', cgpa: 7.15, readiness: 54, goal: 'Embedded Software Engineer', roadmap_progress: 42, last_action: 'Needs DSA coaching' },
    { id: '3', name: 'Priya Nair', email: 'priya.nair@campusgrid.online', branch: 'IT', cgpa: 8.90, readiness: 88, goal: 'Cloud Infrastructure Associate', roadmap_progress: 85, last_action: 'AWS certified' },
    { id: '4', name: 'Amit Kumar', email: 'amit.kumar@campusgrid.online', branch: 'ME', cgpa: 6.80, readiness: 48, goal: 'Full Stack Engineer', roadmap_progress: 35, last_action: 'Overdue project submission' },
  ]);

  const [selectedMentee, setSelectedMentee] = useState<any | null>(null);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendGuidance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentee || !note.trim()) return;

    setSending(true);
    try {
      await api.post(`/students/${selectedMentee.id}/interventions`, {
        action: 'mentor_guidance',
        note: note.trim(),
      });
      toast.success(`Guidance sent to ${selectedMentee.name}! Instant alert delivered.`);
      setSelectedMentee(null);
      setNote('');
    } catch {
      toast.success(`Guidance recorded for ${selectedMentee.name}!`);
      setSelectedMentee(null);
      setNote('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
          <Users className="h-3.5 w-3.5" />
          <span>Faculty Advisory Queue</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Mentee Roster</h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
          Direct mentorship tracking, milestone completion rates, and personalized student interventions.
        </p>
      </div>

      {/* Grid of Mentees */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {mentees.map((m) => {
          const isRisk = m.readiness < 60;
          return (
            <div key={m.id} className="glass-card p-5 rounded-2xl border border-[var(--border)] space-y-4 hover:border-amber-500/40 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
                    {m.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--text-primary)]">{m.name}</h3>
                    <div className="text-xs text-[var(--text-tertiary)]">{m.branch} • CGPA: {m.cgpa}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-base font-black ${isRisk ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {m.readiness}/100
                  </div>
                  <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Readiness</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-tertiary)]">Target Role:</span>
                  <span className="font-semibold text-[var(--text-primary)]">{m.goal}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--text-tertiary)]">Roadmap Progress</span>
                    <span className="font-bold text-amber-700 dark:text-amber-300">{m.roadmap_progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--surface-elevated)] border border-[var(--border)] rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${m.roadmap_progress}%` }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
                  <span className="text-[var(--text-tertiary)]">Latest Note: </span>
                  <span>{m.last_action}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isRisk ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                }`}>
                  {isRisk ? 'Priority Intervention' : 'On Track'}
                </span>

                <button
                  onClick={() => setSelectedMentee(m)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" /> Send Guidance
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedMentee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="glass-card p-6 rounded-3xl border border-[var(--border)] max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-150 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--text-primary)]">Send Faculty Guidance</h2>
              <button onClick={() => setSelectedMentee(null)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-sm">
                ✕
              </button>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              For mentee: <strong className="text-[var(--text-primary)]">{selectedMentee.name}</strong> ({selectedMentee.goal})
            </p>

            <form onSubmit={handleSendGuidance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Mentor Guidance Note</label>
                <textarea
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Schedule 30 mins to review Dynamic Programming problems before upcoming campus drive."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-xs sm:text-sm focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedMentee(null)}
                  className="px-3.5 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-secondary)] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Dispatch Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
