'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  XCircle,
  CreditCard,
  AlertTriangle,
  Receipt,
  DollarSign,
  TrendingUp,
  UserPlus,
  Plus,
  ArrowRight,
  FileCheck,
  Calendar,
} from 'lucide-react';
import { CardSkeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

export default function DashboardOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        }
      })
      .catch((err) => console.error('Error fetching dashboard stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton rows={4} />
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentAdmissions = data?.recentAdmissions || [];
  const recentPayments = data?.recentPayments || [];
  const recentExpenses = data?.recentExpenses || [];
  const pendingInvoices = data?.pendingInvoices || [];
  const chartData = data?.chartData || [];
  const attendanceChart = data?.attendanceChart || [];

  return (
    <div className="space-y-8 pb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl shadow-indigo-950/20">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Institutional Dashboard</h2>
          <p className="text-xs text-indigo-200 mt-1">Real database analytics for Eduvora Global Academy (Session 2026–2027)</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/students?action=new"
            className="px-4 py-2 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4 text-indigo-600" /> New Admission
          </Link>
          <Link
            href="/dashboard/fees?action=collect"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
          >
            <CreditCard className="w-4 h-4" /> Collect Fee
          </Link>
        </div>
      </div>

      {/* Primary Financial & Operational Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Students */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Total Students</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">{stats.totalStudents || 0}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Active Enrolled
          </p>
        </div>

        {/* Attendance Today */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Present Today</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">{stats.presentToday || 0}</p>
          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
            Absent: <span className="font-bold text-rose-500">{stats.absentToday || 0}</span>
          </p>
        </div>

        {/* Faculty & Staff */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Teachers / Staff</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">{stats.totalTeachers || 0} / {stats.totalStaff || 0}</p>
          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">Active Faculty Roster</p>
        </div>

        {/* Fee Collection */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Fee Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            ${stats.feeCollection?.toLocaleString() || '0'}
          </p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
            Pending: ${stats.pendingFees?.toLocaleString() || '0'}
          </p>
        </div>

        {/* Net Balance calculation: Net Balance = Fee Revenue - Expenses - Salaries */}
        <div className="p-5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-100">Net Balance</span>
            <div className="p-2 rounded-xl bg-white/20 text-white">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black mt-2">${stats.netBalance?.toLocaleString() || '0'}</p>
          <p className="text-[10px] text-indigo-200 mt-1">Formula: Revenue - Expenses - Salaries</p>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Financial Growth & Cash Flow</h3>
              <p className="text-xs text-gray-400">Monthly breakdown of fee collection vs expenses & staff salaries</p>
            </div>
            <Badge variant="indigo">Session 2026</Badge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#F43F5E" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Attendance Pie Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Daily Attendance Ratio</h3>
            <p className="text-xs text-gray-400">Student status today</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={attendanceChart} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                  {attendanceChart.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-800 text-xs">
            {attendanceChart.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Data Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Fee Payments Table */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-500" /> Recent Fee Collections
            </h3>
            <Link href="/dashboard/fees" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 uppercase font-semibold">
                  <th className="py-2.5">Receipt #</th>
                  <th className="py-2.5">Student</th>
                  <th className="py-2.5">Method</th>
                  <th className="py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
                {recentPayments.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-4 text-gray-400">No recent payments</td></tr>
                ) : (
                  recentPayments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 font-mono font-bold text-gray-900 dark:text-white">{p.receiptNo}</td>
                      <td className="py-3 font-medium text-gray-700 dark:text-slate-300">
                        {p.invoice?.student ? `${p.invoice.student.firstName} ${p.invoice.student.lastName}` : 'Student'}
                      </td>
                      <td className="py-3">
                        <Badge variant="indigo">{p.paymentMethod}</Badge>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        +${p.amountPaid?.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Fees Overdue Table */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Outstanding / Pending Fees
            </h3>
            <Link href="/dashboard/fees" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              Collect Fees <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 uppercase font-semibold">
                  <th className="py-2.5">Student</th>
                  <th className="py-2.5">Invoice Title</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
                {pendingInvoices.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-4 text-gray-400">No pending fee invoices</td></tr>
                ) : (
                  pendingInvoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 font-bold text-gray-900 dark:text-white">
                        {inv.student?.firstName} {inv.student?.lastName}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-slate-300">{inv.title}</td>
                      <td className="py-3">
                        <Badge variant={inv.status === 'OVERDUE' ? 'rose' : 'amber'}>{inv.status}</Badge>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                        ${(inv.amount - inv.paidAmount).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
