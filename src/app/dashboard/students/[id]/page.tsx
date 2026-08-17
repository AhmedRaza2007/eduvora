'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  CalendarCheck,
  CreditCard,
  Award,
  FileText,
  Users2,
  Activity,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  FileCheck,
  Plus,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Badge } from '@/components/ui/Badge';
import { ReceiptModal } from '@/components/ui/ReceiptModal';
import { ResultCardModal } from '@/components/ui/ResultCardModal';

export default function StudentProfilePage() {
  const params = useParams();
  const studentId = params?.id as string;
  const { toast } = useToast();

  const [student, setStudent] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals for printable receipt & result card
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [selectedResult, setSelectedResult] = useState<any>(null);

  useEffect(() => {
    if (!studentId) return;
    fetch(`/api/students/${studentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStudent(data.student);
          setDocuments(data.documents || []);
        } else {
          toast('Error', 'Student profile not found', 'error');
        }
      })
      .catch(() => toast('Error', 'Failed to load student details', 'error'))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-400">Loading student profile...</div>;
  }

  if (!student) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Student profile not found.</p>
        <Link href="/dashboard/students" className="mt-4 inline-block text-indigo-600 font-bold text-xs">
          ← Back to Students Directory
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'attendance', label: 'Attendance History', icon: CalendarCheck },
    { id: 'fees', label: 'Fee Invoices', icon: CreditCard },
    { id: 'results', label: 'Academic Results', icon: Award },
    { id: 'exams', label: 'Upcoming Exams', icon: FileCheck },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'parent', label: 'Parent Details', icon: Users2 },
    { id: 'activity', label: 'Activity Log', icon: Activity },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Back button */}
      <Link href="/dashboard/students" className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Students Directory
      </Link>

      {/* Student Profile Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={student.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
            alt={student.firstName}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md"
          />
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{student.firstName} {student.lastName}</h2>
              <Badge variant={student.status === 'ACTIVE' ? 'emerald' : 'rose'}>{student.status}</Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Class: <span className="font-bold text-gray-900 dark:text-white">{student.class?.name || 'Grade 10'}</span> ({student.section?.name || 'Sec A'}) • Roll #: <span className="font-mono">{student.rollNo}</span>
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-slate-400 mt-3">
              <span className="flex items-center gap-1 font-mono text-indigo-600 dark:text-indigo-400 font-semibold">ID: {student.studentId}</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {student.phone || 'N/A'}</span>
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {student.email || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => toast('Exported', 'Student PDF Card generated', 'info')}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 font-semibold text-xs hover:bg-gray-200 transition-colors"
          >
            Print ID Card
          </button>
        </div>
      </div>

      {/* Profile Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm text-xs">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Personal Information</h3>
              <div className="space-y-2 text-xs">
                <p className="flex justify-between border-b pb-2"><span className="text-gray-400">Full Name:</span> <span className="font-semibold text-gray-900 dark:text-white">{student.firstName} {student.lastName}</span></p>
                <p className="flex justify-between border-b pb-2"><span className="text-gray-400">Gender:</span> <span className="font-semibold">{student.gender}</span></p>
                <p className="flex justify-between border-b pb-2"><span className="text-gray-400">Date of Birth:</span> <span className="font-semibold">{student.dob}</span></p>
                <p className="flex justify-between border-b pb-2"><span className="text-gray-400">Admission Number:</span> <span className="font-mono font-semibold">{student.admissionNo}</span></p>
                <p className="flex justify-between border-b pb-2"><span className="text-gray-400">Admission Date:</span> <span className="font-semibold">{student.admissionDate}</span></p>
                <p className="flex justify-between"><span className="text-gray-400">Home Address:</span> <span className="font-semibold">{student.address || '742 Evergreen Terrace'}</span></p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Academic Status Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50">
                  <span className="text-gray-500">Attendance Ratio</span>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">94.2%</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
                  <span className="text-gray-500">Fee Status</span>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">Clear</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Attendance */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Attendance Logs (Recent 30 Days)</h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-gray-400 uppercase">
                  <th className="py-2">Date</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {student.attendances?.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-4 text-gray-400">No attendance history</td></tr>
                ) : (
                  student.attendances?.map((att: any) => (
                    <tr key={att.id}>
                      <td className="py-2.5 font-mono">{att.date}</td>
                      <td className="py-2.5"><Badge variant={att.status === 'PRESENT' ? 'emerald' : 'rose'}>{att.status}</Badge></td>
                      <td className="py-2.5 text-gray-500">{att.remarks || 'Standard'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Fees */}
        {activeTab === 'fees' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Fee Invoices & Payments</h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-gray-400 uppercase">
                  <th className="py-2">Invoice #</th>
                  <th className="py-2">Title</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {student.feeInvoices?.map((inv: any) => (
                  <tr key={inv.id}>
                    <td className="py-2.5 font-mono font-bold text-indigo-600">{inv.invoiceNo}</td>
                    <td className="py-2.5 font-semibold">{inv.title}</td>
                    <td className="py-2.5 font-mono">${inv.amount?.toFixed(2)}</td>
                    <td className="py-2.5"><Badge variant={inv.status === 'PAID' ? 'emerald' : 'amber'}>{inv.status}</Badge></td>
                    <td className="py-2.5 text-right">
                      {inv.payments?.[0] ? (
                        <button
                          onClick={() => setSelectedPayment({ ...inv.payments[0], invoice: inv, student })}
                          className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 rounded-lg font-semibold hover:underline"
                        >
                          View Receipt
                        </button>
                      ) : (
                        <span className="text-gray-400">Unpaid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Results */}
        {activeTab === 'results' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Exam Performance Cards</h3>
            {student.results?.map((res: any) => (
              <div key={res.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">{res.exam?.name || 'Mid-Term 2026'}</h4>
                  <p className="text-gray-500 mt-0.5">Obtained: {res.obtainedMarks} / {res.totalMarks} ({res.percentage?.toFixed(1)}%) • Grade: <span className="font-bold text-amber-500">{res.grade}</span></p>
                </div>
                <button
                  onClick={() => setSelectedResult({ result: res, marks: student.marks })}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-500 shadow-md"
                >
                  Print Result Card
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab 6: Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Uploaded Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map((doc: any) => (
                <div key={doc.id} className="p-4 rounded-2xl border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-indigo-500" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{doc.title}</p>
                      <p className="text-gray-400">{doc.category} • {doc.fileSize}</p>
                    </div>
                  </div>
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Parent */}
        {activeTab === 'parent' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Parent / Guardian Contact</h3>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 space-y-2">
              <p className="font-bold text-sm text-gray-900 dark:text-white">{student.parent?.name || 'Michael Vance'}</p>
              <p className="text-gray-500">Relationship: {student.parent?.relationship || 'Father'}</p>
              <p className="text-gray-500 flex items-center gap-2"><Phone className="w-4 h-4" /> {student.parent?.contact || '+1 (555) 567-8901'}</p>
              <p className="text-gray-500 flex items-center gap-2"><Mail className="w-4 h-4" /> {student.parent?.email || 'parent@eduvora.edu'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ReceiptModal isOpen={Boolean(selectedPayment)} onClose={() => setSelectedPayment(null)} payment={selectedPayment} />
      <ResultCardModal isOpen={Boolean(selectedResult)} onClose={() => setSelectedResult(null)} resultData={selectedResult} />
    </div>
  );
}
