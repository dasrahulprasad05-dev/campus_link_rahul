'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  Zap, 
  ArrowRight, 
  User, 
  Mail, 
  Lock, 
  Building, 
  GraduationCap, 
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<'student' | 'recruiter' | 'mentor' | 'admin'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [metaField, setMetaField] = useState(''); // Branch for student, Company for recruiter, Dept for mentor, College for admin
  const [cgpa, setCgpa] = useState('8.0');
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.warning('Please complete all required fields');
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      };

      if (role === 'student') {
        payload.branch = metaField || 'Computer Science & Engineering';
        payload.cgpa = parseFloat(cgpa) || 8.0;
      } else if (role === 'recruiter') {
        payload.company = metaField || 'Tech Solutions Inc';
      } else if (role === 'mentor') {
        payload.department = metaField || 'Computer Science';
      } else if (role === 'admin') {
        payload.college = metaField || 'ABIT Engineering College';
      }

      await api.post('/auth/register', payload);
      setRegisteredEmail(email.trim());
      toast.success('Registration successful! Please verify your email.');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (registeredEmail) {
    return (
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/8 shadow-2xl text-center space-y-5">
        <div className="h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Account Created!</h1>
        <p className="text-xs sm:text-sm text-slate-300">
          We sent a verification link to: <br />
          <strong className="text-white font-mono">{registeredEmail}</strong>
        </p>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs text-left space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertCircle className="h-4 w-4" />
            <span>Check Your Spam / Junk Folder!</span>
          </div>
          <p className="leading-relaxed">
            University firewalls and email providers often route verification emails into your Spam folder. Please click <strong>&quot;Report Not Spam&quot;</strong> and verify your account.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/25 transition-all inline-block"
          >
            Continue to Sign In →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/8 shadow-2xl">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Create your Account</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Join CampusGrid 2.0 placement intelligence network
        </p>
      </div>

      {/* Role Picker */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-300 mb-2">I am registering as a:</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'student', label: 'Student', icon: '🎓' },
            { id: 'recruiter', label: 'Recruiter', icon: '💼' },
            { id: 'mentor', label: 'Mentor', icon: '👨‍🏫' },
            { id: 'admin', label: 'TPO Admin', icon: '🏛️' },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id as any)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                role === r.id
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                  : 'bg-white/3 text-slate-400 border-white/8 hover:bg-white/6 hover:text-white'
              }`}
            >
              <span className="text-base">{r.icon}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ananya Sharma"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0b0f19] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0b0f19] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0b0f19] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        {/* Dynamic Meta Field */}
        {role === 'student' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Branch</label>
              <input
                type="text"
                value={metaField}
                onChange={(e) => setMetaField(e.target.value)}
                placeholder="CSE / IT / ECE"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0f19] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                placeholder="8.50"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0f19] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>
        )}

        {role === 'recruiter' && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company Name</label>
            <input
              type="text"
              value={metaField}
              onChange={(e) => setMetaField(e.target.value)}
              placeholder="e.g. TechNova Solutions"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0f19] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        )}

        {role === 'mentor' && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Academic Department</label>
            <input
              type="text"
              value={metaField}
              onChange={(e) => setMetaField(e.target.value)}
              placeholder="e.g. Department of Computer Science"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0f19] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        )}

        {role === 'admin' && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">College / Institution</label>
            <input
              type="text"
              value={metaField}
              onChange={(e) => setMetaField(e.target.value)}
              placeholder="e.g. ABIT Institute of Technology"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0f19] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Register Account →'}
        </button>
      </form>

      <div className="mt-5 text-center text-xs text-slate-400">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
          Sign In
        </Link>
      </div>
    </div>
  );
}
