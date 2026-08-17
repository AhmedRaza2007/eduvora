'use client';

import React from 'react';
import { Modal } from './Modal';
import { Printer, Download, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: any;
}

export function ReceiptModal({ isOpen, onClose, payment }: ReceiptModalProps) {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoice = payment.invoice || {};
  const student = invoice.student || {};

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Official Payment Receipt" maxWidth="xl">
      <div className="printable-content space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-2xl">
              <span className="p-2 rounded-xl bg-indigo-600 text-white text-base">EV</span>
              Eduvora Global Academy
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">124 Academic Parkway, Suite 500, Education City</p>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Receipt Paid
            </span>
            <p className="text-xs text-gray-400 mt-2">Receipt #: <span className="font-mono font-bold text-gray-900 dark:text-white">{payment.receiptNo}</span></p>
            <p className="text-xs text-gray-400">Date: {payment.paymentDate}</p>
          </div>
        </div>

        {/* Student & Invoice info grid */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 text-xs">
          <div>
            <p className="text-gray-400 font-semibold uppercase">Student Details</p>
            <p className="font-bold text-sm text-gray-900 dark:text-white mt-1">{student.firstName} {student.lastName}</p>
            <p className="text-gray-500">Student ID: {student.studentId}</p>
            <p className="text-gray-500">Class: {student.class?.name || 'Grade 10'} ({student.section?.name || 'Sec A'})</p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold uppercase">Invoice Details</p>
            <p className="font-bold text-sm text-gray-900 dark:text-white mt-1">{invoice.title || 'Tuition Fee'}</p>
            <p className="text-gray-500">Invoice #: {invoice.invoiceNo}</p>
            <p className="text-gray-500">Payment Method: {payment.paymentMethod}</p>
          </div>
        </div>

        {/* Breakdown table */}
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-800 text-gray-400 uppercase font-semibold">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Fee Amount</th>
              <th className="py-2 text-right">Paid Now</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            <tr>
              <td className="py-3 font-medium text-gray-900 dark:text-white">
                {invoice.title || 'Academic Fee'}
                {payment.transactionRef && <span className="block text-xs text-gray-400 font-mono">Ref: {payment.transactionRef}</span>}
              </td>
              <td className="py-3 text-right font-mono text-gray-600 dark:text-slate-300">${invoice.amount?.toFixed(2)}</td>
              <td className="py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">${payment.amountPaid?.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* Balance total summary */}
        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-800">
          <div className="w-48 space-y-1 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Total Invoice:</span>
              <span className="font-mono">${invoice.amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Amount Paid:</span>
              <span className="font-mono font-bold text-emerald-600">${payment.amountPaid?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-gray-900 dark:text-white pt-2 border-t">
              <span>Remaining Balance:</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">
                ${Math.max(0, (invoice.amount || 0) - (invoice.paidAmount || 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800 no-print">
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" /> System Verified Digital Signature
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
