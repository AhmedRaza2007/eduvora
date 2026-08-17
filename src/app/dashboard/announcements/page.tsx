'use client';

import React, { useEffect, useState } from 'react';
import { Megaphone, Plus, Bell, AlertCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function AnnouncementsPage() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    content: '',
    targetAudience: 'ALL',
    priority: 'NORMAL',
  });

  const fetchAnnouncements = () => {
    setLoading(true);
    fetch('/api/announcements')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAnnouncements(data.announcements);
      })
      .catch(() => toast('Error', 'Failed to fetch announcements', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast('Announcement Published!', 'Targeted audience notified.', 'success');
        setIsAddModalOpen(false);
        fetchAnnouncements();
      } else {
        toast('Error', data.error || 'Failed to post announcement', 'error');
      }
    } catch {
      toast('Error', 'Server error posting announcement', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Institution Announcements & Broadcasts
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Broadcast important news to Students, Parents, Teachers, Staff, or Specific Classes</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Announcement
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
        {loading ? (
          <TableSkeleton rows={4} />
        ) : (
          <div className="space-y-4">
            {announcements.map((an) => (
              <div key={an.id} className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">{an.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={an.priority === 'URGENT' ? 'rose' : 'indigo'}>{an.priority}</Badge>
                    <Badge variant="purple">Audience: {an.targetAudience}</Badge>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">{an.content}</p>
                <p className="text-[10px] text-gray-400 font-mono">Posted: {new Date(an.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="New Broadcast Announcement" maxWidth="md">
        <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Annual Sports Gala Registration Open"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Target Audience</label>
              <select
                value={form.targetAudience}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                <option value="ALL">Everyone (All)</option>
                <option value="STUDENTS">Students Only</option>
                <option value="PARENTS">Parents Only</option>
                <option value="TEACHERS">Teachers Only</option>
                <option value="STAFF">Staff Only</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Priority Level</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent Broadcast</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Announcement Content *</label>
            <textarea
              rows={4}
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            />
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
              Publish Announcement
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
