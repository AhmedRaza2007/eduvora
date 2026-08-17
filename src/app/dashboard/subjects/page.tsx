'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function SubjectsPage() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    subjectType: 'Core',
  });

  const fetchSubjects = () => {
    setLoading(true);
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSubjects(data.subjects);
      })
      .catch(() => toast('Error', 'Failed to fetch subjects', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SUBJECT', ...form }),
      });
      const data = await res.json();
      if (data.success) {
        toast('Subject Created', `${data.subject.name} added to curriculum!`, 'success');
        setIsAddModalOpen(false);
        fetchSubjects();
      } else {
        toast('Error', data.error || 'Failed to create subject', 'error');
      }
    } catch {
      toast('Error', 'Server error creating subject', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Academic Subjects Directory
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Manage core, elective, and practical course subjects</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm">
        {loading ? (
          <TableSkeleton rows={4} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjects.map((sub) => (
              <div key={sub.id} className="p-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">{sub.code}</span>
                  <Badge variant={sub.type === 'Core' ? 'emerald' : 'purple'}>{sub.type}</Badge>
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">{sub.name}</h3>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Subject" maxWidth="md">
        <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Subject Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Quantum Physics or Data Structures"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Subject Code</label>
            <input
              type="text"
              placeholder="e.g. CS-301"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Category Type</label>
            <select
              value={form.subjectType}
              onChange={(e) => setForm({ ...form, subjectType: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value="Core">Core Subject</option>
              <option value="Elective">Elective Course</option>
              <option value="Practical">Practical Lab</option>
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
              Save Subject
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
