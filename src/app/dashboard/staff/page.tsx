'use client';

import React, { useEffect, useState } from 'react';
import { Briefcase, Plus, Phone, Mail, DollarSign } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function StaffPage() {
  const { toast } = useToast();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: 'Accountant',
    email: '',
    phone: '',
    salary: '3200',
    joiningDate: '2026-08-01',
  });

  const fetchStaff = () => {
    setLoading(true);
    fetch('/api/staff')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStaff(data.staff);
      })
      .catch(() => toast('Error', 'Failed to fetch staff roster', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast('Staff Added', `${data.staff.name} appointed as ${data.staff.role}!`, 'success');
        setIsAddModalOpen(false);
        fetchStaff();
      } else {
        toast('Error', data.error || 'Failed to add staff', 'error');
      }
    } catch {
      toast('Error', 'Server error adding staff', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Non-Teaching Staff Roster
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Manage Accountants, Receptionists, Security, Drivers, Cleaners, and Administrative Staff</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 uppercase font-semibold">
                  <th className="py-3 px-2">Staff ID</th>
                  <th className="py-3 px-2">Name</th>
                  <th className="py-3 px-2">Role / Designation</th>
                  <th className="py-3 px-2">Phone / Email</th>
                  <th className="py-3 px-2">Base Salary</th>
                  <th className="py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">{s.staffId}</td>
                    <td className="py-3 px-2 font-bold text-gray-900 dark:text-white">{s.name}</td>
                    <td className="py-3 px-2">
                      <Badge variant="purple">{s.role}</Badge>
                    </td>
                    <td className="py-3 px-2 text-gray-600 dark:text-slate-300">
                      {s.phone}
                      {s.email && <span className="block text-[10px] text-gray-400">{s.email}</span>}
                    </td>
                    <td className="py-3 px-2 font-mono font-bold text-emerald-600">${s.salary?.toLocaleString()}</td>
                    <td className="py-3 px-2">
                      <Badge variant={s.status === 'ACTIVE' ? 'emerald' : 'rose'}>{s.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Appoint Staff Member" maxWidth="md">
        <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Role Designation</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value="Accountant">Accountant</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Coordinator">Coordinator</option>
              <option value="Security">Security Chief</option>
              <option value="Cleaner">Maintenance Cleaner</option>
              <option value="Driver">Transport Driver</option>
              <option value="Other">Other Staff</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Base Salary ($)</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 font-bold text-white bg-indigo-600 rounded-xl shadow-md">
              Appoint Staff
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
