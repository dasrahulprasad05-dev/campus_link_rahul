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
      // For security, APIs often still return success or user friendly error
      toast.error(err.message || 'Could not process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/8 shadow-2xl">
      <div className="text-center mb-6">
        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Forgot Password?</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Enter your registered email address to receive a secure reset link.
        </p>
      </div>

      {sent ? (
        <div className="space-y-4 text-center">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs space-y-2">
            <div className="flex items-center justify-center gap-2 font-bold text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <span>Reset Email Dispatched</span>
            </div>
            <p className="leading-relaxed">
              If an account exists for <strong className="text-white font-mono">{email}</strong>, we have sent instructions to reset your password.
            </p>
            <p className="text-[11px] text-emerald-300/80">
              Please check your <strong>Spam / Junk folder</strong> if you do not see it within a couple of minutes.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/25 transition-all inline-block"
            >
              Return to Sign In →
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@campuslink.in"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0b0f19] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Sending Link...' : 'Send Reset Link →'}
          </button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
