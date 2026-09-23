'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  CalendarCheck,
  Award,
  Clock,
  BookOpen,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  LogOut,
  Building2,
} from 'lucide-react';

export default function TeacherPortalPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Attendance State
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, string>>({});
  const [attMessage, setAttMessage] = useState('');

  // Marks Entry State
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [marksInputs, setMarksInputs] = useState<Record<string, string>>({});
  const [marksMessage, setMarksMessage] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/classes').then((r) => r.json()),
      fetch('/api/timetable').then((r) => r.json()),
      fetch('/api/students').then((r) => r.json()),
      fetch('/api/exams').then((r) => r.json()),
    ])
      .then(([classesData, ttData, stuData, examData]) => {
        if (classesData.success && classesData.classes) {
          setClasses(classesData.classes);
          if (classesData.classes.length > 0) {
            setSelectedClass(classesData.classes[0]);
            if (classesData.classes[0].sections?.length > 0) {
              setSelectedSection(classesData.classes[0].sections[0]);
            }
          }
        }
        if (ttData.success && ttData.timetables) setTimetables(ttData.timetables);
        if (stuData.success && stuData.students) setStudents(stuData.students);
        if (examData.success && examData.exams) {
          setExams(examData.exams);
          if (examData.exams.length > 0) {
            setSelectedExam(examData.exams[0]);
            if (examData.exams[0].schedules?.length > 0) {
              setSelectedSchedule(examData.exams[0].schedules[0]);
            }
          }
        }
      })
      .catch((err) => console.error('Error loading teacher data:', err))
      .finally(() => setLoading(false));
  }, []);

  const classStudents = students.filter(
    (s) =>
      (!selectedClass || s.classId === selectedClass.id) &&
      (!selectedSection || s.sectionId === selectedSection.id)
  );

  const handleSaveAttendance = async () => {
    setAttMessage('');
    const records = classStudents.map((s) => ({
      studentId: s.id,
      sectionId: selectedSection?.id,
      status: attendanceRecords[s.id] || 'PRESENT',
    }));

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records,
          date: attendanceDate,
          sectionId: selectedSection?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAttMessage(`Successfully saved attendance for ${records.length} students!`);
      }
    } catch {
      setAttMessage('Failed to save attendance.');
    }
  };

  const handleSaveMark = async (studentId: string) => {
    const markVal = marksInputs[studentId];
    if (!markVal || !selectedSchedule) return;

    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ENTRY_MARKS',
          examScheduleId: selectedSchedule.id,
          studentId,
          marksObtained: markVal,
          totalMarks: selectedSchedule.totalMarks,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMarksMessage(`Marks recorded successfully (${data.mark.grade})!`);
      }
    } catch {
      setMarksMessage('Failed to save marks.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20">
            TP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-tight">Faculty & Teacher Portal</h1>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-bold">
                Assigned Classes
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Class Attendance, Timetable Slots & Marks Entry</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors font-semibold"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Institutional Dashboard
          </Link>
          <button
            onClick={() => {
              fetch('/api/auth/logout', { method: 'POST' }).then(() => {
                window.location.href = '/login';
              });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors font-bold"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Overview */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assigned Classes</span>
            <p className="text-2xl font-black text-white">{classes.length || 3}</p>
            <span className="text-[10px] text-indigo-400 font-semibold">Active courses & sections</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Weekly Lectures</span>
            <p className="text-2xl font-black text-blue-400">{timetables.length || 8}</p>
            <span className="text-[10px] text-slate-500 font-semibold">Scheduled timetable slots</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Enrolled Students</span>
            <p className="text-2xl font-black text-emerald-400">{students.length || 12}</p>
            <span className="text-[10px] text-emerald-400/80 font-semibold">In your assigned classes</span>
          </div>
        </section>

        {/* Timetable Schedule */}
        <section className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" /> Today’s Teaching Schedule
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {timetables.length === 0 ? (
              <p className="text-xs text-slate-500 col-span-4 py-4">No scheduled slots for today.</p>
            ) : (
              timetables.slice(0, 4).map((slot, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-bold text-[10px]">
                      {slot.dayOfWeek}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{slot.room}</span>
                  </div>
                  <p className="font-extrabold text-white text-sm">{slot.subject?.name}</p>
                  <p className="text-[11px] text-slate-400">{slot.class?.name} ({slot.section?.name})</p>
                  <p className="text-[10px] text-amber-400 font-mono pt-1">
                    {slot.startTime} – {slot.endTime}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Quick Attendance Marking Section */}
        <section className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-400" /> Daily Class Attendance Marking
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Mark present/absent for your assigned class section</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={selectedClass?.id || ''}
                onChange={(e) => {
                  const c = classes.find((cls) => cls.id === e.target.value);
                  setSelectedClass(c);
                  if (c?.sections?.length > 0) setSelectedSection(c.sections[0]);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold font-mono"
              />

              <button
                onClick={handleSaveAttendance}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/20"
              >
                Save Attendance
              </button>
            </div>
          </div>

          {attMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {attMessage}
            </div>
          )}

          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {classStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No students found in this class section.
                    </td>
                  </tr>
                ) : (
                  classStudents.map((stu) => {
                    const currentStatus = attendanceRecords[stu.id] || 'PRESENT';
                    return (
                      <tr key={stu.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-400">{stu.rollNo}</td>
                        <td className="py-3 px-4 font-extrabold text-white">
                          {stu.firstName} {stu.lastName}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{stu.class?.name}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {['PRESENT', 'ABSENT', 'LATE'].map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() =>
                                  setAttendanceRecords((prev) => ({ ...prev, [stu.id]: st }))
                                }
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                  currentStatus === st
                                    ? st === 'PRESENT'
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : st === 'ABSENT'
                                      ? 'bg-rose-600 text-white shadow-sm'
                                      : 'bg-amber-600 text-white shadow-sm'
                                    : 'bg-slate-900 text-slate-400 hover:text-white'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Marks Entry Section */}
        <section className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" /> Exam Marks Entry & Grading
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Enter subject scores; results and letter grades calculate automatically</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <select
                value={selectedExam?.id || ''}
                onChange={(e) => {
                  const ex = exams.find((x) => x.id === e.target.value);
                  setSelectedExam(ex);
                  if (ex?.schedules?.length > 0) setSelectedSchedule(ex.schedules[0]);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {marksMessage && (
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {marksMessage}
            </div>
          )}

          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Total Marks</th>
                  <th className="py-3 px-4">Marks Obtained</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {classStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">{stu.rollNo}</td>
                    <td className="py-3 px-4 font-extrabold text-white">
                      {stu.firstName} {stu.lastName}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {selectedSchedule?.subject?.name || 'Mathematics'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {selectedSchedule?.totalMarks || 100}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        placeholder="Marks"
                        value={marksInputs[stu.id] || ''}
                        onChange={(e) =>
                          setMarksInputs((prev) => ({ ...prev, [stu.id]: e.target.value }))
                        }
                        className="w-24 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono font-bold text-xs"
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleSaveMark(stu.id)}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                      >
                        Submit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
