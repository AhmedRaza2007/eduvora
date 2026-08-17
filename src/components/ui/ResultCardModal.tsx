'use client';

import React from 'react';
import { Modal } from './Modal';
import { Printer, Award, CheckCircle, XCircle } from 'lucide-react';

interface ResultCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultData: any;
}

export function ResultCardModal({ isOpen, onClose, resultData }: ResultCardModalProps) {
  if (!resultData) return null;

  const { result, marks = [] } = resultData;
  const student = result?.student || {};

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Academic Result Performance Card" maxWidth="2xl">
      <div className="printable-content space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800">
        {/* Header */}
        <div className="text-center border-b border-gray-100 dark:border-slate-800 pb-4">
          <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-2xl">
            <Award className="w-8 h-8 text-amber-500" /> Eduvora Global Academy
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Official Student Grade Report & Examination Record</p>
        </div>

        {/* Student & Exam Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 text-xs">
          <div>
            <span className="text-gray-400">Student Name</span>
            <p className="font-bold text-gray-900 dark:text-white">{student.firstName} {student.lastName}</p>
          </div>
          <div>
            <span className="text-gray-400">Roll / ID</span>
            <p className="font-bold text-gray-900 dark:text-white">{student.rollNo} / {student.studentId}</p>
          </div>
          <div>
            <span className="text-gray-400">Class</span>
            <p className="font-bold text-gray-900 dark:text-white">{student.class?.name || 'Grade 10'}</p>
          </div>
          <div>
            <span className="text-gray-400">Exam Title</span>
            <p className="font-bold text-gray-900 dark:text-white">{result?.exam?.name || 'Mid-Term Exam'}</p>
          </div>
        </div>

        {/* Marks breakdown */}
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-800 text-gray-400 uppercase font-semibold">
              <th className="py-2">Subject Name</th>
              <th className="py-2 text-center">Total Marks</th>
              <th className="py-2 text-center">Obtained</th>
              <th className="py-2 text-center">Grade</th>
              <th className="py-2 text-right">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {marks.map((m: any, i: number) => (
              <tr key={i}>
                <td className="py-3 font-medium text-gray-900 dark:text-white">
                  {m.examSchedule?.subject?.name || 'Subject'}
                </td>
                <td className="py-3 text-center font-mono">{m.examSchedule?.totalMarks || 100}</td>
                <td className="py-3 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">{m.marksObtained}</td>
                <td className="py-3 text-center font-bold">{m.grade || 'A'}</td>
                <td className="py-3 text-right text-gray-500">{m.remarks || 'Satisfactory'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Aggregate performance */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50">
          <div>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold uppercase">Overall Result Status</p>
            <div className="flex items-center gap-2 mt-1">
              {result?.status === 'PASS' ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                  <CheckCircle className="w-5 h-5" /> PASSED
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold text-lg">
                  <XCircle className="w-5 h-5" /> FAILED
                </span>
              )}
            </div>
          </div>

          <div className="text-right text-xs space-y-0.5">
            <p className="text-gray-500">Obtained: <span className="font-bold text-gray-900 dark:text-white">{result?.obtainedMarks} / {result?.totalMarks}</span></p>
            <p className="text-gray-500">Percentage: <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">{result?.percentage?.toFixed(1)}%</span></p>
            <p className="text-gray-500">Grade: <span className="font-bold text-amber-500 text-sm">{result?.grade}</span></p>
          </div>
        </div>

        {/* Footer print */}
        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-800 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md"
          >
            <Printer className="w-4 h-4" /> Print Result Card
          </button>
        </div>
      </div>
    </Modal>
  );
}
