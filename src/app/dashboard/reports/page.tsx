'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, Download, Printer, Filter } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function ReportsPage() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState('FINANCIAL');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = () => {
    setLoading(true);
    fetch(`/api/reports?type=${reportType}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setReportData(data);
      })
      .catch(() => toast('Error', 'Failed to generate report', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const handleExportCSV = () => {
    if (!reportData) return;
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'FINANCIAL') {
      csvContent += 'Category,Revenue,Expenses,Salaries,NetProfit\n';
      const s = reportData.summary || {};
      csvContent += `Summary,${s.totalRevenue},${s.totalExpenses},${s.totalSalaries},${s.netProfit}\n`;
    } else if (reportType === 'ATTENDANCE') {
      csvContent += 'Total,Present,Absent,Leave,Late\n';
      const s = reportData.summary || {};
      csvContent += `${s.total},${s.present},${s.absent},${s.leave},${s.late}\n`;
    } else if (reportType === 'STUDENTS') {
      csvContent += 'StudentId,FirstName,LastName,Class,Status\n';
      reportData.students?.forEach((st: any) => {
        csvContent += `${st.studentId},${st.firstName},${st.lastName},${st.class?.name || ''},${st.status}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Eduvora_${reportType}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast('Exported', `Eduvora_${reportType}_Report.csv downloaded!`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Analytical Reports & Data Exporter
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Export institutional metrics into CSV, PDF, and printable audits</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download CSV
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-3 text-xs">
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="font-bold text-gray-700 dark:text-slate-300">Report Category:</span>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold text-gray-900 dark:text-white"
        >
          <option value="FINANCIAL">Financial Performance Report</option>
          <option value="ATTENDANCE">Attendance Summary Report</option>
          <option value="STUDENTS">Students Enrollment Directory</option>
          <option value="RESULTS">Academic Examination Performance</option>
        </select>
      </div>

      {/* Report Display Container */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : (
          <div className="printable-content space-y-6">
            {reportType === 'FINANCIAL' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Institutional Financial Audit</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200">
                    <span className="text-xs text-gray-500">Total Fee Revenue</span>
                    <p className="text-2xl font-black text-emerald-600">${reportData?.summary?.totalRevenue?.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200">
                    <span className="text-xs text-gray-500">Total Expenses</span>
                    <p className="text-2xl font-black text-rose-600">${reportData?.summary?.totalExpenses?.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200">
                    <span className="text-xs text-gray-500">Staff Salaries</span>
                    <p className="text-2xl font-black text-purple-600">${reportData?.summary?.totalSalaries?.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200">
                    <span className="text-xs text-gray-500">Net Profit</span>
                    <p className="text-2xl font-black text-indigo-600">${reportData?.summary?.netProfit?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {reportType === 'ATTENDANCE' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Attendance Analytics Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800">
                    <span className="text-gray-400">Total Records</span>
                    <p className="text-2xl font-black">{reportData?.summary?.total}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40">
                    <span className="text-gray-500">Present</span>
                    <p className="text-2xl font-black text-emerald-600">{reportData?.summary?.present}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40">
                    <span className="text-gray-500">Absent</span>
                    <p className="text-2xl font-black text-rose-600">{reportData?.summary?.absent}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40">
                    <span className="text-gray-500">Late / Leave</span>
                    <p className="text-2xl font-black text-amber-600">{reportData?.summary?.late + reportData?.summary?.leave}</p>
                  </div>
                </div>
              </div>
            )}

            {reportType === 'STUDENTS' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Enrolled Student Directory ({reportData?.total} Records)</h3>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b text-gray-400 uppercase font-semibold">
                      <th className="py-2">Student ID</th>
                      <th className="py-2">Full Name</th>
                      <th className="py-2">Class</th>
                      <th className="py-2">Parent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reportData?.students?.map((st: any) => (
                      <tr key={st.id}>
                        <td className="py-2.5 font-mono font-bold text-indigo-600">{st.studentId}</td>
                        <td className="py-2.5 font-semibold">{st.firstName} {st.lastName}</td>
                        <td className="py-2.5">{st.class?.name}</td>
                        <td className="py-2.5 text-gray-500">{st.parent?.name || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
