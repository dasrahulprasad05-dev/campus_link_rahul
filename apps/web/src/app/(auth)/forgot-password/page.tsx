'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Mail, ArrowRight, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.warning('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
      toast.success('Password reset link sent! Check your inbox.');
    } catch (err: any) {
      toast.error(err.message || 'Could not process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-indigo-500/20 via-transparent to-violet-500/20 pointer-events-none" />

      <div className="relative glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl shadow-black/40">
        <div className="text-center mb-7">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30 animate-pulse-glow">
            <KeyRound className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Forgot Password?</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-xs mx-auto">
            Enter your registered email and we&apos;ll send a secure reset link.
          </p>
        </div>

        {sent ? (
          <div className="space-y-5 text-center animate-scale-in">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">Check Your Inbox</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2">
                If an account exists for{' '}
                <span className="font-mono font-bold text-indigo-300">{email}</span>,
                {' '}we&apos;ve sent password reset instructions.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/25 text-xs text-amber-300 text-left">
              ⚠️ Check your <strong>Spam / Junk folder</strong> if you don&apos;t see it within a few minutes.
            </div>

            <Link
              href="/login"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all inline-flex items-center justify-center gap-2 btn-lift"
            >
              Return to Sign In <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registered Email Address
              </label>
              <div className={`relative transition-all duration-200 ${focused ? 'scale-[1.01]' : ''}`}>
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focused ? 'text-indigo-400' : 'text-slate-500'}`} />
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="you@campusgrid.online"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/4 border border-white/10 text-white placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white/6 focus:border-indigo-500/60"
                />
              </div>
            </div>

            <button
              id="forgot-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed btn-lift"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors py-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
