'use client';

import React, { useEffect, useState } from 'react';
import { UserPlus, Plus, CheckCircle, XCircle, Clock, UserCheck } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function AdmissionsPage() {
  const { toast } = useToast();
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [form, setForm] = useState({
    applicantName: '',
    dob: '2012-05-10',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    targetClassId: '',
    parentName: '',
    parentPhone: '',
    admissionFee: '500',
  });

  const fetchAdmissions = () => {
    setLoading(true);
    fetch('/api/admissions')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAdmissions(data.admissions);
      })
      .catch(() => toast('Error', 'Failed to fetch admissions', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.classes.length > 0) {
          setClasses(data.classes);
          setForm((prev) => ({ ...prev, targetClassId: data.classes[0].id }));
        }
      });

    fetchAdmissions();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast('Application Submitted', `Application #${data.admission.applicationNo} received!`, 'success');
        setIsAddModalOpen(false);
        fetchAdmissions();
      } else {
        toast('Error', data.error || 'Failed to submit application', 'error');
      }
    } catch {
      toast('Error', 'Server error submitting application', 'error');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        toast('Status Updated', `Application status changed to ${status}`, 'info');
        fetchAdmissions();
      } else {
        toast('Error', data.error || 'Failed to update status', 'error');
      }
    } catch {
      toast('Error', 'Failed to update admission status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> New Student Admissions Desk
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Application intake, verification, approval, and auto-enrollment</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Admission Application
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
                  <th className="py-3 px-2">App #</th>
                  <th className="py-3 px-2">Applicant</th>
                  <th className="py-3 px-2">Target Class</th>
                  <th className="py-3 px-2">Parent / Contact</th>
                  <th className="py-3 px-2">Fee</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
                {admissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">{adm.applicationNo}</td>
                    <td className="py-3 px-2 font-bold text-gray-900 dark:text-white">
                      {adm.applicantName}
                      <span className="block text-[10px] text-gray-400">{adm.gender} • Applied: {adm.appliedDate}</span>
                    </td>
                    <td className="py-3 px-2 font-semibold text-gray-700 dark:text-slate-300">{adm.targetClass?.name}</td>
                    <td className="py-3 px-2 text-gray-600 dark:text-slate-300">
                      {adm.parentName}
                      <span className="block text-[10px] text-gray-400">{adm.parentPhone}</span>
                    </td>
                    <td className="py-3 px-2 font-mono font-bold">${adm.admissionFee?.toFixed(2)}</td>
                    <td className="py-3 px-2">
                      <Badge
                        variant={
                          adm.status === 'ENROLLED'
                            ? 'emerald'
                            : adm.status === 'APPROVED'
                            ? 'indigo'
                            : adm.status === 'REJECTED'
                            ? 'rose'
                            : 'amber'
                        }
                      >
                        {adm.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-right space-x-1">
                      {adm.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(adm.id, 'APPROVED')}
                            className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-bold hover:bg-indigo-100"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(adm.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg font-bold hover:bg-rose-100"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {adm.status === 'APPROVED' && (
                        <button
                          onClick={() => handleUpdateStatus(adm.id, 'ENROLLED')}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-500 shadow-sm"
                        >
                          Enroll Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Admission Application" maxWidth="lg">
        <form onSubmit={handleApply} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Applicant Full Name *</label>
              <input
                type="text"
                required
                value={form.applicantName}
                onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Target Class *</label>
              <select
                required
                value={form.targetClassId}
                onChange={(e) => setForm({ ...form, targetClassId: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Parent / Guardian Name *</label>
              <input
                type="text"
                required
                value={form.parentName}
                onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Contact Phone *</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value, parentPhone: e.target.value })}
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
              Submit Application
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
