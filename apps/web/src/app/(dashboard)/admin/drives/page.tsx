'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  Target, 
  Plus, 
  Calendar, 
  Building, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Clock, 
  Search,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDrivesPage() {
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [ctc, setCtc] = useState('');
  const [venue, setVenue] = useState('Campus Auditorium');
  const [date, setDate] = useState('2026-10-25');
  const [eligibility, setEligibility] = useState('CGPA >= 7.5, 0 active backlogs');
  const [creating, setCreating] = useState(false);

  const fetchDrives = async () => {
    try {
      const res = await api.get('/drives');
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setDrives(list);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load drives');
      setDrives([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role) {
      toast.warning('Please enter company name and role');
      return;
    }

    setCreating(true);
    try {
      await api.post('/drives', {
        company,
        role,
        package: ctc,
        venue,
        drive_date: date,
        eligibility,
        status: 'Active',
      });
      toast.success(`Drive created! Real-time notice dispatched to all registered students.`);
      setShowModal(false);
      setCompany('');
      setRole('');
      setCtc('');
      fetchDrives();
    } catch (err: any) {
      toast.error(err.message || 'Failed to post drive');
    } finally {
      setCreating(false);
    }
  };

  const filtered = drives.filter(d => 
    (d.company || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.role || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
            <Target className="h-3.5 w-3.5" />
            <span>Campus Placement Drives</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Placement Drives</h1>
          <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-1">
            Publish on-campus and virtual hiring drives. Creating a drive automatically broadcasts an instant live notice to student notice boards.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Schedule New Drive
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search drives by company or job role..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--muted)] text-xs sm:text-sm focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Drives Grid */}
      {loading ? (
        <div className="glass-panel p-12 rounded-2xl border border-[var(--border)] text-center text-[var(--text-tertiary)] text-xs">
          <div className="inline-block h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
          <div>Loading recruitment drives from database...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-[var(--border)] text-center text-[var(--text-tertiary)] text-xs">
          No recruitment drives found. Click &quot;Schedule New Drive&quot; to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((d, idx) => (
            <div key={d.id || idx} className="glass-panel p-5 rounded-2xl border border-[var(--border)] flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all shadow-sm">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 flex items-center justify-center font-bold text-sm">
                      {(d.company || 'C')[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[var(--text-primary)]">{d.company}</h3>
                      <div className="text-xs text-indigo-400 font-medium">{d.role}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    {d.status || 'Active'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[var(--text-secondary)] pt-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                    <span>Date: {d.date || d.drive_date || 'TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                    <span>Venue: {d.venue || 'Campus Auditorium'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                    <span>Package: <strong className="text-[var(--text-primary)]">{d.ctc || d.package || 'Competitive'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)] font-medium">
                  {d.applicants_count !== undefined ? `${d.applicants_count} Registered` : 'Open for registrations'}
                </span>
                <span className="text-indigo-400 font-semibold flex items-center gap-1">
                  <Bell className="h-3 w-3" /> Live Alert Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Drive Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border)] max-w-lg w-full space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Schedule Placement Drive</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-sm"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Automatically notifies all eligible students in real-time.
              </p>
            </div>

            <form onSubmit={handleCreateDrive} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Company Name</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Cisco Systems"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-xs sm:text-sm focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Job Designation</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Software Development Engineer - I"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-xs sm:text-sm focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">CTC Package</label>
                  <input
                    type="text"
                    value={ctc}
                    onChange={(e) => setCtc(e.target.value)}
                    placeholder="e.g. ₹18.5 LPA"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-xs sm:text-sm focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Drive Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs sm:text-sm focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Venue / Mode</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Campus Auditorium / Virtual Zoom"
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-xs sm:text-sm focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Eligibility Criteria</label>
                <input
                  type="text"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  placeholder="e.g. CGPA >= 7.5, No standing backlogs"
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-xs sm:text-sm focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-secondary)] text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
                >
                  {creating ? 'Publishing...' : 'Publish & Broadcast Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
