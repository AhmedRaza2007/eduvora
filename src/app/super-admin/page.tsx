'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  GraduationCap,
  Coins,
  TrendingUp,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  LogOut,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';

export default function SuperAdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInstDetails, setSelectedInstDetails] = useState<any>(null);
  const [editingInst, setEditingInst] = useState<any>(null);

  // Form State for new institution
  const [form, setForm] = useState({
    name: '',
    type: 'School',
    logo: '',
    email: '',
    phone: '',
    address: '',
    city: 'Lahore',
    province: 'Punjab',
    country: 'Pakistan',
    academicSession: '2026-2027',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: 'password123',
    subscriptionPlan: 'PROFESSIONAL',
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, instRes, logsRes] = await Promise.all([
        fetch('/api/super-admin/stats'),
        fetch(`/api/super-admin/institutions?search=${encodeURIComponent(searchTerm)}&type=${typeFilter}&status=${statusFilter}`),
        fetch('/api/super-admin/audit-logs?limit=15'),
      ]);

      const statsData = await statsRes.json();
      const instData = await instRes.json();
      const logsData = await logsRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (instData.success) setInstitutions(instData.institutions);
      if (logsData.success) setAuditLogs(logsData.logs);
    } catch (e) {
      console.error('Failed to load super admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleCreateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      const res = await fetch('/api/super-admin/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || 'Failed to create institution');
        setSaving(false);
        return;
      }

      setToastMessage(`Institution "${form.name}" created successfully! Admin account active.`);
      setShowCreateModal(false);
      setForm({
        name: '',
        type: 'School',
        logo: '',
        email: '',
        phone: '',
        address: '',
        city: 'Lahore',
        province: 'Punjab',
        country: 'Pakistan',
        academicSession: '2026-2027',
        adminName: '',
        adminEmail: '',
        adminPhone: '',
        adminPassword: 'password123',
        subscriptionPlan: 'PROFESSIONAL',
      });
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (inst: any) => {
    const newStatus = inst.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/super-admin/institutions/${inst.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setInstitutions((prev) =>
          prev.map((item) => (item.id === inst.id ? { ...item, status: newStatus } : item))
        );
        setToastMessage(`Institution "${inst.name}" is now ${newStatus}.`);
      }
    } catch (e) {
      console.error('Failed to toggle status', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-500/20">
            SA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-tight">Eduvora Super Admin</h1>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
                Platform Console
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Global Multi-Tenant Control & System Analytics</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors font-semibold"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Switch to School View
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
        {/* Toast */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between animate-fade-in shadow-xl shadow-emerald-500/10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage('')} className="text-emerald-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Platform Overview KPIs */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> Platform-Wide Intelligence
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time consolidated database metrics across all registered tenants</p>
            </div>
            <button
              onClick={fetchData}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Institutions</span>
              <p className="text-2xl font-black text-white">{stats?.totalInstitutions ?? '-'}</p>
              <span className="text-[10px] text-purple-400 font-semibold">{stats?.platformGrowth ?? '+18.4%'} MoM</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Tenants</span>
              <p className="text-2xl font-black text-emerald-400">{stats?.activeInstitutions ?? '-'}</p>
              <span className="text-[10px] text-slate-500 font-semibold">Verified operational</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Students</span>
              <p className="text-2xl font-black text-indigo-400">{stats?.totalStudents ?? '-'}</p>
              <span className="text-[10px] text-indigo-400/80 font-semibold">Across all campuses</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Faculty</span>
              <p className="text-2xl font-black text-pink-400">{stats?.totalTeachers ?? '-'}</p>
              <span className="text-[10px] text-slate-500 font-semibold">Active teachers</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Campuses</span>
              <p className="text-2xl font-black text-amber-400">{stats?.totalBranches ?? '-'}</p>
              <span className="text-[10px] text-slate-500 font-semibold">Registered branches</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Platform Revenue</span>
              <p className="text-2xl font-black text-emerald-400">
                ₨ {stats?.totalRevenue ? Number(stats.totalRevenue).toLocaleString() : '0'}
              </p>
              <span className="text-[10px] text-emerald-400/80 font-semibold">PKR collected</span>
            </div>
          </div>
        </section>

        {/* Institutions Directory & Management */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" /> Institutions & Academies
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage institutions, subscription plans, campuses, and tenant administrator accounts</p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-xl shadow-purple-600/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" /> Create New Institution
            </button>
          </div>

          {/* Search and Filters Bar */}
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-wrap items-center gap-3 text-xs">
            <form onSubmit={handleSearch} className="flex-1 min-w-[240px] relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by institution name, code, city, email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white placeholder-slate-500 transition-all font-medium text-xs"
              />
            </form>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold text-xs focus:border-purple-500"
            >
              <option value="">All Types</option>
              <option value="School">School</option>
              <option value="College">College</option>
              <option value="University">University</option>
              <option value="Coaching Center">Coaching Center</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold text-xs focus:border-purple-500"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="TRIAL">Trial</option>
            </select>
          </div>

          {/* Institutions Table */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-4 px-6">Institution</th>
                    <th className="py-4 px-4">Type & City</th>
                    <th className="py-4 px-4">Campus & Admins</th>
                    <th className="py-4 px-4 text-center">Students</th>
                    <th className="py-4 px-4 text-center">Teachers</th>
                    <th className="py-4 px-4 text-center">Plan</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {institutions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                        No institutions found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    institutions.map((inst) => (
                      <tr key={inst.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={inst.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=100'}
                              alt={inst.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                            />
                            <div>
                              <p className="font-extrabold text-sm text-white">{inst.name}</p>
                              <p className="font-mono text-[10px] text-purple-400 font-bold">{inst.code}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-300">{inst.type}</span>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-500" /> {inst.city || 'Pakistan'}, {inst.province || 'Punjab'}
                          </p>
                        </td>

                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-300">
                            {inst._count?.branches || 1} Campus{inst._count?.branches > 1 ? 'es' : ''}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                            {inst.users?.[0]?.name || inst.email}
                          </p>
                        </td>

                        <td className="py-4 px-4 text-center font-extrabold text-white">
                          {inst._count?.students || 0}
                        </td>

                        <td className="py-4 px-4 text-center font-extrabold text-white">
                          {inst._count?.teachers || 0}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {inst.subscriptionPlan || 'FREE'}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              inst.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {inst.status}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedInstDetails(inst)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleStatus(inst)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                                inst.status === 'ACTIVE'
                                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20'
                              }`}
                            >
                              {inst.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Platform Audit Logs Feed */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" /> Platform Audit Trail & Security Feed
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Real-time log of administrator actions, tenant creations, and security operations</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No recent audit logs available.</p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-2">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-black text-[10px] shrink-0">
                        {log.action.substring(0, 3)}
                      </div>
                      <div>
                        <p className="font-bold text-white leading-tight">{log.description}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Module: <span className="font-semibold text-purple-400">{log.module}</span> • User: {log.userName || 'System'}
                          {log.institution?.name ? ` • Tenant: ${log.institution.name}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* CREATE INSTITUTION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-purple-400" /> Onboard New Institution
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Creates isolated database tenant, initial administrator user, and default session.
                </p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white text-lg">
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateInstitution} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Institution Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Lahore Model College"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Institution Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-medium"
                  >
                    <option value="School">School</option>
                    <option value="College">College</option>
                    <option value="University">University</option>
                    <option value="Coaching Center">Coaching Center / Academy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="info@lahorecollege.edu.pk"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+92 42 35889900"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Lahore"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Province</label>
                  <select
                    value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-medium"
                  >
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="KPK">Khyber Pakhtunkhwa</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                    <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                    <option value="AJK">Azad Jammu & Kashmir</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">Physical Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Campus building address, Street, Sector"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-medium"
                  />
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-slate-800">
                  <p className="font-extrabold text-sm text-purple-400 mb-2">Initial Institution Admin Credentials</p>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Admin Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.adminName}
                    onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                    placeholder="e.g. Prof. Tariq Mahmood"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Admin Email (Login ID) *</label>
                  <input
                    type="email"
                    required
                    value={form.adminEmail}
                    onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                    placeholder="admin@lahorecollege.edu.pk"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Admin Phone</label>
                  <input
                    type="text"
                    value={form.adminPhone}
                    onChange={(e) => setForm({ ...form, adminPhone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Admin Password</label>
                  <input
                    type="text"
                    value={form.adminPassword}
                    onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-mono font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-bold shadow-lg shadow-purple-600/30 disabled:opacity-50"
                >
                  {saving ? 'Creating Tenant...' : 'Onboard Institution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {selectedInstDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedInstDetails.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=100'}
                  alt={selectedInstDetails.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                />
                <div>
                  <h3 className="font-extrabold text-base text-white">{selectedInstDetails.name}</h3>
                  <p className="text-xs text-purple-400 font-mono font-bold">{selectedInstDetails.code}</p>
                </div>
              </div>
              <button onClick={() => setSelectedInstDetails(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500 font-bold">Category:</span>
                <span className="font-bold text-white">{selectedInstDetails.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500 font-bold">Location:</span>
                <span>{selectedInstDetails.city || 'N/A'}, {selectedInstDetails.province || 'Pakistan'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500 font-bold">Currency:</span>
                <span className="font-bold text-emerald-400">{selectedInstDetails.currency || 'PKR'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500 font-bold">Registered Campuses:</span>
                <span>{selectedInstDetails.branches?.length || 1}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500 font-bold">Students:</span>
                <span className="font-extrabold text-white">{selectedInstDetails._count?.students || 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500 font-bold">Faculty:</span>
                <span className="font-extrabold text-white">{selectedInstDetails._count?.teachers || 0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-bold">Status:</span>
                <span className="font-bold text-emerald-400">{selectedInstDetails.status}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedInstDetails(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
