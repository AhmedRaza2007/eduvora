'use client';

import React, { useEffect, useState } from 'react';
import { FileCheck, Search, Printer, Award } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Badge } from '@/components/ui/Badge';
import { ResultCardModal } from '@/components/ui/ResultCardModal';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function ResultsPage() {
  const { toast } = useToast();
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedResultData, setSelectedResultData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/exams')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setExams(data.exams);
          if (data.exams.length > 0) setSelectedExamId(data.exams[0].id);
        }
      });

    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStudents(data.students);
      })
      .finally(() => setLoading(false));
  }, []);

  const openResultCard = async (studentId: string) => {
    if (!selectedExamId) return;
    try {
      const res = await fetch(`/api/exams?examId=${selectedExamId}&studentId=${studentId}`);
      const data = await res.json();
      if (data.success && data.studentResultCard?.result) {
        setSelectedResultData(data.studentResultCard);
      } else {
        toast('No Result Record', 'Marks not yet processed for this student in selected exam.', 'warning');
      }
    } catch {
      toast('Error', 'Failed to fetch result card', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Student Result Cards & Rankings
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Generate printable term report cards, percentage ranks, and official pass/fail transcripts</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-3 text-xs">
        <label className="font-bold text-gray-700 dark:text-slate-300">Select Exam Session:</label>
        <select
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold text-gray-900 dark:text-white"
        >
          {exams.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 uppercase font-semibold">
                  <th className="py-3 px-2">Student</th>
                  <th className="py-3 px-2">Roll #</th>
                  <th className="py-3 px-2">Class / Section</th>
                  <th className="py-3 px-2 text-right">Result Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-2 font-bold text-gray-900 dark:text-white">
                      {st.firstName} {st.lastName}
                      <span className="block text-[10px] font-mono text-gray-400">{st.studentId}</span>
                    </td>
                    <td className="py-3 px-2 font-mono font-bold text-indigo-600">{st.rollNo}</td>
                    <td className="py-3 px-2 text-gray-600 dark:text-slate-300">{st.class?.name} ({st.section?.name})</td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => openResultCard(st.id)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 shadow-sm"
                      >
                        Generate Result Card
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ResultCardModal isOpen={Boolean(selectedResultData)} onClose={() => setSelectedResultData(null)} resultData={selectedResultData} />
    </div>
  );
}
