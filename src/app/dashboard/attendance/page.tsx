'use client';

import React, { useEffect, useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Filter,
  Save,
  ShieldAlert,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useRole } from '@/context/RoleContext';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function AttendancePage() {
  const { toast } = useToast();
  const { role } = useRole();

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: string; remarks: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.classes.length > 0) {
          setClasses(data.classes);
          setSelectedClass(data.classes[0].id);
          setSelectedSection(data.classes[0].sections?.[0]?.id || '');
        }
      });
  }, []);

  const fetchAttendanceSheet = () => {
    if (!selectedSection) return;
    setLoading(true);
    fetch(`/api/attendance?date=${date}&sectionId=${selectedSection}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStudents(data.students);

          // Build attendance map from existing records
          const map: Record<string, { status: string; remarks: string }> = {};
          data.students.forEach((st: any) => {
            const existing = data.attendances.find((a: any) => a.studentId === st.id);
            map[st.id] = {
              status: existing ? existing.status : 'PRESENT',
              remarks: existing?.remarks || '',
            };
          });
          setAttendanceMap(map);
        }
      })
      .catch(() => toast('Error', 'Failed to fetch attendance grid', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAttendanceSheet();
  }, [selectedSection, date]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    const records = Object.keys(attendanceMap).map((stId) => ({
      studentId: stId,
      status: attendanceMap[stId].status,
      remarks: attendanceMap[stId].remarks,
      sectionId: selectedSection,
    }));

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records, date, sectionId: selectedSection }),
      });
      const data = await res.json();
      if (data.success) {
        toast('Attendance Saved!', `Recorded attendance for ${records.length} students on ${date}.`, 'success');
        fetchAttendanceSheet();
      } else {
        toast('Error', data.error || 'Failed to save attendance', 'error');
      }
    } catch {
      toast('Error', 'Server error saving attendance', 'error');
    } finally {
      setSaving(false);
    }
  };

  const markAll = (status: string) => {
    const nextMap: Record<string, { status: string; remarks: string }> = {};
    students.forEach((st) => {
      nextMap[st.id] = { status, remarks: attendanceMap[st.id]?.remarks || '' };
    });
    setAttendanceMap(nextMap);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Daily Class Attendance Engine
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Class & section marking with duplicate prevention & teacher access validation</p>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={saving || loading || students.length === 0}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/25 flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Submit Attendance Sheet'}
        </button>
      </div>

      {/* Class & Date Selector Filters */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <label className="font-bold text-gray-700 dark:text-slate-300">Class:</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                const clsId = e.target.value;
                setSelectedClass(clsId);
                const selCls = classes.find((c) => c.id === clsId);
                if (selCls?.sections?.[0]) setSelectedSection(selCls.sections[0].id);
              }}
              className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold text-gray-900 dark:text-white"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-bold text-gray-700 dark:text-slate-300">Section:</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold text-gray-900 dark:text-white"
            >
              {classes.find((c) => c.id === selectedClass)?.sections?.map((sec: any) => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <label className="font-bold text-gray-700 dark:text-slate-300">Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Quick Mark Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => markAll('PRESENT')}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100 transition-colors"
          >
            Mark All Present
          </button>
          <button
            onClick={() => markAll('ABSENT')}
            className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-100 transition-colors"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Attendance Grid Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Student Roster ({students.length} Total Enrolled)
          </h3>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Duplicate Protection Active
          </span>
        </div>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : students.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">No students enrolled in this section.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 uppercase font-semibold">
                  <th className="py-3 px-2">Roll #</th>
                  <th className="py-3 px-2">Student Name</th>
                  <th className="py-3 px-2">Student ID</th>
                  <th className="py-3 px-2 text-center">Status Selection</th>
                  <th className="py-3 px-2">Remarks / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
                {students.map((st) => {
                  const currentStatus = attendanceMap[st.id]?.status || 'PRESENT';
                  return (
                    <tr key={st.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-2 font-mono font-bold text-gray-900 dark:text-white">{st.rollNo}</td>
                      <td className="py-3 px-2 font-semibold text-gray-900 dark:text-white">
                        {st.firstName} {st.lastName}
                      </td>
                      <td className="py-3 px-2 font-mono text-gray-500">{st.studentId}</td>

                      {/* Status Selector Buttons */}
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-center gap-1">
                          {[
                            { key: 'PRESENT', label: 'Present', color: 'bg-emerald-600 text-white' },
                            { key: 'ABSENT', label: 'Absent', color: 'bg-rose-600 text-white' },
                            { key: 'LEAVE', label: 'Leave', color: 'bg-amber-500 text-white' },
                            { key: 'LATE', label: 'Late', color: 'bg-indigo-600 text-white' },
                          ].map((b) => (
                            <button
                              key={b.key}
                              type="button"
                              onClick={() => handleStatusChange(st.id, b.key)}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all ${
                                currentStatus === b.key
                                  ? `${b.color} shadow-md scale-105`
                                  : 'bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-2">
                        <input
                          type="text"
                          placeholder="Add remark..."
                          value={attendanceMap[st.id]?.remarks || ''}
                          onChange={(e) =>
                            setAttendanceMap((prev) => ({
                              ...prev,
                              [st.id]: { ...prev[st.id], remarks: e.target.value },
                            }))
                          }
                          className="w-full px-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
