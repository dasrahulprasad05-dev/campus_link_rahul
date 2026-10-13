'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Building, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function AdminSchedulerPage() {
  const [selectedDate, setSelectedDate] = useState('2026-10-25');

  const scheduleEvents = [
    { time: '09:00 AM - 11:00 AM', company: 'Google', title: 'Online Coding Round (Aptitude & DSA)', venue: 'Computer Labs 1, 2 & 3', type: 'Online Test', badge: 'Tier-1' },
    { time: '11:30 AM - 01:00 PM', company: 'Microsoft', title: 'Pre-Placement Talk (PPT) & Q&A', venue: 'Main University Auditorium', type: 'Session', badge: 'Super Dream' },
    { time: '02:00 PM - 05:00 PM', company: 'TechNova', title: 'Technical Interview Round 1 & Round 2', venue: 'Placement Cell Interview Rooms 4-8', type: 'Interviews', badge: 'Dream' },
    { time: '05:30 PM - 07:00 PM', company: 'Cognizant', title: 'HR Discussion & Document Verification', venue: 'Virtual Google Meet', type: 'HR Round', badge: 'Regular' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>Placement Timeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Drive Scheduler</h1>
          <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-1">
            Coordinate interview slots, online testing lab schedules, and corporate presentations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)]">
            October 2026
          </span>
        </div>
      </div>

      {/* Timeline view */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-400" />
            <h2 className="font-bold text-base text-[var(--text-primary)]">Daily Schedule: October 25, 2026</h2>
          </div>
          <span className="text-xs text-emerald-500 dark:text-emerald-400 font-semibold">4 Activities Confirmed</span>
        </div>

        <div className="space-y-4">
          {scheduleEvents.map((evt, i) => (
            <div key={i} className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-4">
                <div className="px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-300 text-xs font-mono font-bold shrink-0">
                  {evt.time.split(' - ')[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--text-primary)] text-sm">{evt.company}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-secondary)]">
                      {evt.badge}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">{evt.title}</div>
                  <div className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1.5 mt-1">
                    <MapPin className="h-3 w-3 text-[var(--text-tertiary)]" />
                    <span>{evt.venue}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                  {evt.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
