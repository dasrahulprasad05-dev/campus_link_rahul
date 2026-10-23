'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { Award, CheckCircle2, Clock, Search, Building, User, TrendingUp, Download, Filter } from 'lucide-react';
import { toast } from 'sonner';

/* ─────────────────────────────────────────────────
   Types & Helpers
   ───────────────────────────────────────────────── */

interface Offer {
  id: string;
  student_name?: string;
  student_id?: string;
  company?: string;
  company_id?: string;
  role: string;
  ctc: string;         // e.g. "₹14.5 LPA"
  ctc_lpa?: number;    // numeric, e.g. 14.5
  tier: string;
  status: string;
  offer_date?: string;
  date?: string;
  joining_status?: string;
}

/** Classify tier based on CTC */
function classifyTier(ctcLpa: number): string {
  if (ctcLpa >= 25) return 'Super Dream';
  if (ctcLpa >= 10) return 'Dream';
  if (ctcLpa >= 6) return 'Regular';
  return 'Regular';
}

/** Format CTC display */
function formatCTC(ctcLpa: number): string {
  return `₹${ctcLpa.toFixed(1)} LPA`;
}

/* ─────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────── */

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');

  /* ── Fetch offers from API ── */
  useEffect(() => {
    async function loadOffers() {
      try {
        const res = await api.get('/offers');
        const raw: any[] = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);

        // Normalize backend data to our Offer shape
        const normalized: Offer[] = raw.map((o: any) => {
          const ctcLpa = parseFloat(o.ctc_lpa) || 0;
          return {
            id: o.id,
            student_id: o.student_id,
            student_name: o.student_name || 'Student #' + (o.student_id?.slice(0, 8) || ''),
            company_id: o.company_id,
            company: o.company_name || o.company || 'Company',
            role: o.role || 'N/A',
            ctc: o.ctc || formatCTC(ctcLpa),
            ctc_lpa: ctcLpa,
            tier: o.tier || classifyTier(ctcLpa),
            status: o.status || 'pending',
            date: o.offer_date || o.date || o.created_at || '',
            joining_status: o.joining_status || 'not-joined',
          };
        });

        setOffers(normalized);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load offers');
        setOffers([]);
      } finally {
        setLoading(false);
      }
    }
    loadOffers();
  }, []);

  /* ── Verify offer via API ── */
  const verifyOffer = async (id: string) => {
    try {
      await api.patch(`/offers/${id}/joining`, { status: 'verified' });
      setOffers(prev => prev.map(o => o.id === id ? { ...o, status: 'verified' } : o));
      toast.success('Offer successfully verified and persisted to records!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify offer');
    }
  };

  /* ── Dynamic KPI calculations ── */
  const kpis = useMemo(() => {
    const verifiedOrAccepted = offers.filter(o => o.status === 'accepted' || o.status === 'verified');
    const totalVerified = verifiedOrAccepted.length;

    const allCtc = offers.map(o => o.ctc_lpa || 0).filter(v => v > 0);
    const highestCtc = allCtc.length > 0 ? Math.max(...allCtc) : 0;
    const avgCtc = allCtc.length > 0 ? allCtc.reduce((s, v) => s + v, 0) / allCtc.length : 0;

    // Find the company with the highest CTC
    const highestOffer = offers.find(o => (o.ctc_lpa || 0) === highestCtc);
    const highestCompany = highestOffer ? `${highestOffer.company} (${highestOffer.tier})` : 'N/A';

    return { totalVerified, highestCtc, avgCtc, highestCompany };
  }, [offers]);

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    return offers.filter(o => {
      const matchesSearch =
        (o.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.company || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.role || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchesTier = tierFilter === 'all' || o.tier === tierFilter;
      return matchesSearch && matchesStatus && matchesTier;
    });
  }, [offers, search, statusFilter, tierFilter]);

  /* ── Export CSV ── */
  const handleExportOffers = () => {
    const headers = ['Student Name', 'Company', 'Role', 'CTC Package', 'Tier', 'Status', 'Date'];
    const rows = filtered.map(o => [
      `"${o.student_name || ''}"`,
      `"${o.company || ''}"`,
      `"${o.role || ''}"`,
      `"${o.ctc || ''}"`,
      `"${o.tier || ''}"`,
      `"${o.status || ''}"`,
      `"${o.date || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `campusgrid_offers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded offers report as CSV');
  };

  /* ── Status badge styling ── */
  const statusStyle = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'verified':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30';
      case 'pending':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30';
      case 'declined':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30';
    }
  };

  /* ── Tier badge styling ── */
  const tierStyle = (tier: string) => {
    switch (tier) {
      case 'Super Dream':
        return 'bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/30';
      case 'Dream':
        return 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-[var(--surface-elevated)] border-[var(--border)] text-[var(--text-secondary)]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 dark:text-emerald-400 mb-1">
            <Award className="h-3.5 w-3.5" />
            <span>Placement Outcomes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Offer Tracker</h1>
          <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-1">
            Record, verify, and track campus job offer letters and compensation packages.
          </p>
        </div>

        <button
          onClick={handleExportOffers}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          Export Offers Report (CSV)
        </button>
      </div>

      {/* Dynamic KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card glass-panel-hover p-4 rounded-2xl">
          <div className="text-xs text-[var(--text-tertiary)] font-semibold">Total Verified / Accepted</div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">
            {loading ? '—' : kpis.totalVerified}
          </div>
          <div className="text-[11px] text-emerald-500 dark:text-emerald-400 mt-0.5">
            {loading ? '…' : `${offers.length} total offers tracked`}
          </div>
        </div>
        <div className="glass-card glass-panel-hover p-4 rounded-2xl">
          <div className="text-xs text-[var(--text-tertiary)] font-semibold">Highest CTC Package</div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">
            {loading ? '—' : `₹${kpis.highestCtc.toFixed(1)} LPA`}
          </div>
          <div className="text-[11px] text-indigo-500 dark:text-indigo-400 mt-0.5">
            {loading ? '…' : kpis.highestCompany}
          </div>
        </div>
        <div className="glass-card glass-panel-hover p-4 rounded-2xl">
          <div className="text-xs text-[var(--text-tertiary)] font-semibold">Average CTC</div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">
            {loading ? '—' : `₹${kpis.avgCtc.toFixed(2)} LPA`}
          </div>
          <div className="text-[11px] text-purple-500 dark:text-purple-400 mt-0.5 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>Computed from {offers.length} offers</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, company, or role..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--muted)] text-xs sm:text-sm focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="accepted">Accepted</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="declined">Declined</option>
          </select>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none"
          >
            <option value="all">All Tiers</option>
            <option value="Super Dream">Super Dream</option>
            <option value="Dream">Dream</option>
            <option value="Regular">Regular</option>
          </select>
        </div>
      </div>

      {/* Offers Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[var(--text-tertiary)] border-b border-[var(--border)] font-semibold bg-[var(--surface-elevated)]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Company & Role</th>
                <th className="py-3 px-4">CTC Package</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--text-secondary)]">
              {loading ? (
                // Skeleton loading rows
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-3.5 px-4"><div className="skeleton h-4 w-28" /></td>
                    <td className="py-3.5 px-4"><div className="skeleton h-4 w-36" /></td>
                    <td className="py-3.5 px-4"><div className="skeleton h-4 w-20" /></td>
                    <td className="py-3.5 px-4"><div className="skeleton h-4 w-16" /></td>
                    <td className="py-3.5 px-4"><div className="skeleton h-4 w-20" /></td>
                    <td className="py-3.5 px-4"><div className="skeleton h-4 w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[var(--text-tertiary)]">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-6 w-6 opacity-40" />
                      <span className="text-sm">No offers match your search or filters.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-[var(--table-hover)] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">{o.student_name}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[var(--text-primary)]">{o.company}</div>
                      <div className="text-[11px] text-[var(--text-tertiary)]">{o.role}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-500 dark:text-emerald-400">{o.ctc}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierStyle(o.tier)}`}>
                        {o.tier}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${statusStyle(o.status)}`}>
                        {o.status === 'pending' ? 'Pending Verification' : o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {o.status === 'pending' ? (
                        <button
                          onClick={() => verifyOffer(o.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Approve Offer
                        </button>
                      ) : (
                        <span className="text-emerald-500 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1 text-[11px]">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer with count */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-[var(--border)] bg-[var(--surface-elevated)] text-[11px] text-[var(--text-tertiary)] flex items-center justify-between">
            <span>Showing {filtered.length} of {offers.length} offers</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last synced: {new Date().toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
