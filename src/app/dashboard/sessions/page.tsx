'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Plus, CheckCircle2, Archive, ArrowRight, ShieldCheck } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function SessionsPage() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);

  // Session Form
  const [sessionForm, setSessionForm] = useState({
    name: '2027-2028',
    startDate: '2027-08-01',
    endDate: '2028-06-30',
  });

  // Promote Form
  const [promoteForm, setPromoteForm] = useState({
    sourceClassId: '',
    targetClassId: '',
    targetSessionId: '',
  });

  const fetchSessions = () => {
    setLoading(true);
    fetch('/api/sessions')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSessions(data.sessions);
          if (data.sessions.length > 0) {
            setPromoteForm((prev) => ({ ...prev, targetSessionId: data.sessions[0].id }));
          }
        }
      })
      .catch(() => toast('Error', 'Failed to fetch academic sessions', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.classes.length > 0) {
          setClasses(data.classes);
          setPromoteForm((prev) => ({
            ...prev,
            sourceClassId: data.classes[0].id,
            targetClassId: data.classes[1]?.id || data.classes[0].id,
          }));
        }
      });

    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStudents(data.students);
      });

    fetchSessions();
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_SESSION', ...sessionForm }),
      });
      const data = await res.json();
      if (data.success) {
        toast('Session Created', `Academic Session ${data.session.name} registered!`, 'success');
        setIsAddModalOpen(false);
        fetchSessions();
      } else {
        toast('Error', data.error || 'Failed to create session', 'error');
      }
    } catch {
      toast('Error', 'Server error creating session', 'error');
    }
  };

  const handleActivateSession = async (sessionId: string) => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ACTIVATE_SESSION', sessionId }),
      });
      const data = await res.json();
      if (data.success) {
        toast('Session Activated', `Active session switched to ${data.session.name}`, 'success');
        fetchSessions();
      } else {
        toast('Error', data.error || 'Failed to activate session', 'error');
      }
    } catch {
      toast('Error', 'Failed to activate session', 'error');
    }
  };

  const handlePromoteStudents = async (e: React.FormEvent) => {
    e.preventDefault();
    const sourceStudents = students.filter((st) => st.classId === promoteForm.sourceClassId);
    if (sourceStudents.length === 0) {
      toast('No Students', 'Selected source class has no enrolled students.', 'warning');
      return;
    }

    const targetCls = classes.find((c) => c.id === promoteForm.targetClassId);
    const targetSecId = targetCls?.sections?.[0]?.id || '';

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PROMOTE_STUDENTS',
          studentIds: sourceStudents.map((s) => s.id),
          targetClassId: promoteForm.targetClassId,
          targetSectionId: targetSecId,
          targetSessionId: promoteForm.targetSessionId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast('Promotion Complete!', `${data.count} students promoted to next grade with preserved historical logs.`, 'success');
        setIsPromoteModalOpen(false);
        fetchSessions();
      } else {
        toast('Error', data.error || 'Failed to promote students', 'error');
      }
    } catch {
      toast('Error', 'Server error promoting students', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Academic Sessions & Student Promotion Tool
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Manage academic years, active sessions, and historical data preservation</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPromoteModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/25 flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" /> Promote Students Tool
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <TableSkeleton rows={3} />
        ) : (
          sessions.map((s) => (
            <div key={s.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-xl text-gray-900 dark:text-white">{s.name}</h3>
                {s.isCurrent ? (
                  <Badge variant="emerald" className="px-3 py-1">Active Current Session</Badge>
                ) : (
                  <Badge variant="slate">{s.status}</Badge>
                )}
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>Start Date: <span className="font-mono text-gray-900 dark:text-white">{s.startDate}</span></p>
                <p>End Date: <span className="font-mono text-gray-900 dark:text-white">{s.endDate}</span></p>
                <p className="pt-2 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Historical records preserved
                </p>
              </div>

              {!s.isCurrent && (
                <button
                  onClick={() => handleActivateSession(s.id)}
                  className="w-full py-2 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  Make Active Session
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Session Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Academic Session" maxWidth="md">
        <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Session Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. 2027-2028"
              value={sessionForm.name}
              onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Start Date</label>
              <input
                type="date"
                value={sessionForm.startDate}
                onChange={(e) => setSessionForm({ ...sessionForm, startDate: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">End Date</label>
              <input
                type="date"
                value={sessionForm.endDate}
                onChange={(e) => setSessionForm({ ...sessionForm, endDate: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
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
              Create Session
            </button>
          </div>
        </form>
      </Modal>

      {/* Student Promotion Tool Modal */}
      <Modal isOpen={isPromoteModalOpen} onClose={() => setIsPromoteModalOpen(false)} title="Promote Students Tool" maxWidth="md">
        <form onSubmit={handlePromoteStudents} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-200 text-xs">
            <p className="font-bold">Historical Data Protection Active:</p>
            <p className="mt-0.5">Promoting students migrates active class enrollment while keeping all historical attendance, exam grades, and fee receipts permanently archived under previous sessions.</p>
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Source Class (Current Grade)</label>
            <select
              value={promoteForm.sourceClassId}
              onChange={(e) => setPromoteForm({ ...promoteForm, sourceClassId: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Target Class (Promote To)</label>
            <select
              value={promoteForm.targetClassId}
              onChange={(e) => setPromoteForm({ ...promoteForm, targetClassId: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Target Academic Session</label>
            <select
              value={promoteForm.targetSessionId}
              onChange={(e) => setPromoteForm({ ...promoteForm, targetSessionId: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              {sessions.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.isCurrent ? 'Current' : 'Archived'})</option>)}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsPromoteModalOpen(false)}
              className="px-4 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 font-bold text-white bg-purple-600 rounded-xl shadow-md">
              Promote Enrolled Batch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
