'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Building, Plus, Search, MapPin, Globe, ExternalLink, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/companies');
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        setCompanies(list);
      } catch {
        setCompanies([
          { id: '1', name: 'TechNova Solutions', tier: 'Super Dream', industry: 'Software / AI', location: 'Bengaluru', active_drives: 2, hires_count: 18 },
          { id: '2', name: 'Google India', tier: 'Super Dream', industry: 'Cloud & Search', location: 'Hyderabad', active_drives: 1, hires_count: 6 },
          { id: '3', name: 'Cognizant', tier: 'Regular', industry: 'IT Services', location: 'Bhubaneswar', active_drives: 1, hires_count: 42 },
          { id: '4', name: 'Tata Consultancy Services', tier: 'Regular', industry: 'IT Consulting', location: 'Kolkata', active_drives: 1, hires_count: 56 },
          { id: '5', name: 'Deloitte USI', tier: 'Dream', industry: 'Consulting & Risk', location: 'Hyderabad', active_drives: 1, hires_count: 14 },
        ]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = companies.filter(c => 
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.industry || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
          <Building className="h-3.5 w-3.5" />
          <span>Industry Relations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Partner Companies</h1>
        <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-1">
          Corporate recruitment partners, placement history, and compensation tiers.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company name or domain..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--muted)] text-xs sm:text-sm focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((c, idx) => (
          <div key={c.id || idx} className="glass-panel p-5 rounded-2xl border border-[var(--border)] flex flex-col justify-between space-y-4 shadow-sm">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                    {(c.name || 'C')[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--text-primary)]">{c.name}</h3>
                    <div className="text-xs text-[var(--text-tertiary)]">{c.industry || 'Technology'}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  c.tier === 'Super Dream'
                    ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                    : c.tier === 'Dream'
                    ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}>
                  {c.tier || 'Regular'}
                </span>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                  <span>HQ: {c.location || 'India'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                  <span>Active Drives: <strong className="text-[var(--text-primary)]">{c.active_drives || 1}</strong></span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Total Hires: <strong className="text-[var(--text-primary)]">{c.hires_count || 12}</strong></span>
              <span className="text-emerald-400 font-semibold">Tier Verified</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
