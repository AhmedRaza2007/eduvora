'use client';

import React, { useEffect, useState } from 'react';
import {
  UserCog,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  Trash2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function UsersPage() {
  const { user } = useRole();
  const { toast } = useToast();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Create User Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'TEACHER',
    phone: '',
    cnic: '',
    status: 'ACTIVE',
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (selectedRole) query.append('role', selectedRole);
      if (selectedStatus) query.append('status', selectedStatus);

      const res = await fetch(`/api/users?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        toast('Error', data.error || 'Failed to fetch user accounts', 'error');
      }
    } catch {
      toast('Error', 'Network error fetching users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, selectedRole, selectedStatus]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast('Success', `User account for ${data.user.name} created!`, 'success');
        setIsCreateOpen(false);
        setFormData({
          name: '',
          email: '',
          password: 'password123',
          role: 'TEACHER',
          phone: '',
          cnic: '',
          status: 'ACTIVE',
        });
        fetchUsers();
      } else {
        setFormError(data.error || 'Failed to create user account');
      }
    } catch (err: any) {
      setFormError(err.message || 'Error creating user account');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserStatus = async (targetUser: any) => {
    const newStatus = targetUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/users/${targetUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast('Updated', `User "${targetUser.name}" is now ${newStatus}.`, 'info');
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, status: newStatus } : u))
        );
      } else {
        toast('Error', data.error || 'Failed to update user', 'error');
      }
    } catch {
      toast('Error', 'Network error updating user', 'error');
    }
  };

  const handleDeleteUser = async (targetUser: any) => {
    if (targetUser.id === user.id) {
      toast('Error', 'You cannot delete your own logged-in account', 'warning');
      return;
    }
    if (!confirm(`Are you sure you want to permanently remove user "${targetUser.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${targetUser.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast('Deleted', `User "${targetUser.name}" removed successfully`, 'info');
        setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
      } else {
        toast('Error', data.error || 'Failed to delete user', 'error');
      }
    } catch {
      toast('Error', 'Network error deleting user', 'error');
    }
  };

  const getRoleBadge = (roleStr: string) => {
    switch (roleStr) {
      case 'ADMIN':
      case 'OWNER':
        return 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'TEACHER':
        return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'ACCOUNTANT':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'RECEPTIONIST':
        return 'bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800';
      case 'PARENT':
        return 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      case 'STUDENT':
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700';
    }
  };

  const permissionsMatrix = [
    { module: 'Dashboard Overview', admin: true, teacher: true, accountant: true, receptionist: true, parent: true, student: true },
    { module: 'Student CRUD Directory', admin: true, teacher: true, accountant: true, receptionist: true, parent: false, student: false },
    { module: 'Daily Class Attendance', admin: true, teacher: true, accountant: false, receptionist: false, parent: false, student: false },
    { module: 'Fees & Payment Receipts', admin: true, teacher: false, accountant: true, receptionist: true, parent: false, student: false },
    { module: 'Teacher & Staff Payroll', admin: true, teacher: false, accountant: true, receptionist: false, parent: false, student: false },
    { module: 'Expenses Management', admin: true, teacher: false, accountant: true, receptionist: false, parent: false, student: false },
    { module: 'Exams & Marks Entry', admin: true, teacher: true, accountant: false, receptionist: false, parent: false, student: false },
    { module: 'Reports & CSV Export', admin: true, teacher: false, accountant: true, receptionist: false, parent: false, student: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserCog className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> User Accounts & Access Control
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Manage authenticated users, assign academic roles, and review security permissions
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create User Account
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, CNIC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="TEACHER">Teacher</option>
            <option value="ACCOUNTANT">Accountant</option>
            <option value="RECEPTIONIST">Receptionist</option>
            <option value="STAFF">Staff</option>
            <option value="PARENT">Parent</option>
            <option value="STUDENT">Student</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Directory Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Registered Institution Users ({users.length})
        </h3>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : users.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">No user accounts found matching your filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 uppercase font-semibold">
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Contact & CNIC</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3">Registered Date</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{u.name}</p>
                          <p className="text-[11px] text-gray-400 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getRoleBadge(u.role)}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-mono text-gray-700 dark:text-slate-300">{u.phone || '—'}</p>
                      {u.cnic && <p className="text-[10px] text-gray-400 font-mono">CNIC: {u.cnic}</p>}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-gray-400 text-[11px] font-mono">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggleUserStatus(u)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                            u.status === 'ACTIVE'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                        {u.id !== user.id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Permissions Matrix */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" /> Server-Side Access Control (RBAC) Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 uppercase font-semibold">
                <th className="py-3 px-2">Module Name</th>
                <th className="py-3 px-2 text-center">Admin</th>
                <th className="py-3 px-2 text-center">Teacher</th>
                <th className="py-3 px-2 text-center">Accountant</th>
                <th className="py-3 px-2 text-center">Receptionist</th>
                <th className="py-3 px-2 text-center">Parent</th>
                <th className="py-3 px-2 text-center">Student</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
              {permissionsMatrix.map((pm, i) => (
                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-2 font-bold text-gray-900 dark:text-white">{pm.module}</td>
                  <td className="py-3 px-2 text-center">{pm.admin && <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />}</td>
                  <td className="py-3 px-2 text-center">{pm.teacher ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Lock className="w-4 h-4 text-gray-300 dark:text-slate-600 mx-auto" />}</td>
                  <td className="py-3 px-2 text-center">{pm.accountant ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Lock className="w-4 h-4 text-gray-300 dark:text-slate-600 mx-auto" />}</td>
                  <td className="py-3 px-2 text-center">{pm.receptionist ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Lock className="w-4 h-4 text-gray-300 dark:text-slate-600 mx-auto" />}</td>
                  <td className="py-3 px-2 text-center">{pm.parent ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Lock className="w-4 h-4 text-gray-300 dark:text-slate-600 mx-auto" />}</td>
                  <td className="py-3 px-2 text-center">{pm.student ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Lock className="w-4 h-4 text-gray-300 dark:text-slate-600 mx-auto" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New User Account"
        subtitle="Provision an authenticated staff, teacher, or student account with server-side role assignment"
        maxWidth="lg"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-slate-300 font-bold mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ahmed Raza"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-slate-300 font-bold mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="teacher@example.com"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-slate-300 font-bold mb-1">Password *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-slate-300 font-bold mb-1">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-bold"
              >
                <option value="TEACHER">TEACHER</option>
                <option value="ACCOUNTANT">ACCOUNTANT</option>
                <option value="RECEPTIONIST">RECEPTIONIST</option>
                <option value="STAFF">STAFF</option>
                <option value="PARENT">PARENT</option>
                <option value="STUDENT">STUDENT</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-slate-300 font-bold mb-1">Account Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-slate-300 font-bold mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+92 300 1234567"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-gray-700 dark:text-slate-300 font-bold mb-1">CNIC (National ID)</label>
              <input
                type="text"
                value={formData.cnic}
                onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                placeholder="35201-1234567-1"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 disabled:opacity-50"
            >
              {submitting ? 'Creating User...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
