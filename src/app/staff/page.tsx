'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  DollarSign,
  CalendarCheck,
  Bell,
  Sparkles,
  LogOut,
  Building2,
  Receipt,
  CheckCircle2,
} from 'lucide-react';

export default function StaffPortalPage() {
  const [profile, setProfile] = useState<any>(null);
  const [salaries, setSalaries] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.user) setProfile(data.user);
      });

    Promise.all([
      fetch('/api/salaries').then((r) => r.json()),
      fetch('/api/announcements').then((r) => r.json()),
    ])
      .then(([salData, annData]) => {
        if (salData.success && salData.salaries) setSalaries(salData.salaries);
        if (annData.success && annData.announcements) setAnnouncements(annData.announcements);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-amber-500/20">
            SP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-tight">Staff Employee Portal</h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                Staff Desk
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Monthly Salary Slips, Employment Profile & Notices</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => {
              fetch('/api/auth/logout', { method: 'POST' }).then(() => {
                window.location.href = '/login';
              });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors font-bold"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Card */}
        <section className="p-6 rounded-3xl bg-gradient-to-r from-amber-900 via-slate-900 to-indigo-900 border border-amber-800/40 text-white flex flex-col sm:flex-row items-center gap-6 shadow-2xl">
          <img
            src={
              profile?.avatar ||
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
            }
            alt={profile?.name || 'Staff Member'}
            className="w-20 h-20 rounded-3xl object-cover border-2 border-amber-400 shadow-xl"
          />
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-black">{profile?.name || 'Robert Sterling'}</h2>
            <p className="text-xs text-amber-200">
              Staff ID: <span className="font-mono font-bold text-white">STF-2026-001</span> • Role: Accountant / Coordinator
            </p>
            <p className="text-xs text-amber-300">
              Institution: {profile?.institution?.name || 'Eduvora Global Academy'} • Campus: Main Campus
            </p>
          </div>
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Attendance Rate</span>
            <p className="text-2xl font-black text-emerald-400">98.5%</p>
            <span className="text-[10px] text-slate-500 font-semibold">26 Days on Duty</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Monthly Base Salary</span>
            <p className="text-2xl font-black text-amber-400">₨ 65,000</p>
            <span className="text-[10px] text-amber-400/80 font-semibold">Direct Bank Transfer</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Salary Slips</span>
            <p className="text-2xl font-black text-white">{salaries.length || 3}</p>
            <span className="text-[10px] text-emerald-400 font-semibold">All Disbursed</span>
          </div>
        </section>

        {/* Salary History */}
        <section className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" /> Payroll History & Salary Slips
          </h3>

          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Slip No</th>
                  <th className="py-3 px-4">Month & Year</th>
                  <th className="py-3 px-4 text-center">Base Salary</th>
                  <th className="py-3 px-4 text-center">Bonus</th>
                  <th className="py-3 px-4 text-center">Deductions</th>
                  <th className="py-3 px-4 text-center">Net Salary (PKR)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {salaries.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{s.salarySlipNo}</td>
                    <td className="py-3 px-4 font-bold text-white">{s.month} {s.year}</td>
                    <td className="py-3 px-4 text-center text-slate-300">₨ {s.baseSalary}</td>
                    <td className="py-3 px-4 text-center text-emerald-400">+₨ {s.bonus}</td>
                    <td className="py-3 px-4 text-center text-rose-400">-₨ {s.deduction + s.advance}</td>
                    <td className="py-3 px-4 text-center font-extrabold text-white">₨ {s.netSalary}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => window.print()}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold inline-flex items-center gap-1"
                      >
                        <Receipt className="w-3 h-3" /> Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Notices */}
        <section className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" /> Institutional Announcements
          </h3>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-sm">{ann.title}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
