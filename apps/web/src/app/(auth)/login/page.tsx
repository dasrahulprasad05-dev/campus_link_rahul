'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/lib/api';
import { 
  Zap, 
  ArrowRight, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const DEMO_CREDENTIALS: Record<string, { role: string; email: string; pass: string; label: string; icon: string }> = {
  student: {
    role: 'student',
    email: 'ananya.sharma@campusgrid.online',
    pass: 'demo123',
    label: 'Student',
    icon: '🎓',
  },
  admin: {
    role: 'admin',
    email: 'admin@campusgrid.online',
    pass: 'demo123',
    label: 'TPO Admin',
    icon: '🏛️',
  },
  recruiter: {
    role: 'recruiter',
    email: 'recruiter@campusgrid.online',
    pass: 'demo123',
    label: 'Recruiter',
    icon: '💼',
  },
  mentor: {
    role: 'mentor',
    email: 'mentor@campusgrid.online',
    pass: 'demo123',
    label: 'Mentor',
    icon: '👨‍🏫',
  },
  super_admin: {
    role: 'super_admin',
    email: 'superadmin@campusgrid.online',
    pass: 'CampusSuper@2026',
    label: 'Super Admin',
    icon: '🛡️',
  },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const fillDemo = (key: string) => {
    const cred = DEMO_CREDENTIALS[key];
    if (cred) {
      setEmail(cred.email);
      setPassword(cred.pass);
      toast.info(`Filled credentials for ${cred.label}`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter both email and password');
      return;
    }

    setLoading(true);
    setUnverifiedEmail(null);

    try {
      const res = await api.post('/auth/login', { email: email.trim(), password });
      if (res && res.token && res.user) {
        setAuth(res.user, res.token);
        toast.success(`Welcome back, ${res.user.name || 'User'}!`);

        const role = res.user.role || 'student';
        if (role === 'super_admin') {
          router.push('/superadmin/dashboard');
        } else if (role === 'admin') {
          router.push('/admin/dashboard');
        } else if (role === 'recruiter') {
          router.push('/recruiter/dashboard');
        } else if (role === 'mentor') {
          router.push('/mentor/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      if (msg.toLowerCase().includes('not verified') || msg.toLowerCase().includes('verification')) {
        setUnverifiedEmail(email.trim());
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: unverifiedEmail });
      toast.success('Verification link resent! Please check your Inbox and Spam folder.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/8 shadow-2xl relative">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Sign in to CampusGrid</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Access your placement intelligence portal
        </p>
      </div>

      {/* Unverified Email Warning */}
      {unverifiedEmail && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertCircle className="h-4 w-4" />
            <span>Account Not Activated</span>
          </div>
          <p className="leading-relaxed">
            Please check your email and <strong>Spam / Junk folder</strong> to click the activation link.
          </p>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resending}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold border border-amber-500/30 transition-colors"
          >
            {resending ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@campusgrid.online"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0b0f19] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0b0f19] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>
      </form>

      <div className="mt-4 text-center text-xs text-slate-400">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
          Create one
        </Link>
      </div>

      {/* 1-Click Demo Accounts */}
      <div className="mt-6 pt-5 border-t border-white/8">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" /> Quick Demo Auto-Fill:
          </span>
          <button
            type="button"
            onClick={() => { setEmail(''); setPassword(''); }}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(DEMO_CREDENTIALS).map(([key, cred]) => (
            <button
              key={key}
              type="button"
              onClick={() => fillDemo(key)}
              className="px-2.5 py-1.5 rounded-lg bg-white/4 hover:bg-white/8 text-slate-300 border border-white/6 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <span>{cred.icon}</span>
              <span>{cred.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center p-8 text-slate-400">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
