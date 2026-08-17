'use client';

import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Plus,
  Phone,
  Mail,
  BookOpen,
  DollarSign,
  Search,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function TeachersPage() {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    qualification: 'M.Sc. Advanced Mathematics',
    salary: '4500',
    joiningDate: '2026-08-01',
  });

  const fetchTeachers = () => {
    setLoading(true);
    fetch('/api/teachers')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTeachers(data.teachers);
      })
      .catch(() => toast('Error', 'Failed to fetch teachers', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast('Teacher Appointed', `${data.teacher.name} added to faculty roster!`, 'success');
        setIsAddModalOpen(false);
        fetchTeachers();
      } else {
        toast('Error', data.error || 'Failed to add teacher', 'error');
      }
    } catch {
      toast('Error', 'Server error adding teacher', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Faculty & Teacher Management
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Manage academic qualifications, subject assignments, and base salaries</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Appoint New Teacher
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((t) => (
              <div key={t.id} className="p-5 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 space-y-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <img
                    src={t.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'}
                    alt={t.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/30"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">{t.name}</h3>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono font-semibold">{t.teacherId}</p>
                    <Badge variant="indigo" className="mt-1">{t.qualification}</Badge>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 dark:text-slate-300 pt-3 border-t border-gray-200/60 dark:border-slate-700/60">
                  <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gray-400" /> {t.email}</p>
                  <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" /> {t.phone}</p>
                  <p className="flex items-center gap-2"><DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Base Salary: <span className="font-mono font-bold text-emerald-600">${t.salary?.toLocaleString()}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Appoint Teacher" maxWidth="md">
        <form onSubmit={handleAddTeacher} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Teacher Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
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
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Qualification Degree</label>
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
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

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 font-bold text-white bg-indigo-600 rounded-xl shadow-md">
              Appoint Teacher
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
