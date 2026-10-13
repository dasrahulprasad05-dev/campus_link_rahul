'use client';

import { useState, useEffect, Suspense } from 'react';
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
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

const DEMO_CREDENTIALS: Record<string, { role: string; email: string; pass: string; label: string; icon: string; color: string }> = {
  student: {
    role: 'student',
    email: 'ananya.sharma@campusgrid.online',
    pass: 'demo123',
    label: 'Student',
    icon: '🎓',
    color: 'from-blue-600/20 to-indigo-600/20 border-indigo-500/30 text-indigo-300 hover:border-indigo-400/50',
  },
  admin: {
    role: 'admin',
    email: 'admin@campusgrid.online',
    pass: 'demo123',
    label: 'TPO Admin',
    icon: '🏛️',
    color: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/30 text-emerald-300 hover:border-emerald-400/50',
  },
  recruiter: {
    role: 'recruiter',
    email: 'recruiter@campusgrid.online',
    pass: 'demo123',
    label: 'Recruiter',
    icon: '💼',
    color: 'from-purple-600/20 to-violet-600/20 border-purple-500/30 text-purple-300 hover:border-purple-400/50',
  },
  mentor: {
    role: 'mentor',
    email: 'mentor@campusgrid.online',
    pass: 'demo123',
    label: 'Mentor',
    icon: '👨‍🏫',
    color: 'from-amber-600/20 to-orange-600/20 border-amber-500/30 text-amber-300 hover:border-amber-400/50',
  },
  super_admin: {
    role: 'super_admin',
    email: 'superadmin@campusgrid.online',
    pass: 'CampusSuper@2026',
    label: 'Super Admin',
    icon: '🛡️',
    color: 'from-rose-600/20 to-pink-600/20 border-rose-500/30 text-rose-300 hover:border-rose-400/50',
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
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('logged_out') === '1') {
      toast.success('Signed out of CampusGrid successfully.');
    }
  }, [searchParams]);

  const fillDemo = (key: string) => {
    const cred = DEMO_CREDENTIALS[key];
    if (cred) {
      setEmail(cred.email);
      setPassword(cred.pass);
      toast.info(`Loaded ${cred.label} demo credentials`, { duration: 2000 });
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
        toast.success(`Welcome back, ${res.user.name || 'User'}! 🎉`);

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
      // Check for demo account fallback if API is offline or returns error
      const normalizedEmail = email.trim().toLowerCase();
      const demoUserMap: Record<string, any> = {
        'admin@campusgrid.online': { id: 'usr-admin-01', name: 'Training & Placement Officer', email: 'admin@campusgrid.online', role: 'admin' },
        'ananya.sharma@campusgrid.online': { id: 'usr-student-01', name: 'Ananya Sharma', email: 'ananya.sharma@campusgrid.online', role: 'student' },
        'recruiter@campusgrid.online': { id: 'usr-recruiter-01', name: 'Priya Sharma (TechNova)', email: 'recruiter@campusgrid.online', role: 'recruiter' },
        'mentor@campusgrid.online': { id: 'usr-mentor-01', name: 'Dr. Rajesh Khanna', email: 'mentor@campusgrid.online', role: 'mentor' },
        'superadmin@campusgrid.online': { id: 'usr-super-01', name: 'Platform Super Admin', email: 'superadmin@campusgrid.online', role: 'super_admin' },
      };

      const fallback = demoUserMap[normalizedEmail];
      if (fallback && (password === 'demo123' || password === 'CampusSuper@2026')) {
        const demoToken = 'demo-jwt-' + Date.now();
        setAuth(fallback, demoToken);
        toast.success(`Welcome back, ${fallback.name}! 🎉`);

        if (fallback.role === 'super_admin') router.push('/superadmin/dashboard');
        else if (fallback.role === 'admin') router.push('/admin/dashboard');
        else if (fallback.role === 'recruiter') router.push('/recruiter/dashboard');
        else if (fallback.role === 'mentor') router.push('/mentor/dashboard');
        else router.push('/student/dashboard');
        return;
      }

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
      toast.success('Verification link resent! Check your Inbox and Spam folder.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative">
      {/* Outer glow ring */}
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-indigo-500/20 via-transparent to-violet-500/20 pointer-events-none" />
      
      <div className="relative glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl shadow-black/40">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30 animate-pulse-glow">
            <Zap className="h-7 w-7 text-white fill-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Sign in</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            Access your <span className="text-indigo-400 font-medium">CampusGrid</span> placement portal
          </p>
        </div>

        {/* Unverified Email Warning */}
        {unverifiedEmail && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-500/8 border border-amber-500/30 text-amber-200 text-xs space-y-2.5 animate-slide-down">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <AlertCircle className="h-4 w-4" />
              <span>Email Not Verified</span>
            </div>
            <p className="leading-relaxed text-amber-200/80">
              Click the link in your email (check <strong>Spam / Junk</strong> too) to activate your account.
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending}
              className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 text-xs font-semibold border border-amber-500/30 transition-all disabled:opacity-50"
            >
              {resending ? 'Sending...' : '↻ Resend Verification Email'}
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Email Address</label>
            <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
              <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focusedField === 'email' ? 'text-indigo-400' : 'text-slate-500'}`} />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="you@campusgrid.online"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/4 border border-white/10 text-white placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white/6 focus:border-indigo-500/60"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focusedField === 'password' ? 'text-indigo-400' : 'text-slate-500'}`} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/4 border border-white/10 text-white placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white/6 focus:border-indigo-500/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full mt-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed btn-lift"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Sign In to Portal</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Create one free →
          </Link>
        </div>

        {/* 1-Click Demo Quick-Fill */}
        <div className="mt-6 pt-5 border-t border-white/8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Quick Demo Fill
            </span>
            <button
              type="button"
              onClick={() => { setEmail(''); setPassword(''); }}
              className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(DEMO_CREDENTIALS).map(([key, cred]) => (
              <button
                key={key}
                id={`demo-${key}`}
                type="button"
                onClick={() => fillDemo(key)}
                className={`px-2.5 py-2 rounded-xl bg-gradient-to-br ${cred.color} border text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-[1.03] active:scale-[0.98]`}
              >
                <span className="text-sm">{cred.icon}</span>
                <span>{cred.label}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-2.5 text-center">
            Demo accounts use password: <code className="font-mono text-indigo-400">demo123</code>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center text-slate-400 text-sm animate-pulse">
        Loading sign in...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
