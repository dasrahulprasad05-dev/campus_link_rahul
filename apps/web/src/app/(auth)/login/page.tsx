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
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';


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
