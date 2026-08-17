'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Plus, Filter, AlertTriangle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function TimetablePage() {
  const { toast } = useToast();
  const [timetables, setTimetables] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

  const [form, setForm] = useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    teacherId: '',
    room: 'Lab 201',
    dayOfWeek: 'MONDAY',
    startTime: '08:30',
    endTime: '09:30',
  });

  const fetchTimetable = () => {
    setLoading(true);
    const q = selectedClass ? `?classId=${selectedClass}` : '';
    fetch(`/api/timetable${q}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTimetables(data.timetables);
      })
      .catch(() => toast('Error', 'Failed to fetch timetable', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setClasses(data.classes);
          setTeachers(data.teachers);
          setSubjects(data.subjects);
          if (data.classes.length > 0) {
            setSelectedClass(data.classes[0].id);
            setForm((prev) => ({
              ...prev,
              classId: data.classes[0].id,
              sectionId: data.classes[0].sections?.[0]?.id || '',
              teacherId: data.teachers[0]?.id || '',
              subjectId: data.subjects[0]?.id || '',
            }));
          }
        }
      });
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [selectedClass]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast('Slot Scheduled', 'Timetable entry added without schedule conflicts!', 'success');
        setIsAddModalOpen(false);
        fetchTimetable();
      } else {
        toast('Schedule Conflict Warning', data.error || 'Failed to add slot', 'warning');
      }
    } catch {
      toast('Error', 'Server error creating timetable slot', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Class & Faculty Timetable Engine
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Weekly schedule grid with anti-collision teacher availability verification</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Schedule Class Period
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-3 text-xs">
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="font-bold text-gray-700 dark:text-slate-300">Select Class Schedule:</span>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold text-gray-900 dark:text-white"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Weekly Schedule Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : (
          <div className="space-y-6">
            {days.map((day) => {
              const daySlots = timetables.filter((t) => t.dayOfWeek === day);
              return (
                <div key={day} className="space-y-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border-b pb-1">
                    {day}
                  </h4>
                  {daySlots.length === 0 ? (
                    <p className="text-[11px] text-gray-400 italic py-1">No scheduled periods for {day}</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {daySlots.map((slot) => (
                        <div key={slot.id} className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <Badge variant="indigo">{slot.room}</Badge>
                          </div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{slot.subject?.name}</p>
                          <p className="text-gray-500">Teacher: <span className="font-semibold text-gray-700 dark:text-slate-300">{slot.teacher?.name}</span></p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Schedule Period" maxWidth="md">
        <form onSubmit={handleAddSlot} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Day of Week</label>
              <select
                value={form.dayOfWeek}
                onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                {days.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Room / Hall</label>
              <input
                type="text"
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Subject *</label>
              <select
                value={form.subjectId}
                onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Assigned Teacher *</label>
              <select
                value={form.teacherId}
                onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Start Time</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">End Time</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-mono"
              />
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
              Save Period Slot
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
