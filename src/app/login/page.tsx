'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Users2,
  Building2,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    { label: 'Super Admin', email: 'superadmin@eduvora.com', role: 'Platform Super Admin', color: 'border-purple-500/40 bg-purple-500/10' },
    { label: 'Eduvora Admin', email: 'admin@eduvora.edu', role: 'Dr. Arthur Pendelton (Principal)', color: 'border-indigo-500/40 bg-indigo-500/10' },
    { label: 'Apex Admin', email: 'admin@apex.edu.pk', role: 'Apex Institute Principal', color: 'border-emerald-500/40 bg-emerald-500/10' },
    { label: 'Teacher', email: 'teacher@eduvora.edu', role: 'Prof. Sarah Jenkins', color: 'border-blue-500/40 bg-blue-500/10' },
    { label: 'Accountant', email: 'accountant@eduvora.edu', role: 'Robert Sterling', color: 'border-amber-500/40 bg-amber-500/10' },
    { label: 'Receptionist', email: 'reception@eduvora.edu', role: 'Emily Watson', color: 'border-pink-500/40 bg-pink-500/10' },
    { label: 'Parent Portal', email: 'parent@eduvora.edu', role: 'Michael Vance (Parent)', color: 'border-cyan-500/40 bg-cyan-500/10' },
    { label: 'Student Portal', email: 'student@eduvora.edu', role: 'Lucas Vance (Grade 10)', color: 'border-teal-500/40 bg-teal-500/10' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Authentication failed. Please verify credentials.');
        setLoading(false);
        return;
      }

      // Redirect according to server decision or original target
      const target = redirectTarget || data.redirectTo || '/dashboard';
      router.push(target);
      router.refresh();
    } catch (err: any) {
      setError('Network or server error during sign in. Please try again.');
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans">
      {/* Top Bar */}
      <header className="px-6 py-4 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-500/20">
            EV
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            Eduvora SaaS
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          Back to Public Site
        </Link>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Column: Form */}
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-3">
                <ShieldCheck className="w-3.5 h-3.5" /> Multi-Tenant Authentication
              </div>
              <h2 className="text-2xl font-black text-white">Sign In to Eduvora</h2>
              <p className="text-xs text-slate-400 mt-1">
                Access your institutional dashboard or personal portal.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Official Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@eduvora.edu"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-500 transition-all font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Column: Demo Accounts & Quick Fill */}
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm text-white">One-Click Demo Evaluator</h3>
              </div>
              <p className="text-xs text-slate-400">
                Select any real seeded user account below to prefill credentials and explore that role’s authorized portal:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {demoAccounts.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => fillDemo(d.email)}
                    className={`p-3 rounded-2xl border text-left transition-all hover:scale-[1.02] ${d.color}`}
                  >
                    <p className="font-extrabold text-xs text-white">{d.label}</p>
                    <p className="text-[10px] text-slate-300 truncate mt-0.5">{d.role}</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-1">{d.email}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Multi-tenant data isolation is strictly enforced at the database level for each institution.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-900">
        Eduvora SaaS EMS • Multi-Tenant Education Management Platform • PKR Currency Default
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium">Loading Eduvora Portal...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

