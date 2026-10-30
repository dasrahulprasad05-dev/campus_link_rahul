import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Animated background orbs */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px] animate-orb-drift"
          style={{ animationDuration: '15s' }}
        />
        <div
          className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-violet-600/8 blur-[140px] animate-orb-drift"
          style={{ animationDuration: '20s', animationDelay: '-7s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[400px] rounded-full bg-indigo-500/5 blur-[100px] animate-orb-drift"
          style={{ animationDuration: '25s', animationDelay: '-12s' }}
        />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(to right, rgba(99,102,241,1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Top Navbar */}
      <header className="border-b border-white/5 bg-[#080c14]/60 backdrop-blur-xl px-4 sm:px-8 h-16 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-9 w-9 flex items-center justify-center transition-transform group-hover:scale-105">
            <Image
              src="/logo-icon.png"
              alt="CampusGrid Logo"
              width={36}
              height={36}
              className="h-9 w-9 object-contain drop-shadow-[0_2px_10px_rgba(0,162,238,0.35)]"
              priority
            />
          </div>
          <div>
            <span className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
              CampusGrid{' '}
              <span className="text-[11px] font-black px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                2.0
              </span>
            </span>
          </div>
        </Link>
        <Link
          href="/"
          className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          ← Back to Overview
        </Link>
      </header>

      {/* Main Auth Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-md animate-slide-up">
          {/* Feature pills above the card */}
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            {['AI Interview Coach', 'Resume Matcher', 'Real-Time Drives'].map((feat, i) => (
              <span
                key={feat}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/4 border border-white/8 text-slate-400"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {feat}
              </span>
            ))}
          </div>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 px-4 text-center text-xs text-slate-500 relative z-10 flex items-center justify-center gap-2 flex-wrap">
        <Image src="/logo-icon.png" alt="CampusGrid" width={16} height={16} className="h-4 w-4 object-contain inline" />
        <span>CampusGrid 2.0 Placement Intelligence</span>
        <span className="mx-2 text-white/20">•</span>
        <span>100% Free Tier Architecture</span>
        <span className="mx-2 text-white/20">•</span>
        <span className="text-cyan-400">campusgrid.online</span>
      </footer>
    </div>
  );
}
