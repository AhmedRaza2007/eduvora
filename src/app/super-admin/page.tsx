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
  UserPlus,
  UserCog,
  Key,
  Lock,
  Unlock,
  CreditCard,
  PhoneCall,
  Users2,
  BookOpen,
} from 'lucide-react';
import { formatPKR } from '@/lib/currency';

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState<'institutions' | 'users' | 'logs'>('institutions');

  // Stats and core collections
  const [stats, setStats] = useState<any>(null);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Institution search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // User search and filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userInstFilter, setUserInstFilter] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [selectedInstDetails, setSelectedInstDetails] = useState<any>(null);

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

  // Form State for new user
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'TEACHER',
    institutionId: '',
    branchId: '',
    status: 'ACTIVE',
    phone: '',
    cnic: '',
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [userSaving, setUserSaving] = useState(false);
  const [userFormError, setUserFormError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, instRes, logsRes, usersRes] = await Promise.all([
        fetch('/api/super-admin/stats'),
        fetch(`/api/super-admin/institutions?search=${encodeURIComponent(searchTerm)}&type=${typeFilter}&status=${statusFilter}`),
        fetch('/api/super-admin/audit-logs?limit=25'),
        fetch(`/api/users?search=${encodeURIComponent(userSearch)}&role=${userRoleFilter}&status=${userStatusFilter}&institutionId=${userInstFilter}`),
      ]);

      const statsData = await statsRes.json();
      const instData = await instRes.json();
      const logsData = await logsRes.json();
      const usersData = await usersRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (instData.success) setInstitutions(instData.institutions);
      if (logsData.success) setAuditLogs(logsData.logs);
      if (usersData.success) setUsers(usersData.users);
    } catch (e) {
      console.error('Failed to load super admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter, statusFilter, userRoleFilter, userStatusFilter, userInstFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleUserSearch = (e: React.FormEvent) => {
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserSaving(true);
    setUserFormError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setUserFormError(data.error || 'Failed to create user account');
        setUserSaving(false);
        return;
      }

      setToastMessage(`User account for "${data.user.name}" (${data.user.role}) created successfully!`);
      setShowCreateUserModal(false);
      setUserForm({
        name: '',
        email: '',
        password: 'password123',
        role: 'TEACHER',
        institutionId: institutions[0]?.id || '',
        branchId: '',
        status: 'ACTIVE',
        phone: '',
        cnic: '',
      });
      fetchData();
    } catch (err: any) {
      setUserFormError(err.message || 'Error creating user account');
    } finally {
      setUserSaving(false);
    }
  };

  const toggleInstStatus = async (inst: any) => {
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

  const toggleUserStatus = async (u: any) => {
    const newStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((item) => (item.id === u.id ? { ...item, status: newStatus } : item))
        );
        setToastMessage(`User account "${u.name}" is now ${newStatus}.`);
      }
    } catch (e) {
      console.error('Failed to toggle user status', e);
    }
  };

  const handleDeleteUser = async (u: any) => {
    if (!confirm(`Are you sure you want to permanently delete user "${u.name}" (${u.email})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers((prev) => prev.filter((item) => item.id !== u.id));
        setToastMessage(`User "${u.name}" removed successfully.`);
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (e) {
      console.error('Failed to delete user', e);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'ADMIN':
      case 'OWNER':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'TEACHER':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'ACCOUNTANT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'RECEPTIONIST':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      case 'PARENT':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'STUDENT':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
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
                {formatPKR(stats?.totalRevenue)}
              </p>
              <span className="text-[10px] text-emerald-400/80 font-semibold">PKR collected</span>
            </div>
          </div>
        </section>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('institutions')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'institutions'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Institutions & Campuses</span>
            <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px]">
              {institutions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management</span>
            <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px]">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Audit Trail Logs</span>
            <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px]">
              {auditLogs.length}
            </span>
          </button>
        </div>

        {/* TAB 1: INSTITUTIONS & CAMPUSES */}
        {activeTab === 'institutions' && (
          <section className="space-y-4 animate-fade-in">
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
                                onClick={() => toggleInstStatus(inst)}
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
        )}

        {/* TAB 2: USER MANAGEMENT (SUPER ADMIN) */}
        {activeTab === 'users' && (
          <section className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-purple-400" /> Platform User Management
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Create and manage users across all roles: Super Admin, Admins, Teachers, Accountants, Receptionists, Parents, and Students
                </p>
              </div>

              <button
                onClick={() => {
                  setUserForm({
                    name: '',
                    email: '',
                    password: 'password123',
                    role: 'TEACHER',
                    institutionId: institutions[0]?.id || '',
                    branchId: '',
                    status: 'ACTIVE',
                    phone: '',
                    cnic: '',
                  });
                  setShowCreateUserModal(true);
                }}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-xl shadow-purple-600/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <UserPlus className="w-4 h-4" /> Create User Account
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-wrap items-center gap-3 text-xs">
              <form onSubmit={handleUserSearch} className="flex-1 min-w-[240px] relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users by name, email, phone, CNIC..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white placeholder-slate-500 transition-all font-medium text-xs"
                />
              </form>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold text-xs focus:border-purple-500"
              >
                <option value="">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="TEACHER">Teacher</option>
                <option value="ACCOUNTANT">Accountant</option>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="PARENT">Parent</option>
                <option value="STUDENT">Student</option>
              </select>

              <select
                value={userInstFilter}
                onChange={(e) => setUserInstFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold text-xs focus:border-purple-500 max-w-[200px]"
              >
                <option value="">All Institutions</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>

              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold text-xs focus:border-purple-500"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-4 px-6">User Account</th>
                      <th className="py-4 px-4">Role</th>
                      <th className="py-4 px-4">Institution & Campus</th>
                      <th className="py-4 px-4">Phone & CNIC</th>
                      <th className="py-4 px-4 text-center">Status</th>
                      <th className="py-4 px-4">Created Date</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                          No user accounts found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <p className="font-extrabold text-sm text-white">{u.name}</p>
                                <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getRoleBadge(
                                u.role
                              )}`}
                            >
                              {u.role.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <p className="font-bold text-slate-300">
                              {u.institution?.name || (u.role === 'SUPER_ADMIN' ? 'Platform Console' : 'Eduvora Global')}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {u.branch?.name ? `Campus: ${u.branch.name}` : 'Main Facility'}
                            </p>
                          </td>

                          <td className="py-4 px-4 text-slate-300">
                            <p className="font-mono">{u.phone || '—'}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{u.cnic ? `CNIC: ${u.cnic}` : ''}</p>
                          </td>

                          <td className="py-4 px-4 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                u.status === 'ACTIVE'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-slate-400 text-[11px] font-mono">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => toggleUserStatus(u)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                                  u.status === 'ACTIVE'
                                    ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20'
                                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20'
                                }`}
                              >
                                {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
        )}

        {/* TAB 3: AUDIT TRAIL LOGS */}
        {activeTab === 'logs' && (
          <section className="space-y-4 animate-fade-in">
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
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-2">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-black text-[10px] shrink-0">
                          {log.action.substring(0, 3)}
                        </div>
                        <div>
                          <p className="font-bold text-white leading-tight">{log.description}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Module: <span className="font-semibold text-purple-400">{log.module}</span> • User: {log.userName || 'System'} ({log.userRole || 'ADMIN'})
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
        )}
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
                    placeholder="Dr. Tariq Mahmood"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Admin Email *</label>
                  <input
                    type="email"
                    required
                    value={form.adminEmail}
                    onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                    placeholder="principal@lahorecollege.edu.pk"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Initial Password *</label>
                  <input
                    type="password"
                    required
                    value={form.adminPassword}
                    onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-medium font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Subscription Plan</label>
                  <select
                    value={form.subscriptionPlan}
                    onChange={(e) => setForm({ ...form, subscriptionPlan: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-medium"
                  >
                    <option value="STARTER">Starter Tier (1 Branch, 500 Students)</option>
                    <option value="PROFESSIONAL">Professional Tier (3 Campuses, 2500 Students)</option>
                    <option value="ENTERPRISE">Enterprise Tier (Unlimited Campuses & Students)</option>
                  </select>
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

      {/* CREATE USER ACCOUNT MODAL (EXACT SPECIFICATION) */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-purple-400" /> Create User Account
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Provision an authenticated account with specific role, institution, and branch
                </p>
              </div>
              <button onClick={() => setShowCreateUserModal(false)} className="text-slate-400 hover:text-white text-lg">
                ✕
              </button>
            </div>

            {userFormError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{userFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="e.g. Ahmed Raza"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="e.g. teacher@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-medium font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Role *</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-bold"
                  >
                    <option value="TEACHER">TEACHER (Teacher Dashboard)</option>
                    <option value="ACCOUNTANT">ACCOUNTANT (Accountant Dashboard)</option>
                    <option value="RECEPTIONIST">RECEPTIONIST (Receptionist Dashboard)</option>
                    <option value="PARENT">PARENT (Parent Portal)</option>
                    <option value="STUDENT">STUDENT (Student Dashboard)</option>
                    <option value="ADMIN">ADMIN (Institution Admin Dashboard)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Platform Super Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Institution {userForm.role !== 'SUPER_ADMIN' ? '*' : '(Optional for Super Admin)'}
                  </label>
                  <select
                    value={userForm.institutionId}
                    onChange={(e) => setUserForm({ ...userForm, institutionId: e.target.value })}
                    disabled={userForm.role === 'SUPER_ADMIN'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-medium disabled:opacity-50"
                  >
                    <option value="">Select Institution</option>
                    {institutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.city || 'Pakistan'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Account Status *</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-medium"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">CNIC (National ID)</label>
                  <input
                    type="text"
                    value={userForm.cnic}
                    onChange={(e) => setUserForm({ ...userForm, cnic: e.target.value })}
                    placeholder="35201-1234567-1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white font-medium font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userSaving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-bold shadow-lg shadow-purple-600/30 disabled:opacity-50"
                >
                  {userSaving ? 'Creating Account...' : 'Create Account'}
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
