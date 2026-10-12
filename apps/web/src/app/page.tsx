import Link from 'next/link';
import { 
  Zap, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  BarChart3, 
  FileText, 
  Mic, 
  Map, 
  Compass, 
  Bell, 
  Users, 
  Building, 
  Award,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function HomePage() {
  const stats = [
    { value: '842+', label: 'Students Tracked', highlight: 'Active Talent Pool' },
    { value: '78%', label: 'Avg. Readiness Score', highlight: 'Benchmark Level' },
    { value: '126', label: 'Offers This Cycle', highlight: '100% Verified' },
    { value: '14', label: 'Active Placement Drives', highlight: 'Top Tech & Core' },
  ];

  const features = [
    {
      icon: Bell,
      title: 'Real-Time Notice Board',
      desc: 'Instant SSE streaming notifies students the exact second TPO posts a drive, recruiter updates rounds, or mentor assigns tasks.',
      badge: 'Live Stream',
    },
    {
      icon: BarChart3,
      title: 'Multi-Round Stage Tracker',
      desc: 'Candidate progression tracking from Aptitude to Tech R1, Tech R2, HR, and Offer letters with audit trails.',
      badge: 'Pipeline',
    },
    {
      icon: FileText,
      title: 'Text-Only Resume Matcher',
      desc: 'ATS score matching against company JDs without external file uploads. 100% free-tier architecture with zero cloud storage costs.',
      badge: 'Free Tier',
    },
    {
      icon: Mic,
      title: 'AI Mock Interview Coach',
      desc: 'Interactive STAR methodology evaluation providing real-time feedback on technical depth and behavioral answers.',
      badge: 'STAR Model',
    },
    {
      icon: Compass,
      title: 'Career Path Finder',
      desc: 'Match your strengths, coursework, and technical skills against market roles like Full-Stack, AI/ML, and Cloud DevOps.',
      badge: 'Personalized',
    },
    {
      icon: Map,
      title: 'Intelligent Roadmaps',
      desc: 'Weekly milestone-driven preparation paths that automatically update as students complete topics and projects.',
      badge: 'Adaptive',
    },
  ];

  const portals = [
    {
      role: 'student',
      title: 'Student Portal',
      desc: 'Track readiness scores, explore drives, receive real-time notices, and practice mock interviews.',
      icon: Users,
      color: 'from-blue-600/20 to-indigo-600/20 text-indigo-400 border-indigo-500/30',
      href: '/login?role=student',
    },
    {
      role: 'admin',
      title: 'TPO Admin Portal',
      desc: 'Schedule drives, broadcast instant student alerts, coordinate interview rounds, and manage campus offers.',
      icon: Building,
      color: 'from-emerald-600/20 to-teal-600/20 text-emerald-400 border-emerald-500/30',
      href: '/login?role=admin',
    },
    {
      role: 'recruiter',
      title: 'Recruiter Funnel',
      desc: 'Shortlist applicants, manage multi-round technical interview pipelines, and issue verified job offers.',
      icon: Zap,
      color: 'from-purple-600/20 to-violet-600/20 text-purple-400 border-purple-500/30',
      href: '/login?role=recruiter',
    },
    {
      role: 'mentor',
      title: 'Mentor Center',
      desc: 'Monitor mentee readiness, review roadmaps, identify at-risk students, and dispatch interventions.',
      icon: ShieldCheck,
      color: 'from-amber-600/20 to-orange-600/20 text-amber-400 border-amber-500/30',
      href: '/login?role=mentor',
    },
  ];

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#080c14]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                CampusGrid <span className="text-[11px] font-black px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">2.0</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-[450px] w-[650px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-transparent blur-[120px] rounded-full pointer-events-none" />
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold shadow-inner">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Enterprise AI Campus Placement Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Transform Campus Recruitment With{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Real-Time AI Precision
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Unify TPO operations, track multi-round interview stages, calculate explainable student readiness scores, and broadcast instant live drive notices — built on a 100% free-tier architecture.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
            >
              Access Portals & Demo <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/6 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              Register University Account
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 sm:pt-16 max-w-4xl mx-auto">
            {stats.map((s, i) => (
              <div key={i} className="p-4 sm:p-5 rounded-2xl bg-white/3 border border-white/8 backdrop-blur-sm text-left">
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{s.value}</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">{s.label}</div>
                <div className="text-[11px] text-indigo-400 font-medium mt-0.5">{s.highlight}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Portals Section */}
      <section className="py-16 sm:py-24 border-t border-white/8 bg-[#0b0f19]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">Four Portals, One Unified Grid</div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">Built For Every Campus Stakeholder</h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2">
              Tailored workspaces engineered specifically for student career acceleration, placement coordination, recruiter pipelines, and faculty mentorship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portals.map((p, i) => {
              const Icon = p.icon;
              return (
                <Link
                  key={i}
                  href={p.href}
                  className="group p-6 rounded-2xl bg-white/3 hover:bg-white/6 border border-white/8 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-tr ${p.color} border flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{p.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">{p.desc}</p>
                  </div>
                  <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                    <span>Enter Workspace</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-24 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">Locked Placement Intelligence</div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">Everything You Need For 100% Placement Success</h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2">
              From automated SSE live alerts to multi-round candidate tracking and zero-cost text ATS matching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-6 rounded-2xl bg-white/3 border border-white/8 hover:border-white/15 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 bg-[#0b0f19] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-white">CampusGrid 2.0</span>
            <span>— Explainable Campus Placement Intelligence</span>
          </div>
          <div>
            Zero Cloud File Cost Architecture • 100% Free Tier Compatible
          </div>
        </div>
      </footer>
    </div>
  );
}
