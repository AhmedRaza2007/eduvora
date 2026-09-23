'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserPlus,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  Building2,
  LogOut,
  CreditCard,
  Plus,
  AlertCircle,
} from 'lucide-react';

export default function ReceptionPortalPage() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchStudent, setSearchStudent] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // New Admission Modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    applicantName: '',
    dob: '2014-05-10',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    targetClassId: '',
    parentName: '',
    parentPhone: '',
    admissionFee: '1500',
  });
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const loadData = () => {
    Promise.all([
      fetch('/api/admissions').then((r) => r.json()),
      fetch('/api/students').then((r) => r.json()),
      fetch('/api/classes').then((r) => r.json()),
    ])
      .then(([admData, stuData, clsData]) => {
        if (admData.success && admData.admissions) setAdmissions(admData.admissions);
        if (stuData.success && stuData.students) setStudents(stuData.students);
        if (clsData.success && clsData.classes) {
          setClasses(clsData.classes);
          if (clsData.classes.length > 0 && !form.targetClassId) {
            setForm((prev) => ({ ...prev, targetClassId: clsData.classes[0].id }));
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMsg(`Application status updated to ${status}. ${status === 'ENROLLED' ? 'Student record auto-generated!' : ''}`);
        loadData();
      }
    } catch {
      setToastMsg('Failed to update admission application status.');
    }
  };

  const handleCreateAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setToastMsg(`New admission application registered for ${form.applicantName}!`);
        setShowModal(false);
        setForm({
          applicantName: '',
          dob: '2014-05-10',
          gender: 'Male',
          phone: '',
          email: '',
          address: '',
          targetClassId: classes[0]?.id || '',
          parentName: '',
          parentPhone: '',
          admissionFee: '1500',
        });
        loadData();
      }
    } catch {
      setToastMsg('Failed to create application.');
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      !searchStudent ||
      s.firstName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.phone?.includes(searchStudent)
  );

  const filteredAdmissions = admissions.filter(
    (a) => !statusFilter || a.status === statusFilter
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-pink-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-pink-500/20">
            RD
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-tight">Receptionist & Front Desk</h1>
              <span className="px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-[10px] font-bold">
                Front Desk Operations
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Admissions Queue, Emergency Contact Directory & Visitor Records</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors font-semibold"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Main Dashboard
          </Link>
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
        {toastMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between animate-fade-in shadow-xl shadow-emerald-500/10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{toastMsg}</span>
            </div>
            <button onClick={() => setToastMsg('')} className="text-emerald-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Admissions</span>
            <p className="text-2xl font-black text-amber-400">
              {admissions.filter((a) => a.status === 'PENDING').length}
            </p>
            <span className="text-[10px] text-slate-500 font-semibold">Requires evaluation</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Enrolled This Session</span>
            <p className="text-2xl font-black text-emerald-400">
              {admissions.filter((a) => a.status === 'ENROLLED').length}
            </p>
            <span className="text-[10px] text-emerald-400/80 font-semibold">Converted to active students</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Enrolled Directory</span>
            <p className="text-2xl font-black text-indigo-400">{students.length}</p>
            <span className="text-[10px] text-slate-500 font-semibold">Quick contact lookup</span>
          </div>
        </section>

        {/* Admissions Queue */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-pink-400" /> New Admission Applications
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage new student registrations and enrollment status</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="ENROLLED">Enrolled</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-pink-600/30 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" /> New Admission Form
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-4 px-6">App No</th>
                  <th className="py-4 px-4">Applicant</th>
                  <th className="py-4 px-4">Class</th>
                  <th className="py-4 px-4">Parent / Phone</th>
                  <th className="py-4 px-4 text-center">Fee (PKR)</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No admission applications in queue.
                    </td>
                  </tr>
                ) : (
                  filteredAdmissions.map((adm) => (
                    <tr key={adm.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-pink-400">{adm.applicationNo}</td>
                      <td className="py-4 px-4">
                        <p className="font-extrabold text-white">{adm.applicantName}</p>
                        <p className="text-[10px] text-slate-500">Gender: {adm.gender} • DOB: {adm.dob}</p>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-300">{adm.targetClass?.name || 'Class'}</td>
                      <td className="py-4 px-4">
                        <p className="text-white font-medium">{adm.parentName}</p>
                        <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" /> {adm.parentPhone}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-white">₨ {adm.admissionFee}</td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            adm.status === 'ENROLLED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : adm.status === 'APPROVED'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : adm.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {adm.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {adm.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(adm.id, 'APPROVED')}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px]"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(adm.id, 'REJECTED')}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 font-bold text-[11px]"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {adm.status === 'APPROVED' && (
                            <button
                              onClick={() => handleUpdateStatus(adm.id, 'ENROLLED')}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm shadow-emerald-600/30"
                            >
                              Enroll Student
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Student Quick Directory & Parent Emergency Lookup */}
        <section className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" /> Student & Emergency Parent Contact Directory
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Quick search for front desk inquiries, parent verification, and student phone lookups</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search name, ID, phone..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-medium"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class & Section</th>
                  <th className="py-3 px-4">Parent Name</th>
                  <th className="py-3 px-4">Contact Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredStudents.slice(0, 10).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-pink-400">{s.studentId}</td>
                    <td className="py-3 px-4 font-extrabold text-white">{s.firstName} {s.lastName}</td>
                    <td className="py-3 px-4 text-slate-300">{s.class?.name} ({s.section?.name})</td>
                    <td className="py-3 px-4 text-slate-300">{s.parent?.name || 'N/A'}</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">{s.phone || s.parent?.contact || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* NEW ADMISSION FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-pink-400" /> Register Admission Applicant
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateAdmission} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.applicantName}
                  onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
                  placeholder="e.g. Zaid Khan"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Target Class</label>
                  <select
                    value={form.targetClassId}
                    onChange={(e) => setForm({ ...form, targetClassId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Parent Name *</label>
                  <input
                    type="text"
                    required
                    value={form.parentName}
                    onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                    placeholder="Father / Guardian Name"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Parent Phone *</label>
                  <input
                    type="text"
                    required
                    value={form.parentPhone}
                    onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Admission Fee (PKR)</label>
                <input
                  type="number"
                  value={form.admissionFee}
                  onChange={(e) => setForm({ ...form, admissionFee: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold shadow-md shadow-pink-600/30"
                >
                  {saving ? 'Registering...' : 'Register Applicant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
