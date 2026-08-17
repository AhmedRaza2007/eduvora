'use client';

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Plus,
  Receipt,
  Search,
  DollarSign,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { ReceiptModal } from '@/components/ui/ReceiptModal';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function FeesPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [feeTypes, setFeeTypes] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<any>(null);

  // Invoice Form
  const [invoiceForm, setInvoiceForm] = useState({
    studentId: '',
    feeTypeId: '',
    title: 'Monthly Tuition Fee - August 2026',
    amount: '450',
    dueDate: '2026-08-25',
  });

  // Payment Form
  const [paymentForm, setPaymentForm] = useState({
    amountPaid: '',
    paymentMethod: 'CASH',
    transactionRef: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  const fetchData = () => {
    setLoading(true);
    fetch('/api/fees')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setInvoices(data.invoices);
          setFeeTypes(data.feeTypes);
          setPayments(data.payments);
        }
      })
      .catch(() => toast('Error', 'Failed to fetch fee data', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStudents(data.students);
          if (data.students.length > 0) {
            setInvoiceForm((prev) => ({ ...prev, studentId: data.students[0].id }));
          }
        }
      });
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_INVOICE',
          ...invoiceForm,
          feeTypeId: invoiceForm.feeTypeId || feeTypes[0]?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast('Success', `Invoice ${data.invoice.invoiceNo} generated!`, 'success');
        setIsInvoiceModalOpen(false);
        fetchData();
      } else {
        toast('Error', data.error || 'Failed to create invoice', 'error');
      }
    } catch {
      toast('Error', 'Server error creating invoice', 'error');
    }
  };

  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'COLLECT_PAYMENT',
          invoiceId: selectedInvoice.id,
          ...paymentForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast('Payment Processed!', `Receipt #${data.payment.receiptNo} created.`, 'success');
        setIsPaymentModalOpen(false);
        fetchData();
        setSelectedReceiptPayment({ ...data.payment, invoice: data.invoice });
      } else {
        toast('Error', data.error || 'Failed to process payment', 'error');
      }
    } catch {
      toast('Error', 'Server error collecting payment', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Fees & Billing Management
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Invoice creation, payment collection, balance calculations, and official receipts</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Fee Invoice
          </button>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Active Fee Invoices</h3>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 uppercase font-semibold">
                  <th className="py-3 px-2">Invoice #</th>
                  <th className="py-3 px-2">Student</th>
                  <th className="py-3 px-2">Fee Type & Title</th>
                  <th className="py-3 px-2">Due Date</th>
                  <th className="py-3 px-2">Total Amount</th>
                  <th className="py-3 px-2">Paid Amount</th>
                  <th className="py-3 px-2">Remaining</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
                {invoices.map((inv) => {
                  const remaining = Math.max(0, inv.amount - inv.paidAmount);
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">{inv.invoiceNo}</td>
                      <td className="py-3 px-2 font-semibold text-gray-900 dark:text-white">
                        {inv.student?.firstName} {inv.student?.lastName}
                      </td>
                      <td className="py-3 px-2 text-gray-600 dark:text-slate-300">
                        {inv.title}
                        <span className="block text-[10px] text-gray-400">{inv.feeType?.name}</span>
                      </td>
                      <td className="py-3 px-2 font-mono text-gray-500">{inv.dueDate}</td>
                      <td className="py-3 px-2 font-mono font-bold text-gray-900 dark:text-white">${inv.amount?.toFixed(2)}</td>
                      <td className="py-3 px-2 font-mono text-emerald-600 font-semibold">${inv.paidAmount?.toFixed(2)}</td>
                      <td className="py-3 px-2 font-mono font-bold text-rose-600 dark:text-rose-400">${remaining.toFixed(2)}</td>
                      <td className="py-3 px-2">
                        <Badge
                          variant={
                            inv.status === 'PAID'
                              ? 'emerald'
                              : inv.status === 'PARTIAL'
                              ? 'amber'
                              : inv.status === 'OVERDUE'
                              ? 'rose'
                              : 'slate'
                          }
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        {remaining > 0 ? (
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setPaymentForm({ ...paymentForm, amountPaid: remaining.toString() });
                              setIsPaymentModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-all"
                          >
                            Collect Payment
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (inv.payments?.[0]) {
                                setSelectedReceiptPayment({ ...inv.payments[0], invoice: inv });
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] hover:underline"
                          >
                            View Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="Generate Fee Invoice" maxWidth="md">
        <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Select Student *</label>
            <select
              required
              value={invoiceForm.studentId}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.firstName} {st.lastName} ({st.studentId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Fee Category</label>
            <select
              value={invoiceForm.feeTypeId}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, feeTypeId: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              {feeTypes.map((ft) => (
                <option key={ft.id} value={ft.id}>{ft.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Invoice Title *</label>
            <input
              type="text"
              required
              value={invoiceForm.title}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, title: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Amount ($) *</label>
              <input
                type="number"
                required
                value={invoiceForm.amount}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Due Date *</label>
              <input
                type="date"
                required
                value={invoiceForm.dueDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(false)}
              className="px-4 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 font-bold text-white bg-indigo-600 rounded-xl shadow-md">
              Issue Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Collect Payment Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Collect Payment" maxWidth="md">
        <form onSubmit={handleCollectPayment} className="space-y-4 text-xs">
          {selectedInvoice && (
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800 space-y-1">
              <p className="font-bold text-gray-900 dark:text-white">{selectedInvoice.title}</p>
              <p className="text-gray-500">Student: {selectedInvoice.student?.firstName} {selectedInvoice.student?.lastName}</p>
              <p className="text-rose-600 font-mono font-bold">
                Remaining Balance: ${Math.max(0, selectedInvoice.amount - selectedInvoice.paidAmount).toFixed(2)}
              </p>
            </div>
          )}

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Payment Amount ($) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={paymentForm.amountPaid}
              onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Payment Method</label>
            <select
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CARD">Debit / Credit Card</option>
              <option value="ONLINE">Online Payment</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Transaction Reference #</label>
            <input
              type="text"
              placeholder="e.g. TXN-98402198 or Check #"
              value={paymentForm.transactionRef}
              onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 font-bold text-white bg-emerald-600 rounded-xl shadow-md">
              Confirm & Generate Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* Receipt Modal */}
      <ReceiptModal isOpen={Boolean(selectedReceiptPayment)} onClose={() => setSelectedReceiptPayment(null)} payment={selectedReceiptPayment} />
    </div>
  );
}
