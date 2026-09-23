'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users2,
  CalendarCheck,
  CreditCard,
  Award,
  Clock,
  Bell,
  Sparkles,
  LogOut,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Download,
} from 'lucide-react';

export default function ParentPortalPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.students) {
          setStudents(data.students);
          if (data.students.length > 0) {
            setSelectedChild(data.students[0]);
          }
        }
      })
      .finally(() => setLoading(false));

    fetch('/api/fees')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.invoices) setInvoices(data.invoices);
      });

    fetch('/api/exams')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.exams) setExams(data.exams);
      });

    fetch('/api/timetable')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.timetables) setTimetables(data.timetables);
      });
  }, []);

  const childInvoices = invoices.filter(
    (inv) => !selectedChild || inv.studentId === selectedChild.id
  );

  const pendingAmount = childInvoices
    .filter((inv) => inv.status !== 'PAID')
    .reduce((acc, inv) => acc + (inv.amount - (inv.paidAmount || 0)), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-500/20">
            PP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-tight">Parent Portal & Family Desk</h1>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
                Family Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Children Academic Records, Fee Dues & Attendance</p>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Child Selector */}
        <section className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-extrabold text-slate-400">Select Child Account:</span>
          <div className="flex flex-wrap gap-2">
            {students.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChild(ch)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  selectedChild?.id === ch.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {ch.firstName} {ch.lastName} ({ch.class?.name || 'Class'})
              </button>
            ))}
          </div>
        </section>

        {selectedChild && (
          <>
            {/* Child Profile Banner */}
            <section className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border border-purple-800/40 text-white flex flex-col sm:flex-row items-center gap-6 shadow-2xl">
              <img
                src={
                  selectedChild.photo ||
                  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150'
                }
                alt={selectedChild.firstName}
                className="w-20 h-20 rounded-3xl object-cover border-2 border-purple-400 shadow-xl"
              />
              <div className="text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl font-black">{selectedChild.firstName} {selectedChild.lastName}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
                    Active Student
                  </span>
                </div>
                <p className="text-xs text-purple-200">
                  Student ID: <span className="font-mono font-bold text-white">{selectedChild.studentId}</span> • Class: {selectedChild.class?.name} ({selectedChild.section?.name}) • Roll No: {selectedChild.rollNo}
                </p>
                <p className="text-xs text-purple-300">
                  Guardian: {selectedChild.parent?.name || 'Michael Vance'} ({selectedChild.parent?.relationship || 'Father'})
                </p>
              </div>
            </section>

            {/* Quick Metrics */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Attendance Rate</span>
                <p className="text-2xl font-black text-emerald-400">96.0%</p>
                <span className="text-[10px] text-slate-500 font-semibold">24 Days Present • 1 Absent</span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Outstanding Fees</span>
                <p className="text-2xl font-black text-rose-400">
                  ₨ {Number(pendingAmount || 0).toLocaleString()}
                </p>
                <span className="text-[10px] text-amber-400/80 font-semibold">
                  {pendingAmount > 0 ? 'Pending payment required' : 'All invoices cleared'}
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Academic Grade / GPA</span>
                <p className="text-2xl font-black text-purple-400">3.95 (A+)</p>
                <span className="text-[10px] text-purple-300/80 font-semibold">Mid-Term Evaluation</span>
              </div>
            </section>

            {/* Fee Invoices & Payment History */}
            <section className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" /> Fee Invoices & Receipts
              </h3>

              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Invoice No</th>
                      <th className="py-3 px-4">Fee Title</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4 text-center">Amount (PKR)</th>
                      <th className="py-3 px-4 text-center">Paid Amount</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {childInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-500">
                          No fee invoices issued for this child.
                        </td>
                      </tr>
                    ) : (
                      childInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-purple-400">{inv.invoiceNo}</td>
                          <td className="py-3 px-4 font-bold text-white">{inv.title}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">{inv.dueDate}</td>
                          <td className="py-3 px-4 text-center font-bold text-white">₨ {inv.amount}</td>
                          <td className="py-3 px-4 text-center text-slate-300">₨ {inv.paidAmount}</td>
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
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => window.print()}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold inline-flex items-center gap-1"
                            >
                              <Receipt className="w-3 h-3" /> Slip
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Timetable Schedule */}
            <section className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" /> Class Weekly Timetable
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {timetables.slice(0, 4).map((slot, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 font-bold text-[10px]">
                      {slot.dayOfWeek}
                    </span>
                    <p className="font-extrabold text-white text-sm">{slot.subject?.name}</p>
                    <p className="text-[11px] text-slate-400">{slot.teacher?.name}</p>
                    <p className="text-[10px] text-amber-400 font-mono pt-1">
                      {slot.startTime} – {slot.endTime} • {slot.room}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
