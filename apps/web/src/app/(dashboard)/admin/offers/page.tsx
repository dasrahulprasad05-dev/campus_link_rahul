'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Award, CheckCircle2, Clock, Search, Building, User } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<any[]>([
    { id: '1', student_name: 'Ananya Sharma', company: 'TechNova Solutions', role: 'Software Development Engineer', ctc: '₹14.5 LPA', tier: 'Dream', status: 'Accepted', date: '2026-10-04' },
    { id: '2', student_name: 'Sneha Rao', company: 'Google India', role: 'Associate Software Engineer', ctc: '₹28.0 LPA', tier: 'Super Dream', status: 'Accepted', date: '2026-10-06' },
    { id: '3', student_name: 'Priya Nair', company: 'Microsoft', role: 'Cloud Support Engineer', ctc: '₹18.0 LPA', tier: 'Dream', status: 'Pending Verification', date: '2026-10-09' },
    { id: '4', student_name: 'Kavita Das', company: 'Cognizant', role: 'Programmer Analyst', ctc: '₹4.8 LPA', tier: 'Regular', status: 'Accepted', date: '2026-09-28' },
  ]);

  const verifyOffer = (id: string) => {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, status: 'Verified' } : o));
    toast.success('Offer successfully verified in university records!');
  };

  const handleExportOffers = () => {
    const headers = ['Student Name', 'Company', 'Role', 'CTC Package', 'Tier', 'Status', 'Date'];
    const rows = offers.map(o => [
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
          Export Offers Report (CSV)
        </button>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card glass-panel-hover p-4 rounded-2xl">
          <div className="text-xs text-[var(--text-tertiary)] font-semibold">Total Verified Offers</div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">126</div>
          <div className="text-[11px] text-emerald-500 dark:text-emerald-400 mt-0.5">88.4% of eligible students placed</div>
        </div>
        <div className="glass-card glass-panel-hover p-4 rounded-2xl">
          <div className="text-xs text-[var(--text-tertiary)] font-semibold">Highest CTC Package</div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">₹28.5 LPA</div>
          <div className="text-[11px] text-indigo-500 dark:text-indigo-400 mt-0.5">Google India (Super Dream)</div>
        </div>
        <div className="glass-card glass-panel-hover p-4 rounded-2xl">
          <div className="text-xs text-[var(--text-tertiary)] font-semibold">Average Institutional CTC</div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">₹8.92 LPA</div>
          <div className="text-[11px] text-purple-500 dark:text-purple-400 mt-0.5">+18% vs previous academic batch</div>
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
              {offers.map((o) => (
                <tr key={o.id} className="hover:bg-[var(--table-hover)] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">{o.student_name}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[var(--text-primary)]">{o.company}</div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">{o.role}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-500 dark:text-emerald-400">{o.ctc}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)]">
                      {o.tier}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      o.status === 'Accepted' || o.status === 'Verified'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {o.status === 'Pending Verification' ? (
                      <button
                        onClick={() => verifyOffer(o.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold transition-colors"
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
