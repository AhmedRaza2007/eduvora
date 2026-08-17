'use client';

import React, { useEffect, useState } from 'react';
import { Receipt, Plus, Filter, DollarSign, Calendar, Paperclip } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function ExpensesPage() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const categories = [
    'ELECTRICITY',
    'RENT',
    'STATIONERY',
    'MAINTENANCE',
    'EVENTS',
    'TRANSPORT',
    'INTERNET',
    'UTILITIES',
    'EQUIPMENT',
    'OTHER',
  ];

  const [form, setForm] = useState({
    title: '',
    category: 'STATIONERY',
    amount: '450',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    description: '',
  });

  const fetchExpenses = () => {
    setLoading(true);
    const q = selectedCategory ? `?category=${selectedCategory}` : '';
    fetch(`/api/expenses${q}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setExpenses(data.expenses);
          setTotalExpense(data.totalExpense);
        }
      })
      .catch(() => toast('Error', 'Failed to fetch expenses', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedCategory]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast('Expense Recorded', `Voucher #${data.expense.expenseNo} logged successfully.`, 'success');
        setIsAddModalOpen(false);
        fetchExpenses();
      } else {
        toast('Error', data.error || 'Failed to add expense', 'error');
      }
    } catch {
      toast('Error', 'Server error adding expense', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Operational Expenses Management
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Track utility bills, maintenance, stationery, equipment, and campus overheads</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Expense Voucher
        </button>
      </div>

      {/* Filter & Summary Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="font-bold text-gray-700 dark:text-slate-300">Category Filter:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold text-gray-900 dark:text-white"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/50 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 font-bold">
          <span>Total Filtered Expense:</span>
          <span className="font-mono text-base">${totalExpense?.toLocaleString()}</span>
        </div>
      </div>

      {/* Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 uppercase font-semibold">
                  <th className="py-3 px-2">Voucher #</th>
                  <th className="py-3 px-2">Expense Title</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Payment Method</th>
                  <th className="py-3 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">{e.expenseNo}</td>
                    <td className="py-3 px-2 font-bold text-gray-900 dark:text-white">
                      {e.title}
                      {e.description && <span className="block text-[10px] text-gray-400">{e.description}</span>}
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant="rose">{e.category}</Badge>
                    </td>
                    <td className="py-3 px-2 font-mono text-gray-500">{e.date}</td>
                    <td className="py-3 px-2 font-semibold text-gray-700 dark:text-slate-300">{e.paymentMethod}</td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                      -${e.amount?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Record Expense Voucher" maxWidth="md">
        <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Expense Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Amount ($) *</label>
              <input
                type="number"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Date *</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Payment Method</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CARD">Card</option>
              </select>
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
              Save Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
