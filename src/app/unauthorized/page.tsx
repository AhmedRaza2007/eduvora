'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-6 shadow-2xl shadow-rose-500/20">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <span className="text-xs font-mono font-bold tracking-widest uppercase text-rose-400 mb-2">
        Error 403 • Access Denied
      </span>

      <h1 className="text-3xl sm:text-4xl font-black mb-3 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
        Unauthorized Area
      </h1>

      <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
        Your current user account does not have permission to view or manage this portal or resource. Access is strictly governed by institutional role-based access control (RBAC).
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/30"
        >
          <LogIn className="w-4 h-4" /> Sign In with Another Account
        </Link>
      </div>
    </div>
  );
}
