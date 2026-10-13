'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="relative">
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-rose-500/15 via-transparent to-orange-500/15 pointer-events-none" />
        <div className="relative glass-panel p-7 sm:p-9 rounded-3xl border border-white/10 shadow-2xl shadow-black/40 text-center space-y-5">
          <div className="h-14 w-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Invalid Reset Link</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xs mx-auto">
              No password reset token found in the URL, or the link has already expired.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all inline-flex items-center justify-center gap-2 btn-lift"
          >
            Request New Reset Link <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.warning('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      toast.warning('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Note: backend expects 'newPassword' field (not 'password')
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      toast.success('Password updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative">
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-emerald-500/15 via-transparent to-indigo-500/15 pointer-events-none" />
        <div className="relative glass-panel p-7 sm:p-9 rounded-3xl border border-white/10 shadow-2xl shadow-black/40 text-center space-y-5 animate-scale-in">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Password Updated!</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              Your new password has been saved securely. You can now sign in.
            </p>
          </div>
          <Link
            href="/login"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all inline-flex items-center justify-center gap-2 btn-lift"
          >
            Sign In with New Password <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-indigo-500/20 via-transparent to-violet-500/20 pointer-events-none" />

      <div className="relative glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl shadow-black/40">
        <div className="text-center mb-7">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30 animate-pulse-glow">
            <KeyRound className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Set New Password</h1>
          {email && (
            <p className="text-xs text-slate-400 mt-1.5">
              For: <span className="font-mono text-indigo-300 font-semibold">{email}</span>
            </p>
          )}
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
            <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focusedField === 'password' ? 'text-indigo-400' : 'text-slate-500'}`} />
              <input
                id="reset-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Min 6 characters"
                required
                autoFocus
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

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
            <div className={`relative transition-all duration-200 ${focusedField === 'confirm' ? 'scale-[1.01]' : ''}`}>
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focusedField === 'confirm' ? 'text-indigo-400' : 'text-slate-500'}`} />
              <input
                id="reset-confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocusedField('confirm')}
                onBlur={() => setFocusedField(null)}
                placeholder="Re-enter password"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/4 border border-white/10 text-white placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white/6 focus:border-indigo-500/60"
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Passwords don&apos;t match
              </p>
            )}
            {confirmPassword && password === confirmPassword && confirmPassword.length >= 6 && (
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Passwords match
              </p>
            )}
          </div>

          <button
            id="reset-submit"
            type="submit"
            disabled={loading || (confirmPassword.length > 0 && password !== confirmPassword)}
            className="w-full mt-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed btn-lift"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>Save New Password</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center text-slate-400 text-sm animate-pulse">
        Loading reset form...
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
