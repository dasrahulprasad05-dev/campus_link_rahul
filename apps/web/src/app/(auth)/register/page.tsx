'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  ArrowRight, 
  User, 
  Mail, 
  Lock, 
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

const ROLES = [
  { id: 'student', label: 'Student', icon: '🎓', desc: 'Track placement, practice interviews' },
  { id: 'recruiter', label: 'Recruiter', icon: '💼', desc: 'Post jobs, manage pipelines' },
  { id: 'mentor', label: 'Mentor', icon: '👨‍🏫', desc: 'Guide and review student roadmaps' },
  { id: 'admin', label: 'TPO Admin', icon: '🏛️', desc: 'Manage drives and offers' },
] as const;

type Role = typeof ROLES[number]['id'];

// Emails permanently reserved for institutional/administrative staff — students cannot register with these
const RESERVED_STAFF_EMAILS = [
  'rahulprsaddas@gmail.com',
  'rahulprasaddas1234@gmail.com',
  'ommprasadd363@gmail.com',
  'dasommprasad68@gmail.com',
  'admin@campusgrid.online', 'recruiter@campusgrid.online', 'mentor@campusgrid.online',
  'superadmin@campusgrid.online', 'superadmin@campuslink.in',
  'admin@campuslink.in', 'recruiter@campuslink.in', 'mentor@campuslink.in',
];

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [metaField, setMetaField] = useState('');
  const [cgpa, setCgpa] = useState('8.0');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.warning('Please complete all required fields');
      return;
    }
    if (password.length < 6) {
      toast.warning('Password must be at least 6 characters');
      return;
    }

    // Client-side guard: reserved staff emails cannot be used for student accounts
    if (role === 'student' && RESERVED_STAFF_EMAILS.includes(email.trim().toLowerCase())) {
      toast.error('This email is reserved for institutional/administrative staff and cannot be used for student accounts.');
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
        payload.phone = phone.trim() || '';
      } else if (role === 'recruiter') {
        payload.company = metaField || 'Tech Solutions Inc';
      } else if (role === 'mentor') {
        payload.department = metaField || 'Computer Science';
      } else if (role === 'admin') {
        payload.college = metaField || 'ABIT Engineering College';
      }

      await api.post('/auth/register', payload);
      setRegisteredEmail(email.trim());
      toast.success('Account created! Check your email to verify.');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success State ──────────────────────────────────────────────────
  if (registeredEmail) {
    return (
      <div className="relative">
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-emerald-500/15 via-transparent to-indigo-500/15 pointer-events-none" />
        <div className="relative glass-panel p-7 sm:p-9 rounded-3xl border border-white/10 shadow-2xl shadow-black/40 text-center space-y-5 animate-scale-in">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Account Created!</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              We sent a verification link to:
            </p>
            <p className="font-mono text-sm font-bold text-indigo-300 mt-1 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl inline-block mt-2">
              {registeredEmail}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/8 border border-amber-500/30 text-left space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-xs">
              <AlertCircle className="h-4 w-4" />
              <span>Check Your Spam / Junk Folder!</span>
            </div>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              University firewalls often route verification emails to Spam. Please click{' '}
              <strong>&quot;Not Spam&quot;</strong> and verify your account before signing in.
            </p>
          </div>

          <Link
            href="/login"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all inline-flex items-center justify-center gap-2 btn-lift"
          >
            Continue to Sign In <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ── Registration Form ──────────────────────────────────────────────
  return (
    <div className="relative">
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-indigo-500/20 via-transparent to-violet-500/20 pointer-events-none" />

      <div className="relative glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl shadow-black/40">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center mx-auto mb-4 p-2.5 rounded-2xl bg-white/5 border border-white/10 shadow-xl shadow-cyan-500/10">
            <Image
              src="/logo-icon.png"
              alt="CampusGrid Logo"
              width={56}
              height={56}
              className="h-14 w-14 object-contain drop-shadow-[0_4px_16px_rgba(0,162,238,0.4)]"
              priority
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Create Account</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            Join <span className="text-cyan-400 font-medium">CampusGrid 2.0</span> placement intelligence
          </p>
        </div>

        {/* Role Picker */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-300 mb-2.5">I am registering as:</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                id={`role-${r.id}`}
                onClick={() => { setRole(r.id); setMetaField(''); }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === r.id
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-md shadow-indigo-500/10 scale-[1.02]'
                    : 'bg-white/3 text-slate-400 border-white/8 hover:bg-white/6 hover:text-white hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-base">{r.icon}</span>
                  <span className="text-xs font-bold">{r.label}</span>
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
            <div className={`relative transition-all duration-200 ${focusedField === 'name' ? 'scale-[1.01]' : ''}`}>
              <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focusedField === 'name' ? 'text-indigo-400' : 'text-slate-500'}`} />
              <input
                id="reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g. Ananya Sharma"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/4 border border-white/10 text-white placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white/6 focus:border-indigo-500/60"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
              <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focusedField === 'email' ? 'text-indigo-400' : 'text-slate-500'}`} />
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="you@university.edu"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/4 border border-white/10 text-white placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white/6 focus:border-indigo-500/60"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focusedField === 'password' ? 'text-indigo-400' : 'text-slate-500'}`} />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Min 6 characters"
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

          {/* Dynamic Meta Field */}
          {role === 'student' && (
            <div className="space-y-3 animate-slide-down">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Branch</label>
                  <input
                    type="text"
                    value={metaField}
                    onChange={(e) => setMetaField(e.target.value)}
                    placeholder="CSE / IT / ECE"
                    className="w-full px-3.5 py-3 rounded-xl bg-white/4 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/60 transition-all"
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
                    className="w-full px-3.5 py-3 rounded-xl bg-white/4 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/60 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">📱 WhatsApp Number <span className="text-slate-500 font-normal">(optional — for bot alerts)</span></label>
                <div className={`relative transition-all duration-200 ${focusedField === 'phone' ? 'scale-[1.01]' : ''}`}>
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">+91</span>
                  <input
                    id="reg-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/4 border border-white/10 text-white placeholder-slate-500 text-sm transition-all focus:outline-none focus:bg-white/6 focus:border-emerald-500/60"
                  />
                </div>
                <p className="text-[10px] text-emerald-400/70 mt-1">🤖 Get readiness scores, drive alerts & mock interviews on WhatsApp</p>
              </div>
            </div>
          )}

          {role === 'recruiter' && (
            <div className="animate-slide-down">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company Name</label>
              <input
                type="text"
                value={metaField}
                onChange={(e) => setMetaField(e.target.value)}
                placeholder="e.g. TechNova Solutions"
                className="w-full px-3.5 py-3 rounded-xl bg-white/4 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/60 transition-all"
              />
            </div>
          )}

          {role === 'mentor' && (
            <div className="animate-slide-down">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Academic Department</label>
              <input
                type="text"
                value={metaField}
                onChange={(e) => setMetaField(e.target.value)}
                placeholder="e.g. Department of Computer Science"
                className="w-full px-3.5 py-3 rounded-xl bg-white/4 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/60 transition-all"
              />
            </div>
          )}

          {role === 'admin' && (
            <div className="animate-slide-down">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">College / Institution</label>
              <input
                type="text"
                value={metaField}
                onChange={(e) => setMetaField(e.target.value)}
                placeholder="e.g. ABIT Institute of Technology"
                className="w-full px-3.5 py-3 rounded-xl bg-white/4 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/60 transition-all"
              />
            </div>
          )}

          {/* Note for staff roles */}
          {(role === 'admin' || role === 'mentor' || role === 'recruiter') && (
            <div className="p-3 rounded-xl bg-indigo-500/8 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2 animate-slide-down">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>Staff accounts require email verification <strong>and</strong> Super Admin approval before you can sign in.</span>
            </div>
          )}

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="w-full mt-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed btn-lift"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign In →
          </Link>
        </div>
      </div>
    </div>
  );
}
