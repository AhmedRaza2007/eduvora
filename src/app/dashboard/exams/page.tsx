'use client';

import React, { useEffect, useState } from 'react';
import { Award, Plus, Calendar, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function ExamsPage() {
  const { toast } = useToast();
  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateExamModalOpen, setIsCreateExamModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);

  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  // Exam Form
  const [examForm, setExamForm] = useState({
    name: 'Final Term Examinations 2026',
    type: 'FINAL',
    startDate: '2026-11-15',
    endDate: '2026-11-30',
  });

  // Schedule Form
  const [scheduleForm, setScheduleForm] = useState({
    classId: '',
    subjectId: '',
    examDate: '2026-11-18',
    startTime: '09:00',
    durationMinutes: '120',
    totalMarks: '100',
    passingMarks: '40',
    room: 'Auditorium Main',
  });

  // Marks Form
  const [marksForm, setMarksForm] = useState({
    studentId: '',
    marksObtained: '85',
    remarks: 'Good analytical skills',
  });

  const fetchExams = () => {
    setLoading(true);
    fetch('/api/exams')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setExams(data.exams);
      })
      .catch(() => toast('Error', 'Failed to fetch exams', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setClasses(data.classes);
          setSubjects(data.subjects);
          if (data.classes.length > 0) {
            setScheduleForm((prev) => ({
              ...prev,
              classId: data.classes[0].id,
              subjectId: data.subjects[0]?.id || '',
            }));
          }
        }
      });

    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStudents(data.students);
          if (data.students.length > 0) {
            setMarksForm((prev) => ({ ...prev, studentId: data.students[0].id }));
          }
        }
      });

    fetchExams();
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_EXAM', ...examForm }),
      });
      const data = await res.json();
      if (data.success) {
        toast('Exam Created', `${data.exam.name} registered!`, 'success');
        setIsCreateExamModalOpen(false);
        fetchExams();
      } else {
        toast('Error', data.error || 'Failed to create exam', 'error');
      }
    } catch {
      toast('Error', 'Server error creating exam', 'error');
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_SCHEDULE',
          examId: selectedExam.id,
          ...scheduleForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast('Paper Scheduled', 'Exam paper timetable slot added!', 'success');
        setIsScheduleModalOpen(false);
        fetchExams();
      } else {
        toast('Error', data.error || 'Failed to schedule paper', 'error');
      }
    } catch {
      toast('Error', 'Server error scheduling paper', 'error');
    }
  };

  const handleEntryMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ENTRY_MARKS',
          examScheduleId: selectedSchedule.id,
          ...marksForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast('Marks Saved!', `Grade ${data.mark.grade} calculated automatically.`, 'success');
        setIsMarksModalOpen(false);
        fetchExams();
      } else {
        toast('Error', data.error || 'Failed to save marks', 'error');
      }
    } catch {
      toast('Error', 'Server error saving marks', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Examinations & Marks Engine
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Configure exams (Monthly, Mid-Term, Final, Quiz), paper dates, and mark entries</p>
        </div>
        <button
          onClick={() => setIsCreateExamModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Examination
        </button>
      </div>

      <div className="space-y-6">
        {loading ? (
          <TableSkeleton rows={4} />
        ) : (
          exams.map((ex) => (
            <div key={ex.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">{ex.name}</h3>
                  <p className="text-xs text-gray-400">
                    Dates: <span className="font-mono text-gray-700 dark:text-slate-300">{ex.startDate}</span> to <span className="font-mono text-gray-700 dark:text-slate-300">{ex.endDate}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="indigo">{ex.type}</Badge>
                  <button
                    onClick={() => {
                      setSelectedExam(ex);
                      setIsScheduleModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 transition-colors"
                  >
                    + Add Paper Slot
                  </button>
                </div>
              </div>

              {/* Schedules */}
              <div className="space-y-2 text-xs">
                <p className="font-bold text-gray-400 uppercase">Exam Schedules & Marks Entry</p>
                {ex.schedules?.length === 0 ? (
                  <p className="text-gray-400 italic">No paper schedules added yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ex.schedules?.map((sched: any) => (
                      <div key={sched.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{sched.subject?.name}</span>
                          <Badge variant="slate">{sched.class?.name}</Badge>
                        </div>
                        <p className="text-gray-500">Date: <span className="font-mono text-gray-900 dark:text-white">{sched.examDate} ({sched.startTime})</span></p>
                        <p className="text-gray-500">Marks: <span className="font-mono font-bold text-gray-900 dark:text-white">{sched.totalMarks} Total</span> (Passing: {sched.passingMarks})</p>
                        <button
                          onClick={() => {
                            setSelectedSchedule(sched);
                            setIsMarksModalOpen(true);
                          }}
                          className="w-full mt-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
                        >
                          Enter Marks ({sched.marks?.length || 0} Graded)
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Exam Modal */}
      <Modal isOpen={isCreateExamModalOpen} onClose={() => setIsCreateExamModalOpen(false)} title="Create Examination" maxWidth="md">
        <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Exam Title *</label>
            <input
              type="text"
              required
              value={examForm.name}
              onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Exam Type</label>
            <select
              value={examForm.type}
              onChange={(e) => setExamForm({ ...examForm, type: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value="MONTHLY">Monthly Test</option>
              <option value="MID_TERM">Mid Term</option>
              <option value="FINAL">Final Term</option>
              <option value="QUIZ">Quiz</option>
              <option value="ASSIGNMENT">Assignment</option>
              <option value="ENTRY_TEST">Entry Test</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Start Date</label>
              <input
                type="date"
                value={examForm.startDate}
                onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">End Date</label>
              <input
                type="date"
                value={examForm.endDate}
                onChange={(e) => setExamForm({ ...examForm, endDate: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateExamModalOpen(false)}
              className="px-4 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 font-bold text-white bg-indigo-600 rounded-xl shadow-md">
              Create Exam
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Paper Schedule Modal */}
      <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title="Schedule Paper Slot" maxWidth="md">
        <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Class *</label>
              <select
                value={scheduleForm.classId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, classId: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Subject *</label>
              <select
                value={scheduleForm.subjectId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, subjectId: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Exam Date</label>
              <input
                type="date"
                value={scheduleForm.examDate}
                onChange={(e) => setScheduleForm({ ...scheduleForm, examDate: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Total Marks</label>
              <input
                type="number"
                value={scheduleForm.totalMarks}
                onChange={(e) => setScheduleForm({ ...scheduleForm, totalMarks: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 font-bold text-white bg-indigo-600 rounded-xl shadow-md">
              Save Paper Slot
            </button>
          </div>
        </form>
      </Modal>

      {/* Marks Entry Modal */}
      <Modal isOpen={isMarksModalOpen} onClose={() => setIsMarksModalOpen(false)} title="Subject Marks Entry" maxWidth="md">
        <form onSubmit={handleEntryMarks} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Select Student *</label>
            <select
              value={marksForm.studentId}
              onChange={(e) => setMarksForm({ ...marksForm, studentId: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>{st.firstName} {st.lastName} ({st.studentId})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Marks Obtained (Out of {selectedSchedule?.totalMarks || 100}) *</label>
            <input
              type="number"
              required
              step="0.5"
              value={marksForm.marksObtained}
              onChange={(e) => setMarksForm({ ...marksForm, marksObtained: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Teacher Remarks</label>
            <input
              type="text"
              value={marksForm.remarks}
              onChange={(e) => setMarksForm({ ...marksForm, remarks: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsMarksModalOpen(false)}
              className="px-4 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 font-bold text-white bg-emerald-600 rounded-xl shadow-md">
              Calculate Grade & Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
