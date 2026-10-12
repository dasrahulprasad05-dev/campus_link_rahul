'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Briefcase, Plus, MapPin, Users, Calendar, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Bengaluru / Hybrid');
  const [packageLpa, setPackageLpa] = useState('₹14.0 - ₹18.0 LPA');
  const [skills, setSkills] = useState('Python, SQL, React, DSA');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setJobs(list);
    } catch {
      setJobs([
        { id: '1', title: 'Data Analyst & ML Associate', department: 'Analytics', location: 'Bengaluru / Hybrid', package: '₹14.5 LPA', skills: ['Python', 'SQL', 'Tableau', 'Pandas'], applicants_count: 24, status: 'Open' },
        { id: '2', title: 'Full Stack Software Engineer', department: 'Product Engg', location: 'Hyderabad / Virtual', package: '₹16.0 LPA', skills: ['React', 'Node.js', 'PostgreSQL', 'DSA'], applicants_count: 38, status: 'Open' },
        { id: '3', title: 'Cloud Infrastructure Associate', department: 'DevOps & SRE', location: 'Pune', package: '₹12.0 LPA', skills: ['Linux', 'Docker', 'AWS', 'Python'], applicants_count: 14, status: 'Open' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.warning('Please enter job title');
      return;
    }

    setCreating(true);
    try {
      await api.post('/jobs', {
        title,
        department,
        location,
        package: packageLpa,
        skills: skills.split(',').map(s => s.trim()),
        description,
        status: 'Open',
      });
      toast.success('Job posted! Real-time notice sent to eligible students.');
      setShowModal(false);
      setTitle('');
      setDescription('');
      fetchJobs();
    } catch (err: any) {
      toast.error(err.message || 'Failed to post job');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-1">
            <Briefcase className="h-3.5 w-3.5" />
            <span>Open Requisitions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Job Postings</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Post campus vacancies. Creating a job automatically broadcasts a live alert to students.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Post New Job
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {jobs.map((j, i) => (
          <div key={j.id || i} className="glass-panel p-5 rounded-2xl border border-white/8 flex flex-col justify-between space-y-4 hover:border-purple-500/30 transition-all">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">{j.title}</h3>
                  <div className="text-xs text-purple-400 font-medium">{j.department || 'Engineering'}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  {j.status || 'Open'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  <span>{j.location || 'India / Hybrid'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-300">Package:</span>
                  <span className="font-mono font-bold text-emerald-400">{j.package || '₹14.0 LPA'}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {(j.skills || ['Python', 'SQL']).map((sk: string, idx: number) => (
                  <span key={idx} className="px-1.5 py-0.5 rounded bg-white/4 border border-white/6 text-[10px] text-slate-300">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/6 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                <strong className="text-white">{j.applicants_count || 18}</strong> Applicants
              </span>
              <span className="text-purple-400 font-semibold text-[11px]">Active Funnel</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Post New Job Vacancy</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Associate Machine Learning Engineer"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0b0f19] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0b0f19] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Compensation</label>
                  <input
                    type="text"
                    value={packageLpa}
                    onChange={(e) => setPackageLpa(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0b0f19] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Skills (comma-separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Python, PyTorch, SQL, Git"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0b0f19] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Job Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Responsibilities, eligibility thresholds, and hiring rounds..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0b0f19] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-white/4 hover:bg-white/8 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {creating ? 'Posting...' : 'Post Job & Broadcast Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
