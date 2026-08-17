'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Trash2,
  Edit,
  UserCheck,
  UserX,
  Phone,
  Mail,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function StudentsPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male',
    dob: '2010-05-15',
    phone: '',
    email: '',
    address: '',
    classId: '',
    sectionId: '',
    rollNo: '',
    parentName: '',
    parentPhone: '',
    parentRelationship: 'Father',
  });

  const fetchStudents = () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (selectedClass) query.append('classId', selectedClass);
    if (selectedStatus) query.append('status', selectedStatus);

    fetch(`/api/students?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStudents(data.students);
      })
      .catch(() => toast('Error', 'Failed to load students', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setClasses(data.classes);
          if (data.classes.length > 0) {
            setFormData((prev) => ({
              ...prev,
              classId: data.classes[0].id,
              sectionId: data.classes[0].sections?.[0]?.id || '',
            }));
          }
        }
      });

    fetchStudents();
  }, [search, selectedClass, selectedStatus]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast('Success', `Student ${data.student.firstName} ${data.student.lastName} enrolled!`, 'success');
        setIsAddModalOpen(false);
        fetchStudents();
      } else {
        toast('Error', data.error || 'Failed to enroll student', 'error');
      }
    } catch {
      toast('Error', 'Server error creating student', 'error');
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/students/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast('Deleted', 'Student record removed successfully', 'info');
        setDeleteId(null);
        fetchStudents();
      } else {
        toast('Error', data.error || 'Failed to delete student', 'error');
      }
    } catch {
      toast('Error', 'Failed to delete student', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Student Management
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Manage active enrollments, parents, and student directory</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Enroll New Student
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ID, roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="GRADUATED">Graduated</option>
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm">
        {loading ? (
          <TableSkeleton rows={6} />
        ) : students.length === 0 ? (
          <EmptyState
            title="No students found"
            description="Try adjusting your filters or click below to enroll a new student."
            actionText="Enroll Student"
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 uppercase font-semibold">
                  <th className="py-3 px-2">Student</th>
                  <th className="py-3 px-2">Student ID / Adm #</th>
                  <th className="py-3 px-2">Class / Section</th>
                  <th className="py-3 px-2">Parent / Guardian</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={st.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                          alt={st.firstName}
                          className="w-9 h-9 rounded-full object-cover border border-indigo-500/30"
                        />
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{st.firstName} {st.lastName}</p>
                          <p className="text-[10px] text-gray-400">Roll #: {st.rollNo} ({st.gender})</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-2">
                      <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{st.studentId}</p>
                      <p className="text-[10px] text-gray-400">{st.admissionNo}</p>
                    </td>

                    <td className="py-3 px-2 font-medium text-gray-700 dark:text-slate-300">
                      {st.class?.name || 'Unassigned'}
                      <span className="block text-[10px] text-gray-400">{st.section?.name || 'Section A'}</span>
                    </td>

                    <td className="py-3 px-2">
                      <p className="font-semibold text-gray-900 dark:text-white">{st.parent?.name || 'N/A'}</p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" /> {st.parent?.contact || 'N/A'}
                      </p>
                    </td>

                    <td className="py-3 px-2">
                      <Badge variant={st.status === 'ACTIVE' ? 'emerald' : 'rose'}>{st.status}</Badge>
                    </td>

                    <td className="py-3 px-2 text-right space-x-1">
                      <Link
                        href={`/dashboard/students/${st.id}`}
                        className="inline-flex p-1.5 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteId(st.id)}
                        className="p-1.5 text-rose-600 hover:text-rose-800 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="New Student Admission" maxWidth="2xl">
        <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Class Assigned *</label>
              <select
                required
                value={formData.classId}
                onChange={(e) => {
                  const selCls = classes.find((c) => c.id === e.target.value);
                  setFormData({
                    ...formData,
                    classId: e.target.value,
                    sectionId: selCls?.sections?.[0]?.id || '',
                  });
                }}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Roll Number</label>
              <input
                type="text"
                placeholder="Auto or e.g. 101"
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Parent / Guardian Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-gray-700 dark:text-slate-300">Parent Name</label>
                <input
                  type="text"
                  placeholder="Father/Mother name"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 dark:text-slate-300">Parent Phone</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25"
            >
              Enroll Student
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteStudent}
        title="Delete Student Record"
        message="Are you sure you want to permanently remove this student and their historical attendance & fee records?"
        isLoading={isDeleting}
      />
    </div>
  );
}
