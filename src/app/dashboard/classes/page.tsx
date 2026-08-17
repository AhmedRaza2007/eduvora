'use client';

import React, { useEffect, useState } from 'react';
import { School, Plus, Users, BookOpen } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function ClassesPage() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    classTeacherId: '',
  });

  const fetchClasses = () => {
    setLoading(true);
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setClasses(data.classes);
          setTeachers(data.teachers);
        }
      })
      .catch(() => toast('Error', 'Failed to fetch classes', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CLASS', ...form }),
      });
      const data = await res.json();
      if (data.success) {
        toast('Class Created', `${data.class.name} added with Section A!`, 'success');
        setIsAddModalOpen(false);
        fetchClasses();
      } else {
        toast('Error', data.error || 'Failed to create class', 'error');
      }
    } catch {
      toast('Error', 'Server error creating class', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <School className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Academic Classes & Sections
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Configure classes, section capacities, and assign head class teachers</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <TableSkeleton rows={3} />
        ) : (
          classes.map((cls) => (
            <div key={cls.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">{cls.name}</h3>
                  <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{cls.code}</p>
                </div>
                <Badge variant="indigo">{cls._count?.students || 0} Students</Badge>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 text-xs space-y-1">
                <p className="text-gray-400">Class Head Teacher:</p>
                <p className="font-bold text-gray-900 dark:text-white">{cls.classTeacher?.name || 'Unassigned'}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Sections Configured</p>
                <div className="flex flex-wrap gap-2">
                  {cls.sections?.map((sec: any) => (
                    <span key={sec.id} className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800/50">
                      {sec.name} ({sec._count?.students || 0}/{sec.capacity})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Class" maxWidth="md">
        <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Class Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Grade 11 Pre-Medical or BS Computer Science"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Class Code</label>
            <input
              type="text"
              placeholder="e.g. G11-MED"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Assign Class Teacher</label>
            <select
              value={form.classTeacherId}
              onChange={(e) => setForm({ ...form, classTeacherId: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value="">None / Select Teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
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
              Create Class
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
