'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import { NotificationItem } from '@/types';
import { toast } from 'sonner';
import { 
  Bell, 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  ExternalLink, 
  Filter, 
  GraduationCap, 
  RefreshCw, 
  Sparkles, 
  Target 
} from 'lucide-react';

const FALLBACK_NOTICES: NotificationItem[] = [
  {
    id: 'nb-1',
    type: 'drive_announced',
    title: 'TechNova Solutions Campus Placement Drive',
    message: 'TechNova Solutions has announced a placement drive on Oct 24, 2026 at Campus Auditorium Hall A. Eligibility: CSE, IT with CGPA >= 7.0.',
    metadata: { company: 'TechNova Solutions', date: '2026-10-24' },
    is_read: false,
    created_at: '2026-10-12T18:00:00.000Z',
  },
  {
    id: 'nb-2',
    type: 'job_posted',
    title: 'CloudScale Systems is Hiring: DevOps Engineer',
    message: 'Package: ₹9.5 LPA. Required stack: Docker, Kubernetes, AWS, CI/CD pipelines. Applications close in 14 days.',
    metadata: { company: 'CloudScale Systems', role: 'DevOps Engineer' },
    is_read: false,
    created_at: '2026-10-12T14:00:00.000Z',
  },
  {
    id: 'nb-3',
    type: 'mentor_feedback',
    title: 'Mentor Milestone Review & Coaching Notes',
    message: 'Your faculty mentor reviewed your portfolio project. Recommendation: Add integration tests and deploy API endpoints on Render.',
    is_read: true,
    created_at: '2026-10-11T10:00:00.000Z',
  },
  {
    id: 'nb-4',
    type: 'shortlisted',
    title: 'Shortlisted for Technical Assessment',
    message: 'Congratulations! You have been shortlisted for the Graduate Data Analyst position at TechNova. Assessment schedule is now active.',
    is_read: true,
    created_at: '2026-10-10T09:00:00.000Z',
  },
];

export default function NoticeBoardPage() {
  const [notices, setNotices] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'jobs' | 'drives' | 'mentor' | 'pipeline'>('all');
  const [loading, setLoading] = useState(true);

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notifications');
      if (res && res.success && Array.isArray(res.data)) {
        setNotices(res.data);
      } else {
        setNotices(fallbackNotices);
      }
    } catch {
      setNotices(fallbackNotices);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const fallbackNotices: NotificationItem[] = [
    {
      id: 'nb-1',
      type: 'drive_announced',
      title: 'TechNova Solutions Campus Placement Drive',
      message: 'TechNova Solutions has announced a placement drive on Oct 24, 2026 at Campus Auditorium Hall A. Eligibility: CSE, IT with CGPA >= 7.0.',
      metadata: { company: 'TechNova Solutions', date: '2026-10-24' },
      is_read: false,
      created_at: '2026-10-12T18:00:00.000Z',
    },
    {
      id: 'nb-2',
      type: 'job_posted',
      title: 'CloudScale Systems is Hiring: DevOps Engineer',
      message: 'Package: ₹9.5 LPA. Required stack: Docker, Kubernetes, AWS, CI/CD pipelines. Applications close in 14 days.',
      metadata: { company: 'CloudScale Systems', role: 'DevOps Engineer' },
      is_read: false,
      created_at: '2026-10-12T14:00:00.000Z',
    },
    {
      id: 'nb-3',
      type: 'mentor_feedback',
      title: 'Mentor Milestone Review & Coaching Notes',
      message: 'Your faculty mentor reviewed your portfolio project. Recommendation: Add integration tests and deploy API endpoints on Render.',
      is_read: true,
      created_at: '2026-10-11T10:00:00.000Z',
    },
    {
      id: 'nb-4',
      type: 'shortlisted',
      title: 'Shortlisted for Technical Assessment',
      message: 'Congratulations! You have been shortlisted for the Graduate Data Analyst position at TechNova. Assessment schedule is now active.',
      is_read: true,
      created_at: '2026-10-10T09:00:00.000Z',
    },
  ];

  const markAllRead = async () => {
    setNotices(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success('All notices marked as read');
    try {
      await api.post('/notifications/mark-all-read');
    } catch {}
  };

  const markRead = async (id: string) => {
    setNotices(prev => prev.map(n => n.id === id ? ({ ...n, is_read: true }) : n));
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {}
  };

  const filtered = notices.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'jobs') return n.type === 'job_posted';
    if (filter === 'drives') return n.type === 'drive_announced';
    if (filter === 'mentor') return n.type === 'mentor_feedback';
    if (filter === 'pipeline') return n.type === 'shortlisted' || n.type === 'stage_updated';
    return true;
  });

  const unreadCount = notices.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Real-Time Broadcast Network</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Notice Board</h1>
          <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-1">
            Live placement drives, job openings, mentor guidance, and round-by-round status alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-3 py-1.5 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-xs font-medium text-[var(--text-secondary)] border border-[var(--border)] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Mark all read</span>
            </button>
          )}
          <button
            onClick={() => {
              setLoading(true);
              fetchNotices();
              toast.info('Refreshed notice board');
            }}
            className="px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-xs font-semibold text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--border)]">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          All Notices ({notices.length})
        </button>
        <button
          onClick={() => setFilter('jobs')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            filter === 'jobs'
              ? 'bg-indigo-600 text-white font-semibold'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>Jobs ({notices.filter(n => n.type === 'job_posted').length})</span>
        </button>
        <button
          onClick={() => setFilter('drives')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            filter === 'drives'
              ? 'bg-indigo-600 text-white font-semibold'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Drives ({notices.filter(n => n.type === 'drive_announced').length})</span>
        </button>
        <button
          onClick={() => setFilter('mentor')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            filter === 'mentor'
              ? 'bg-indigo-600 text-white font-semibold'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <GraduationCap className="h-3.5 w-3.5" />
          <span>Mentor Notes ({notices.filter(n => n.type === 'mentor_feedback').length})</span>
        </button>
        <button
          onClick={() => setFilter('pipeline')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            filter === 'pipeline'
              ? 'bg-indigo-600 text-white font-semibold'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <Target className="h-3.5 w-3.5" />
          <span>Hiring Rounds ({notices.filter(n => n.type === 'shortlisted' || n.type === 'stage_updated').length})</span>
        </button>
      </div>

      {/* Notice List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-[var(--text-tertiary)] text-sm glass-card rounded-2xl">
            Loading real-time notices...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center glass-card rounded-2xl">
            <Bell className="h-8 w-8 text-[var(--text-tertiary)] mx-auto mb-3" />
            <div className="text-base font-semibold text-[var(--text-primary)]">No notices in this category</div>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Check back later for newly announced drives and updates.</p>
          </div>
        ) : (
          filtered.map(notice => {
            const isUnread = !notice.is_read;
            return (
              <div
                key={notice.id}
                className={`glass-card glass-panel-hover p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  isUnread
                    ? 'border-indigo-500/40 bg-indigo-500/10'
                    : ''
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    notice.type === 'job_posted'
                      ? 'bg-sky-500/15 text-sky-500 dark:text-sky-400 border border-sky-500/25'
                      : notice.type === 'drive_announced'
                      ? 'bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/25'
                      : notice.type === 'mentor_feedback'
                      ? 'bg-violet-500/15 text-violet-500 dark:text-violet-400 border border-violet-500/25'
                      : 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/25'
                  }`}>
                    {notice.type === 'job_posted' && <Briefcase className="h-5 w-5" />}
                    {notice.type === 'drive_announced' && <Calendar className="h-5 w-5" />}
                    {notice.type === 'mentor_feedback' && <GraduationCap className="h-5 w-5" />}
                    {(notice.type === 'shortlisted' || notice.type === 'stage_updated') && <Target className="h-5 w-5" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm sm:text-base text-[var(--text-primary)]">{notice.title}</h3>
                      {isUnread && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                      {notice.message}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-[11px] text-[var(--text-tertiary)]">
                      <span>⏱️ {timeAgo(notice.created_at)}</span>
                      <span>•</span>
                      <span className="capitalize">{notice.type.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {isUnread && (
                    <button
                      onClick={() => markRead(notice.id)}
                      className="px-2.5 py-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-md transition-colors cursor-pointer"
                    >
                      Mark read
                    </button>
                  )}
                  {notice.type === 'job_posted' && (
                    <Link
                      href="/student/jobs"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm transition-colors flex items-center gap-1"
                    >
                      <span>View Job</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                  {notice.type === 'drive_announced' && (
                    <Link
                      href="/student/jobs"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm transition-colors flex items-center gap-1"
                    >
                      <span>Explore Drive</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                  {notice.type === 'mentor_feedback' && (
                    <Link
                      href="/student/roadmap"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm transition-colors flex items-center gap-1"
                    >
                      <span>View Roadmap</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                  {(notice.type === 'shortlisted' || notice.type === 'stage_updated') && (
                    <Link
                      href="/student/applications"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-sm transition-colors flex items-center gap-1"
                    >
                      <span>Track Round</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
