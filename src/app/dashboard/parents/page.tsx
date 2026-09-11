'use client';

import React, { useEffect, useState } from 'react';
import { Users2, Baby, Phone, Mail, Award, CreditCard, CalendarCheck } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function ParentsPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStudents(data.students);
          if (data.students.length > 0) setSelectedChild(data.students[0]);
        }
      })
      .catch(() => toast('Error', 'Failed to fetch parent child data', 'error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Parent Portal & Family Overview
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Parents can view multiple children, attendance, pending fee invoices, and exam grades</p>
        </div>
      </div>

      {/* Children Selection Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-3 text-xs">
        <span className="font-bold text-gray-700 dark:text-slate-300">Select Child Account:</span>
        <div className="flex flex-wrap gap-2">
          {students.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedChild?.id === child.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200'
              }`}
            >
              {child.firstName} {child.lastName} ({child.class?.name || 'Grade 10'})
            </button>
          ))}
        </div>
      </div>

      {selectedChild && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white flex items-center gap-4">
            <img
              src={selectedChild.photo || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150'}
              alt={selectedChild.firstName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400"
            />
            <div>
              <h3 className="text-xl font-extrabold">{selectedChild.firstName} {selectedChild.lastName}</h3>
              <p className="text-xs text-indigo-200 mt-1">
                Student ID: <span className="font-mono">{selectedChild.studentId}</span> • Class: {selectedChild.class?.name} ({selectedChild.section?.name})
              </p>
              <p className="text-xs text-indigo-200 mt-0.5">Parent: {selectedChild.parent?.name || 'Michael Vance'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs text-gray-400 font-bold uppercase">Attendance Rate</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">96.0%</p>
              <p className="text-[11px] text-gray-500">Present: 24 Days • Absent: 1 Day</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs text-gray-400 font-bold uppercase">Outstanding Fees</span>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">$100.00</p>
              <p className="text-[11px] text-amber-600 font-semibold">Mid-Term Exam Fee Partial</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs text-gray-400 font-bold uppercase">Academic GPA / Grade</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">3.95 (A+)</p>
              <p className="text-[11px] text-gray-500">Class Rank: #1</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
