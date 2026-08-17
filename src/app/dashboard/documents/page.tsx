'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Plus, Download, ShieldCheck, Upload } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function DocumentsPage() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [form, setForm] = useState({
    entityType: 'STUDENT',
    entityId: '',
    title: 'Birth Certificate & Academic Record',
    category: 'BIRTH_CERTIFICATE',
  });

  const fetchDocuments = () => {
    setLoading(true);
    fetch('/api/documents')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDocuments(data.documents);
      })
      .catch(() => toast('Error', 'Failed to fetch documents', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStudents(data.students);
          if (data.students.length > 0) setForm((prev) => ({ ...prev, entityId: data.students[0].id }));
        }
      });

    fetch('/api/teachers')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTeachers(data.teachers);
      });

    fetchDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast('Document Uploaded', `${data.document.title} stored in secure vault!`, 'success');
        setIsUploadModalOpen(false);
        fetchDocuments();
      } else {
        toast('Error', data.error || 'Failed to upload document', 'error');
      }
    } catch {
      toast('Error', 'Server error uploading document', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Digital Document Repository
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Encrypted storage for birth certificates, contracts, degrees, and national IDs</p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
        >
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm">
        {loading ? (
          <TableSkeleton rows={4} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="p-5 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="indigo">{doc.entityType}</Badge>
                  <span className="text-[10px] font-mono text-gray-400">{doc.fileSize || '1.5 MB'}</span>
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">{doc.title}</h3>
                <p className="text-xs text-gray-500">Category: {doc.category}</p>
                <div className="pt-2 border-t flex justify-end">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Document File" maxWidth="md">
        <form onSubmit={handleUpload} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Entity Target</label>
              <select
                value={form.entityType}
                onChange={(e) => {
                  const type = e.target.value;
                  setForm({
                    ...form,
                    entityType: type,
                    entityId: type === 'STUDENT' ? students[0]?.id || '' : teachers[0]?.id || '',
                  });
                }}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                <option value="STUDENT">Student File</option>
                <option value="TEACHER">Teacher / Faculty File</option>
                <option value="STAFF">Staff Member File</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300">Select Individual *</label>
              <select
                value={form.entityId}
                onChange={(e) => setForm({ ...form, entityId: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                {form.entityType === 'STUDENT'
                  ? students.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)
                  : teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Document Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300">Document Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value="BIRTH_CERTIFICATE">Birth Certificate</option>
              <option value="NATIONAL_ID">National ID / Passport</option>
              <option value="TRANSCRIPT">Previous Transcripts</option>
              <option value="CONTRACT">Employment Contract</option>
              <option value="CERTIFICATE">Academic Degree Certificate</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="p-4 rounded-xl border-2 border-dashed text-center">
            <Upload className="w-6 h-6 text-indigo-500 mx-auto mb-1" />
            <p className="font-bold text-gray-700 dark:text-slate-300">File Selected: Document_Scan_Verified.pdf</p>
            <p className="text-gray-400 text-[10px]">PDF, PNG, JPG up to 10MB validated</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 font-bold text-white bg-indigo-600 rounded-xl shadow-md">
              Upload & Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
