'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Compass, 
  Sparkles, 
  Briefcase, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Code2,
  Database,
  Cloud,
  Shield,
  Cpu
} from 'lucide-react';

interface CareerDomain {
  id: string;
  title: string;
  avg_ctc: string;
  demand: string;
  skills: string[];
  companies: string[];
  description: string;
  icon: any;
}

export default function StudentCareerFinderPage() {
  const domains: CareerDomain[] = [
    {
      id: 'data-analyst',
      title: 'Data Analyst & BI Specialist',
      avg_ctc: '₹6.5 - ₹12.0 LPA',
      demand: 'High Growth',
      skills: ['SQL', 'Python', 'Power BI', 'Tableau', 'Excel', 'Statistics'],
      companies: ['TechNova', 'Deloitte', 'Mu Sigma', 'Tiger Analytics', 'Accenture'],
      description: 'Analyze operational trends, design KPI dashboards, and deliver business insights from large-scale structured data.',
      icon: Database,
    },
    {
      id: 'fullstack',
      title: 'Full-Stack Software Engineer',
      avg_ctc: '₹8.0 - ₹16.0 LPA',
      demand: 'Very High',
      skills: ['TypeScript', 'React / Next.js', 'Node.js', 'PostgreSQL', 'Docker', 'REST APIs'],
      companies: ['TCS Digital', 'Infosys', 'Cognizant', 'Razorpay', 'Swiggy'],
      description: 'Build end-to-end web applications, resilient backend microservices, and interactive responsive interfaces.',
      icon: Code2,
    },
    {
      id: 'devops',
      title: 'Cloud & DevOps Engineer',
      avg_ctc: '₹9.0 - ₹18.0 LPA',
      demand: 'Surging',
      skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD Pipelines', 'Linux', 'Terraform'],
      companies: ['CloudScale Systems', 'Oracle', 'Capgemini', 'IBM', 'Red Hat'],
      description: 'Manage cloud infrastructure, container orchestration, high-availability deployments, and security monitoring.',
      icon: Cloud,
    },
    {
      id: 'ai-ml',
      title: 'AI / ML Research Engineer',
      avg_ctc: '₹10.0 - ₹22.0 LPA',
      demand: 'High Premium',
      skills: ['Python', 'PyTorch', 'TensorFlow', 'NLP', 'Computer Vision', 'Mathematics'],
      companies: ['DeepSpark AI', 'Microsoft', 'Google', 'Fractal Analytics', 'Wipro AI'],
      description: 'Train neural models, deploy LLM fine-tuning pipelines, and integrate generative AI capabilities into products.',
      icon: Cpu,
    },
  ];

  const [selectedDomain, setSelectedDomain] = useState<CareerDomain>(domains[0]);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Industry Career Alignment Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Career Path Finder</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Explore key placement domains, target compensation bands, required skill stacks, and hiring companies.
        </p>
      </div>

      {/* Domain Cards Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {domains.map(d => {
          const Icon = d.icon;
          const isSelected = selectedDomain.id === d.id;
          return (
            <div
              key={d.id}
              onClick={() => setSelectedDomain(d)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-start gap-4 ${
                isSelected
                  ? 'bg-indigo-950/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                  : 'glass-panel border-white/8 hover:border-white/15'
              }`}
            >
              <div className={`p-3 rounded-2xl shrink-0 ${
                isSelected
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-white/5 text-slate-300'
              }`}>
                <Icon className="h-5 w-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-white">{d.title}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                    {d.demand}
                  </span>
                </div>
                <div className="text-xs text-indigo-300 font-semibold mt-1">{d.avg_ctc}</div>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {d.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Domain Deep Dive */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 via-slate-900 to-slate-900/60 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/8">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Pathway Profile</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">{selectedDomain.title}</h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/student/roadmap"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Build 8-Week Roadmap</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Required Skills Grid */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Essential Skill Requirements</h3>
          <div className="flex flex-wrap gap-2">
            {selectedDomain.skills.map(s => (
              <span
                key={s}
                className="px-3 py-1.5 rounded-xl bg-white/4 border border-white/8 text-xs font-semibold text-slate-200"
              >
                ✓ {s}
              </span>
            ))}
          </div>
        </div>

        {/* Visiting Companies */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Frequent Campus Recruiters</h3>
          <div className="flex flex-wrap gap-2">
            {selectedDomain.companies.map(c => (
              <span
                key={c}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300"
              >
                🏢 {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
