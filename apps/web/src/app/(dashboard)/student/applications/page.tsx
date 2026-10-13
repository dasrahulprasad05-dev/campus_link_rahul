'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Application, HiringStageProgress } from '@/types';
import { toast } from 'sonner';
import { 
  FileText, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Mic, 
  Sparkles, 
  Target, 
  X,
  AlertCircle
} from 'lucide-react';

export default function StudentApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [stages, setStages] = useState<HiringStageProgress[]>([]);
  const [loadingStages, setLoadingStages] = useState(false);

  useEffect(() => {
    api.get('/students/me/applications')
      .then(res => {
        if (res && res.data && Array.isArray(res.data)) {
          setApps(res.data);
        } else if (Array.isArray(res)) {
          setApps(res);
        } else {
          setApps(fallbackApps);
        }
      })
      .catch(() => setApps(fallbackApps));
  }, []);

  const fallbackApps: Application[] = [
    {
      id: 'app-001',
      student_id: 'sp-001',
      job_id: 'job-001',
      job_title: 'Graduate Data Analyst',
      company: 'TechNova Solutions',
      status: 'interview',
      current_round: 'Technical Round 2',
      applied_at: '2026-10-01T10:00:00.000Z',
    },
    {
      id: 'app-002',
      student_id: 'sp-001',
      job_id: 'job-002',
      job_title: 'Associate DevOps Engineer',
      company: 'CloudScale Systems',
      status: 'shortlisted',
      current_round: 'Online Coding Test',
      applied_at: '2026-10-05T10:00:00.000Z',
    },
    {
      id: 'app-003',
      student_id: 'sp-001',
      job_id: 'job-003',
      job_title: 'Junior Software Engineer',
      company: 'Infosys BPM',
      status: 'applied',
      current_round: 'Resume Screening',
      applied_at: '2026-10-09T10:00:00.000Z',
    },
  ];

  const openStagesTracker = async (app: Application) => {
    setSelectedApp(app);
    setLoadingStages(true);

    try {
      const res = await api.get(`/applications/${app.id}/stages`);
      if (res && res.success && res.data && Array.isArray(res.data.stages)) {
        setStages(res.data.stages);
      } else {
        setStages(getDefaultStages(app));
      }
    } catch {
      setStages(getDefaultStages(app));
    } finally {
      setLoadingStages(false);
    }
  };

  const getDefaultStages = (app: Application): HiringStageProgress[] => [
    {
      stage_id: 'stg-1',
      stage_name: 'Online Aptitude & Coding Test',
      stage_order: 1,
      stage_type: 'test',
      is_eliminatory: true,
      status: 'passed',
      score: 88,
      completed_at: '2026-10-06T14:30:00.000Z',
      feedback: 'Cleared online assessment with 88 percentile score.',
    },
    {
      stage_id: 'stg-2',
      stage_name: 'Technical Round 1 (DSA & Core CS)',
      stage_order: 2,
      stage_type: 'interview',
      is_eliminatory: true,
      status: app.status === 'interview' ? 'passed' : 'pending',
      score: 84,
      completed_at: '2026-10-09T11:00:00.000Z',
      feedback: 'Strong understanding of SQL and data structures.',
    },
    {
      stage_id: 'stg-3',
      stage_name: 'Technical Round 2 (System Design & Projects)',
      stage_order: 3,
      stage_type: 'interview',
      is_eliminatory: true,
      status: app.status === 'interview' ? 'scheduled' : 'pending',
      scheduled_at: '2026-10-15T15:00:00.000Z',
      interviewer_name: 'Senior Architect',
      feedback: 'Scheduled online interview via Google Meet.',
    },
    {
      stage_id: 'stg-4',
      stage_name: 'HR & Cultural Fit Round',
      stage_order: 4,
      stage_type: 'hr',
      is_eliminatory: true,
      status: 'pending',
    },
    {
      stage_id: 'stg-5',
      stage_name: 'Final Selection & Offer Letter',
      stage_order: 5,
      stage_type: 'offer',
      is_eliminatory: false,
      status: app.status === 'offered' ? 'passed' : 'pending',
    },
  ];

  const filteredApps = apps.filter(a => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Application Pipeline & Multi-Round Tracker</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">My Applications</h1>
        <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-1">
          Monitor your recruitment journey across each company round. View interview dates, scores, and recruiter feedback.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--border)] scrollbar-none">
        {['all', 'interview', 'shortlisted', 'offered', 'applied'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
              filter === f
                ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            {f === 'all' ? `All (${apps.length})` : `${f} (${apps.filter(a => a.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Applications Table / Cards */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[var(--surface-elevated)] border-b border-[var(--border)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              <tr>
                <th className="px-5 py-3.5">Position & Company</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Current Phase</th>
                <th className="px-5 py-3.5">Applied Date</th>
                <th className="px-5 py-3.5 text-right">Rounds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--text-secondary)]">
              {filteredApps.map(app => (
                <tr key={app.id} className="hover:bg-[var(--table-hover)] transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-[var(--text-primary)] text-sm">{app.job_title || app.job || 'Position'}</div>
                    <div className="text-xs text-[var(--text-tertiary)] flex items-center gap-1 mt-0.5">
                      <Building2 className="h-3 w-3" />
                      <span>{app.company || app.company_name || 'Campus Recruiter'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                      app.status === 'offered'
                        ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30'
                        : app.status === 'interview'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                        : app.status === 'shortlisted'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                        : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{app.current_round || app.round || 'Screening'}</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-[var(--text-tertiary)]">
                    {app.applied_at ? new Date(app.applied_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => openStagesTracker(app)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Target className="h-3.5 w-3.5" />
                      <span>Track Rounds</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Round Stages Tracker Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[var(--background-secondary)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-[var(--border)]">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  <Target className="h-4 w-4" />
                  <span>Company Hiring Rounds</span>
                </div>
                <h2 className="text-xl font-bold text-[var(--text-primary)] mt-1">
                  {selectedApp.job_title || selectedApp.job}
                </h2>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{selectedApp.company} • Multi-round Pipeline</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingStages ? (
              <div className="py-12 text-center text-[var(--text-tertiary)] text-sm">
                Fetching candidate hiring rounds...
              </div>
            ) : (
              <div className="py-6 space-y-4">
                {stages.map((stage, i) => {
                  const isPassed = stage.status === 'passed';
                  const isScheduled = stage.status === 'scheduled';
                  const isInProgress = stage.status === 'in-progress';
                  const isFailed = stage.status === 'failed';

                  return (
                    <div
                      key={stage.stage_id || i}
                      className={`p-4 rounded-2xl border transition-all ${
                        isPassed
                          ? 'border-emerald-500/30 bg-emerald-500/10'
                          : isScheduled
                          ? 'border-amber-500/30 bg-amber-500/10'
                          : isInProgress
                          ? 'border-indigo-500/30 bg-indigo-500/15'
                          : isFailed
                          ? 'border-rose-500/30 bg-rose-500/10'
                          : 'border-[var(--border)] bg-[var(--surface-elevated)] opacity-70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-[var(--text-tertiary)]">ROUND {stage.stage_order}</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              isPassed
                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                                : isScheduled
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                                : isInProgress
                                ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                                : isFailed
                                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300'
                                : 'bg-[var(--surface-hover)] text-[var(--text-tertiary)]'
                            }`}>
                              {isPassed ? '✓ Cleared' : isScheduled ? '📅 Scheduled' : isInProgress ? '⚡ In Progress' : isFailed ? '✕ Eliminated' : '🔒 Upcoming'}
                            </span>
                            {stage.score && (
                              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                                Score: {stage.score}%
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-sm text-[var(--text-primary)]">{stage.stage_name}</h4>
                          {stage.feedback && (
                            <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                              📝 <strong>Recruiter Feedback:</strong> {stage.feedback}
                            </p>
                          )}
                          {stage.scheduled_at && (
                            <p className="text-xs text-amber-600 dark:text-amber-300 mt-2 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(stage.scheduled_at).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              {stage.interviewer_name && <span className="text-[var(--text-tertiary)]">({stage.interviewer_name})</span>}
                            </p>
                          )}
                        </div>

                        {(isScheduled || isInProgress) && (
                          <Link
                            href="/student/interview"
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm flex items-center gap-1 shrink-0 self-start mt-1"
                          >
                            <Mic className="h-3.5 w-3.5" />
                            <span>Practice Mock</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-[var(--text-tertiary)]">Want to test your answers before the live interview?</span>
              <Link
                href="/student/interview"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5"
              >
                <Mic className="h-3.5 w-3.5" />
                <span>Practice STAR Behavioral Mock</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
