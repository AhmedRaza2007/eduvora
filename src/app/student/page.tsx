'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  CalendarCheck,
  CreditCard,
  Award,
  Clock,
  BookOpen,
  Sparkles,
  LogOut,
  CheckCircle2,
  FileText,
  FileCheck,
} from 'lucide-react';

export default function StudentPortalPage() {
  const [profile, setProfile] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setProfile(data.user);
        }
      });

    Promise.all([
      fetch('/api/fees').then((r) => r.json()),
      fetch('/api/timetable').then((r) => r.json()),
      fetch('/api/exams').then((r) => r.json()),
    ])
      .then(([feeData, ttData, examData]) => {
        if (feeData.success && feeData.invoices) setInvoices(feeData.invoices);
        if (ttData.success && ttData.timetables) setTimetables(ttData.timetables);
        if (examData.success && examData.exams) setExams(examData.exams);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-teal-500/20">
            SP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-tight">Student Academic Desk</h1>
              <span className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[10px] font-bold">
                Enrolled Student
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Class Schedule, Grades, Attendance & Fee Invoices</p>
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
        <section className="p-6 rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-900 border border-teal-800/40 text-white flex flex-col sm:flex-row items-center gap-6 shadow-2xl">
          <img
            src={
              profile?.avatar ||
              'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150'
            }
            alt={profile?.name || 'Student'}
            className="w-20 h-20 rounded-3xl object-cover border-2 border-teal-400 shadow-xl"
          />
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-black">{profile?.name || 'Lucas Vance'}</h2>
            <p className="text-xs text-teal-200">
              Student ID: <span className="font-mono font-bold text-white">STU-2026-001</span> • Class: Grade 10 Science (Section A)
            </p>
            <p className="text-xs text-teal-300">
              Institution: {profile?.institution?.name || 'Eduvora Global Academy'} • Campus: Main Campus
            </p>
          </div>
        </section>

        {/* Academic KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Attendance Percentage</span>
            <p className="text-2xl font-black text-emerald-400">96.0%</p>
            <span className="text-[10px] text-slate-500 font-semibold">24 Days Present • 1 Day Absent</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Term GPA</span>
            <p className="text-2xl font-black text-teal-400">3.95 (A+)</p>
            <span className="text-[10px] text-teal-300/80 font-semibold">Class Rank: #1</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fee Invoices</span>
            <p className="text-2xl font-black text-white">{invoices.length || 2}</p>
            <span className="text-[10px] text-emerald-400 font-semibold">Payment Status: Verified</span>
          </div>
        </section>

        {/* Weekly Timetable */}
        <section className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-400" /> Weekly Schedule & Room Allocations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {timetables.slice(0, 4).map((slot, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 font-bold text-[10px]">
                    {slot.dayOfWeek}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">{slot.room}</span>
                </div>
                <p className="font-extrabold text-white text-sm">{slot.subject?.name}</p>
                <p className="text-[11px] text-slate-400">Teacher: {slot.teacher?.name}</p>
                <p className="text-[10px] text-amber-400 font-mono pt-1">
                  {slot.startTime} – {slot.endTime}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Invoices List */}
        <section className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" /> Fee Invoices & Payment Slips
          </h3>

          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-center">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-400">{inv.invoiceNo}</td>
                    <td className="py-3 px-4 font-bold text-white">{inv.title}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{inv.dueDate}</td>
                    <td className="py-3 px-4 text-center font-bold text-white">₨ {inv.amount}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
