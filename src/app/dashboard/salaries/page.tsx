'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, Plus, Printer, CheckCircle2, Calculator } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function SalariesPage() {
  const { toast } = useToast();
  const [salaries, setSalaries] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [selectedSalarySlip, setSelectedSalarySlip] = useState<any>(null);

  const [form, setForm] = useState({
    staffType: 'TEACHER',
    teacherId: '',
    staffId: '',
    month: 'August',
    year: '2026',
    baseSalary: '4500',
    bonus: '300',
    deduction: '100',
    advance: '0',
    paymentMethod: 'BANK_TRANSFER',
  });

  const fetchSalaries = () => {
    setLoading(true);
    fetch('/api/salaries')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSalaries(data.salaries);
          setTeachers(data.teachers);
          setStaff(data.staff);
          if (data.teachers.length > 0) {
            setForm((prev) => ({
              ...prev,
              teacherId: data.teachers[0].id,
              baseSalary: data.teachers[0].salary?.toString() || '4500',
            }));
          }
        }
      })
      .catch(() => toast('Error', 'Failed to load payroll data', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  const base = parseFloat(form.baseSalary || '0');
  const bonus = parseFloat(form.bonus || '0');
  const deduction = parseFloat(form.deduction || '0');
  const advance = parseFloat(form.advance || '0');
  // Prompt calculation rule: Net Salary = Base Salary + Bonus - Deduction - Advance
  const calculatedNetSalary = base + bonus - deduction - advance;

  const handleProcessSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status: 'PAID' }),
      });
      const data = await res.json();
      if (data.success) {
        toast('Salary Slip Issued!', `Slip #${data.salary.salarySlipNo} created successfully.`, 'success');
        setIsProcessModalOpen(false);
        fetchSalaries();
        setSelectedSalarySlip(data.salary);
      } else {
        toast('Error', data.error || 'Failed to process salary', 'error');
      }
    } catch {
      toast('Error', 'Server error processing salary', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Payroll & Salary Disbursement
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Automatic Net Salary calculation (Base + Bonus - Deduction - Advance) & Salary Slips</p>
        </div>
        <button
          onClick={() => setIsProcessModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Issue Salary Slip
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
                  <th className="py-3 px-2">Salary Slip #</th>
                  <th className="py-3 px-2">Faculty / Staff Member</th>
                  <th className="py-3 px-2">Month / Year</th>
                  <th className="py-3 px-2">Base Salary</th>
                  <th className="py-3 px-2">Bonus / Deductions</th>
                  <th className="py-3 px-2">Net Salary</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
                {salaries.map((sal) => {
                  const recipientName = sal.teacher?.name || sal.staff?.name || 'Staff Member';
                  return (
                    <tr key={sal.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">{sal.salarySlipNo}</td>
                      <td className="py-3 px-2 font-bold text-gray-900 dark:text-white">
                        {recipientName}
                        <span className="block text-[10px] text-gray-400">{sal.staffType}</span>
                      </td>
                      <td className="py-3 px-2 text-gray-600 dark:text-slate-300">{sal.month} {sal.year}</td>
                      <td className="py-3 px-2 font-mono">${sal.baseSalary?.toFixed(2)}</td>
                      <td className="py-3 px-2 text-gray-500 font-mono text-[11px]">
                        +${sal.bonus} / -${sal.deduction + sal.advance}
                      </td>
                      <td className="py-3 px-2 font-mono font-bold text-emerald-600 text-sm">${sal.netSalary?.toFixed(2)}</td>
                      <td className="py-3 px-2">
                        <Badge variant={sal.status === 'PAID' ? 'emerald' : 'amber'}>{sal.status}</Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => setSelectedSalarySlip(sal)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                        >
                          Print Slip
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Process Salary Modal */}
      <Modal isOpen={isProcessModalOpen} onClose={() => setIsProcessModalOpen(false)} title="Issue Salary Slip" maxWidth="md">
        <form onSubmit={handleProcessSalary} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Staff Category</label>
              <select
                value={form.staffType}
                onChange={(e) => setForm({ ...form, staffType: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                <option value="TEACHER">Teacher / Faculty</option>
                <option value="STAFF">Administrative Staff</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Recipient *</label>
              <select
                value={form.staffType === 'TEACHER' ? form.teacherId : form.staffId}
                onChange={(e) => {
                  const id = e.target.value;
                  if (form.staffType === 'TEACHER') {
                    const t = teachers.find((x) => x.id === id);
                    setForm({ ...form, teacherId: id, baseSalary: t?.salary?.toString() || '4500' });
                  } else {
                    const s = staff.find((x) => x.id === id);
                    setForm({ ...form, staffId: id, baseSalary: s?.salary?.toString() || '3200' });
                  }
                }}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                {form.staffType === 'TEACHER'
                  ? teachers.map((t) => <option key={t.id} value={t.id}>{t.name} (${t.salary})</option>)
                  : staff.map((s) => <option key={s.id} value={s.id}>{s.name} - {s.role}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Base Salary ($)</label>
              <input
                type="number"
                value={form.baseSalary}
                onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Bonus ($)</label>
              <input
                type="number"
                value={form.bonus}
                onChange={(e) => setForm({ ...form, bonus: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Deductions ($)</label>
              <input
                type="number"
                value={form.deduction}
                onChange={(e) => setForm({ ...form, deduction: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Advance ($)</label>
              <input
                type="number"
                value={form.advance}
                onChange={(e) => setForm({ ...form, advance: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-mono"
              />
            </div>
          </div>

          {/* Formula calculation display */}
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-between">
            <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-indigo-600" /> Calculated Net Salary:
            </span>
            <span className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400">
              ${calculatedNetSalary.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsProcessModalOpen(false)}
              className="px-4 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 font-bold text-white bg-indigo-600 rounded-xl shadow-md">
              Disburse & Issue Slip
            </button>
          </div>
        </form>
      </Modal>

      {/* Salary Slip Modal */}
      {selectedSalarySlip && (
        <Modal isOpen={Boolean(selectedSalarySlip)} onClose={() => setSelectedSalarySlip(null)} title="Official Salary Payslip" maxWidth="lg">
          <div className="printable-content space-y-4 text-xs p-4">
            <div className="text-center border-b pb-3">
              <h3 className="font-bold text-lg text-indigo-600">Eduvora Global Academy</h3>
              <p className="text-gray-400">Payslip #: {selectedSalarySlip.salarySlipNo}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 font-semibold">Employee Name:</p>
                <p className="font-bold text-sm text-gray-900 dark:text-white">{selectedSalarySlip.teacher?.name || selectedSalarySlip.staff?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 font-semibold">Pay Period:</p>
                <p className="font-bold">{selectedSalarySlip.month} {selectedSalarySlip.year}</p>
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t font-mono">
              <div className="flex justify-between"><span>Base Salary:</span> <span>${selectedSalarySlip.baseSalary?.toFixed(2)}</span></div>
              <div className="flex justify-between text-emerald-600"><span>Bonus:</span> <span>+${selectedSalarySlip.bonus?.toFixed(2)}</span></div>
              <div className="flex justify-between text-rose-500"><span>Deduction:</span> <span>-${selectedSalarySlip.deduction?.toFixed(2)}</span></div>
              <div className="flex justify-between text-rose-500"><span>Advance:</span> <span>-${selectedSalarySlip.advance?.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-sm text-gray-900 dark:text-white border-t pt-2">
                <span>Net Salary Paid:</span>
                <span className="text-indigo-600">${selectedSalarySlip.netSalary?.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 no-print">
              <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2">
                <Printer className="w-4 h-4" /> Print Payslip
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
