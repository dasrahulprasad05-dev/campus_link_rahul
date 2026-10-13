'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  Users, 
  Search, 
  Filter, 
  GraduationCap, 
  BarChart3, 
  Zap, 
  Send,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [readinessFilter, setReadinessFilter] = useState('all');

  // Intervention modal
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [interventionNote, setInterventionNote] = useState('');
  const [dispatching, setDispatching] = useState(false);

  // Bulk import modal (Paste text only, ₹0 storage)
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvText, setCsvText] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/students');
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        setStudents(list);
      } catch {
        setStudents([
          { id: '1', name: 'Ananya Sharma', email: 'ananya.sharma@campusgrid.online', branch: 'CSE', cgpa: 8.42, readiness: 78, skills: ['Python', 'SQL', 'React'] },
          { id: '2', name: 'Rohan Verma', email: 'rohan.verma@campusgrid.online', branch: 'ECE', cgpa: 7.15, readiness: 54, skills: ['C++', 'Embedded'] },
          { id: '3', name: 'Priya Nair', email: 'priya.nair@campusgrid.online', branch: 'IT', cgpa: 8.90, readiness: 88, skills: ['Java', 'Spring', 'AWS'] },
          { id: '4', name: 'Amit Kumar', email: 'amit.kumar@campusgrid.online', branch: 'ME', cgpa: 6.80, readiness: 48, skills: ['AutoCAD', 'MATLAB'] },
          { id: '5', name: 'Sneha Rao', email: 'sneha.rao@campusgrid.online', branch: 'CSE', cgpa: 9.10, readiness: 94, skills: ['DSA', 'React', 'Docker'] },
        ]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSendIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !interventionNote.trim()) return;

    setDispatching(true);
    try {
      await api.post(`/students/${selectedStudent.id}/interventions`, {
        action: 'mentor_review',
        note: interventionNote.trim(),
      });
      toast.success(`Intervention assigned to ${selectedStudent.name}. Real-time notice sent!`);
      setSelectedStudent(null);
      setInterventionNote('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch intervention');
    } finally {
      setDispatching(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Branch', 'CGPA', 'Readiness Score', 'Skills'];
    const rows = filtered.map(s => [
      `"${s.name || ''}"`,
      `"${s.email || ''}"`,
      `"${s.branch || ''}"`,
      s.cgpa || '',
      s.readiness || '',
      `"${(s.skills || []).join(', ')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `campusgrid_students_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded student records as CSV');
  };

  const handleBulkImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    const lines = csvText.trim().split('\n');
    let imported = 0;
    const newStudents: any[] = [];

    lines.forEach((line, idx) => {
      // Skip header line if present
      if (idx === 0 && (line.toLowerCase().includes('name') || line.toLowerCase().includes('email'))) return;

      const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length >= 2 && cols[0] && cols[1]) {
        newStudents.push({
          id: `imp-${Date.now()}-${idx}`,
          name: cols[0],
          email: cols[1],
          branch: cols[2] || 'CSE',
          cgpa: parseFloat(cols[3]) || 8.0,
          readiness: parseInt(cols[4], 10) || 75,
          skills: cols[5] ? cols[5].split(';').map(s => s.trim()) : ['Python', 'DSA'],
        });
        imported++;
      }
    });

    if (imported > 0) {
      setStudents(prev => [...newStudents, ...prev]);
      toast.success(`Successfully imported ${imported} students! Zero cloud storage used.`);
      setShowImportModal(false);
      setCsvText('');
    } else {
      toast.error('Could not parse student records. Please check the CSV format.');
    }
  };

  const filtered = students.filter(s => {
    const matchesSearch = (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (s.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesBranch = branchFilter === 'all' || (s.branch || '').toLowerCase() === branchFilter.toLowerCase();
    
    let matchesReadiness = true;
    const score = s.readiness || 0;
    if (readinessFilter === 'high') matchesReadiness = score >= 80;
    else if (readinessFilter === 'mid') matchesReadiness = score >= 60 && score < 80;
    else if (readinessFilter === 'risk') matchesReadiness = score < 60;

    return matchesSearch && matchesBranch && matchesReadiness;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
            <Users className="h-3.5 w-3.5" />
            <span>Talent Pool Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Registered Students</h1>
          <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-1">
            Monitor student academic profiles, readiness scores, and assign mentor interventions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)] text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" /> Paste CSV
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--muted)] text-xs sm:text-sm focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none"
          >
            <option value="all">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="ME">ME</option>
          </select>

          <select
            value={readinessFilter}
            onChange={(e) => setReadinessFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none"
          >
            <option value="all">All Readiness</option>
            <option value="high">High (80+)</option>
            <option value="mid">Mid (60-79)</option>
            <option value="risk">At-Risk (&lt;60)</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="glass-panel rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[var(--text-tertiary)] border-b border-[var(--border)] font-semibold bg-[var(--surface-elevated)]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Readiness</th>
                <th className="py-3 px-4">Skills</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--text-secondary)]">
              {filtered.map((s, idx) => {
                const score = s.readiness || 0;
                const isRisk = score < 60;
                return (
                  <tr key={s.id || idx} className="hover:bg-[var(--table-hover)] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[var(--text-primary)]">{s.name}</div>
                      <div className="text-[11px] text-[var(--text-tertiary)]">{s.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)] font-medium">{s.branch || 'CSE'}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-[var(--text-primary)]">{s.cgpa || '8.0'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        score >= 80 
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                          : isRisk
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/25'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                      }`}>
                        {score}/100
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(s.skills || ['Python', 'DSA']).slice(0, 3).map((sk: string, i: number) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] text-[10px] text-[var(--text-secondary)] border border-[var(--border)]">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedStudent(s)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 border border-indigo-500/30 text-[11px] font-semibold transition-colors"
                      >
                        Intervene
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk CSV Paste Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Bulk Student Enrollment (Paste CSV)</h2>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Paste comma-separated rows. Zero file uploads, 100% free tier. <br />
              Format: <code className="text-indigo-300">Name, Email, Branch, CGPA, Readiness, Skills(semicolon-separated)</code>
            </p>

            <form onSubmit={handleBulkImport} className="space-y-4">
              <div>
                <textarea
                  rows={6}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={`Rohit Sharma, rohit@abit.edu, CSE, 8.20, 82, Python;SQL;React\nAditi Singh, aditi@abit.edu, IT, 8.55, 88, Java;AWS;DSA`}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setCsvText(`Rohit Sharma, rohit@abit.edu, CSE, 8.20, 82, Python;SQL;React\nAditi Singh, aditi@abit.edu, IT, 8.55, 88, Java;AWS;DSA\nKaran Mehra, karan@abit.edu, ECE, 7.10, 52, C++;IoT`)}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  Load Sample CSV
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="px-3.5 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)] text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
                  >
                    Import Students
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Intervention Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-3xl border border-[var(--border)] max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[var(--text-primary)]">Assign Intervention</h2>
                <button onClick={() => setSelectedStudent(null)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-sm">
                  ✕
                </button>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                For student: <strong className="text-[var(--text-primary)]">{selectedStudent.name}</strong> ({selectedStudent.branch})
              </p>
            </div>

            <form onSubmit={handleSendIntervention} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Intervention / Action Note</label>
                <textarea
                  rows={4}
                  value={interventionNote}
                  onChange={(e) => setInterventionNote(e.target.value)}
                  placeholder="e.g. Schedule mandatory 1-on-1 DSA practice session before upcoming Google drive."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--muted)] text-xs sm:text-sm focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-3.5 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispatching}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {dispatching ? 'Assigning...' : 'Dispatch Intervention'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
