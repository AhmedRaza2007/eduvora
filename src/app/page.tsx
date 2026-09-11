'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  ShieldCheck,
  Zap,
  Users,
  CreditCard,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  School,
  Building2,
  BookOpenCheck,
  ChevronRight,
  Globe,
  Sparkles,
  Award,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500 selection:text-white font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/30">
              EV
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              Eduvora
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#institutions" className="hover:text-white transition-colors">Institutions</a>
            <a href="#benefits" className="hover:text-white transition-colors">Benefits</a>
            <a href="#preview" className="hover:text-white transition-colors">Dashboard Preview</a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-600/30 hover:scale-105 flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-amber-400" /> Next-Generation Education SaaS Platform
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.15] max-w-5xl mx-auto">
            Everything Your Institution Needs,{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              In One Powerful Platform.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Empower Schools, Colleges, Universities, and Academies with complete automated management for Students, Attendance, Fees, Salaries, Exams, Timetables, and Financial Performance.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:scale-105 transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-3"
            >
              Explore Live Dashboard <ChevronRight className="w-5 h-5" />
            </Link>
            <a
              href="#preview"
              className="px-8 py-4 rounded-2xl text-base font-bold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-2"
            >
              Watch Interactive Demo
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { label: 'Modules Built-In', value: '19+ Real Modules' },
              { label: 'Role Security', value: '6 RBAC Roles' },
              { label: 'Multi-Tenant', value: 'SaaS Isolated' },
              { label: 'Uptime Guarantee', value: '99.9% Reliable' },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <p className="text-xl font-black text-indigo-400">{stat.value}</p>
                <p className="text-xs text-slate-400 font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Institution Types */}
      <section id="institutions" className="py-20 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">Built For Every Academic Structure</h2>
            <p className="mt-3 text-slate-400">Tailored terminology and dynamic structures supporting K-12 schools, higher-ed colleges, universities, and specialized academies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'K-12 Schools', desc: 'Manage daily attendance, homework, report cards, parent communication, and fee receipts.', icon: School, color: 'from-blue-500 to-indigo-600' },
              { title: 'Degree Colleges', desc: 'Support semester courses, department heads, faculty rosters, lab fees, and cumulative GPA.', icon: Building2, color: 'from-purple-500 to-pink-600' },
              { title: 'Universities', desc: 'Multi-branch campus isolation, faculty timetables, research documents, and audit reports.', icon: GraduationCap, color: 'from-emerald-500 to-teal-600' },
              { title: 'Coaching Academies', desc: 'Batch management, quick roll admissions, monthly fee collection, and test rankings.', icon: BookOpenCheck, color: 'from-amber-500 to-orange-600' },
            ].map((inst, i) => (
              <div key={i} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all group hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${inst.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                  <inst.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{inst.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">{inst.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section id="features" className="py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">Comprehensive Enterprise Modules</h2>
            <p className="mt-3 text-slate-400">Everything needed to run smooth institutional operations without clunky legacy software.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Student CRUD & 8-Tab Profile', desc: 'Full student history, attendance, fees, exams, documents, parent info, and activity log.', icon: Users },
              { title: 'Smart Attendance Grid', desc: 'Class-wise marking, teacher restriction rules, duplicate prevention, and monthly analytics.', icon: Zap },
              { title: 'Fee Invoices & Payments', desc: 'Custom invoice creation, partial payment collection, auto balance calculator, and printable receipts.', icon: CreditCard },
              { title: 'Teacher & Staff Management', desc: 'Complete staff rosters, subject assignments, salary histories, and qualification documents.', icon: GraduationCap },
              { title: 'Financial Expense & Salary Engine', desc: 'Net Salary calculator (Base + Bonus - Deduction - Advance) and expense categorization.', icon: BarChart3 },
              { title: 'Exams & Result Card Generator', desc: 'Schedule exams, entry of subject marks, automatic grade calculation, and downloadable result cards.', icon: Award },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 hover:bg-slate-900 transition-all">
                <f.icon className="w-8 h-8 text-indigo-400 mb-4" />
                <h3 className="text-base font-bold text-white">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Preview Section */}
      <section id="preview" className="py-20 border-t border-slate-900 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white">Experience Modern SaaS Aesthetics</h2>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto">No horizontal overflow on mobile, light/dark modes, skeleton loaders, and instant real database queries.</p>

          <div className="mt-12 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 p-2 sm:p-4 max-w-5xl mx-auto">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-950 rounded-2xl border border-slate-800/60 mb-4 text-xs text-slate-400">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="ml-4 font-mono text-indigo-400">https://eduvora.vercel.app/dashboard</span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 text-left space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-indigo-950/50 border border-indigo-800/40">
                  <p className="text-xs text-indigo-300">Total Students</p>
                  <p className="text-2xl font-black text-white mt-1">1,248</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800/40">
                  <p className="text-xs text-emerald-300">Fee Revenue</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">$48,250</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-800/40">
                  <p className="text-xs text-amber-300">Pending Fees</p>
                  <p className="text-2xl font-black text-amber-400 mt-1">$6,100</p>
                </div>
                <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/40">
                  <p className="text-xs text-rose-300">Net Balance</p>
                  <p className="text-2xl font-black text-white mt-1">$29,400</p>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  Launch Full Application Demo <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-16 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-sm">EV</div>
            <span className="font-bold text-white">Eduvora SaaS EMS</span>
          </div>
          <p className="text-xs text-slate-500">© 2026 Eduvora Inc. Built with Next.js, Prisma, & Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
}
