'use client';

import React, { useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Upload, Download, AlertCircle, CheckCircle2, FileText, Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedStudentRow {
  firstName: string;
  lastName: string;
  className?: string;
  sectionName?: string;
  gender?: string;
  dob?: string;
  phone?: string;
  email?: string;
  address?: string;
  rollNo?: string;
  admissionDate?: string;
  isValid: boolean;
  validationError?: string;
}

export function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importResult, setImportResult] = useState<{
    importedCount: number;
    totalSubmitted: number;
    errors: string[];
  } | null>(null);

  const resetState = () => {
    setFileName('');
    setParsedRows([]);
    setImportResult(null);
    setIsSubmitting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleModalClose = () => {
    resetState();
    onClose();
  };

  const downloadSampleCsv = () => {
    const headers = [
      'firstName',
      'lastName',
      'className',
      'sectionName',
      'gender',
      'dob',
      'phone',
      'email',
      'address',
      'rollNo',
      'admissionDate',
    ];
    const sampleRows = [
      ['Muhammad', 'Ali', 'Class 10', 'A', 'Male', '2008-03-12', '03001234567', 'ali@example.com', 'F-7/2 Islamabad', '101', '2024-08-15'],
      ['Fatima', 'Zahra', 'Class 10', 'A', 'Female', '2008-07-22', '03219876543', 'fatima@example.com', 'Gulberg III Lahore', '102', '2024-08-15'],
      ['Hamza', 'Khan', 'Grade 9', 'B', 'Male', '2009-11-05', '03335551234', 'hamza@example.com', 'University Town Peshawar', '905', '2024-08-15'],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...sampleRows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'eduvora_students_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsvLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const lines = content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length < 2) {
        toast('Invalid CSV', 'CSV must contain at least a header row and 1 student row.', 'error');
        return;
      }

      const rawHeaders = parseCsvLine(lines[0]).map((h) =>
        h.toLowerCase().replace(/[\s_-]/g, '')
      );

      const headerMap: Record<string, string> = {
        firstname: 'firstName',
        first: 'firstName',
        fname: 'firstName',
        name: 'firstName',
        lastname: 'lastName',
        last: 'lastName',
        lname: 'lastName',
        surname: 'lastName',
        classname: 'className',
        class: 'className',
        grade: 'className',
        sectionname: 'sectionName',
        section: 'sectionName',
        gender: 'gender',
        dob: 'dob',
        dateofbirth: 'dob',
        phone: 'phone',
        contact: 'phone',
        mobile: 'phone',
        email: 'email',
        address: 'address',
        rollno: 'rollNo',
        roll: 'rollNo',
        admissiondate: 'admissionDate',
      };

      const mappedKeys = rawHeaders.map((h) => headerMap[h] || h);

      const parsed: ParsedStudentRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        if (values.every((v) => !v)) continue; // skip blank rows

        const rowObj: any = {};
        mappedKeys.forEach((key, idx) => {
          rowObj[key] = values[idx] || '';
        });

        const isValid = !!(rowObj.firstName && rowObj.lastName);
        const validationError = !isValid
          ? 'First name and Last name are required.'
          : undefined;

        parsed.push({
          firstName: rowObj.firstName || '',
          lastName: rowObj.lastName || '',
          className: rowObj.className || undefined,
          sectionName: rowObj.sectionName || undefined,
          gender: rowObj.gender || 'Male',
          dob: rowObj.dob || '2010-01-01',
          phone: rowObj.phone || undefined,
          email: rowObj.email || undefined,
          address: rowObj.address || undefined,
          rollNo: rowObj.rollNo || undefined,
          admissionDate: rowObj.admissionDate || undefined,
          isValid,
          validationError,
        });
      }

      setParsedRows(parsed);
    };

    reader.readAsText(file);
  };

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  const handleSubmit = async () => {
    if (validRows.length === 0) {
      toast('Warning', 'No valid student records to import.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/students/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: validRows }),
      });

      const data = await res.json();
      if (data.success) {
        setImportResult(data);
        toast('Success', `Imported ${data.importedCount} students successfully!`, 'success');
        onSuccess();
      } else {
        toast('Import Failed', data.error || 'Failed to process bulk import.', 'error');
      }
    } catch {
      toast('Network Error', 'An error occurred during bulk import submission.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Bulk Import Students"
      subtitle="Upload student records in bulk via CSV format with automatic validation"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Step 1: Download Template & Instructions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">CSV Template & Guidelines</p>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                Download the standardized CSV template. Column headers must include at least <code className="text-indigo-600 dark:text-indigo-400 font-bold">firstName</code> and <code className="text-indigo-600 dark:text-indigo-400 font-bold">lastName</code>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={downloadSampleCsv}
            className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-300 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Download Sample CSV
          </button>
        </div>

        {/* Step 2: Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-slate-800/20"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,text/csv"
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {fileName ? fileName : 'Click to select CSV file'}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Accepts UTF-8 encoded .csv files up to 10MB
          </p>
        </div>

        {/* Import Results Banner */}
        {importResult && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Import Successful: {importResult.importedCount} of {importResult.totalSubmitted} students created!</span>
            </div>
            {importResult.errors.length > 0 && (
              <div className="mt-3 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800/40">
                <p className="font-bold mb-1">Warnings / Row Issues ({importResult.errors.length}):</p>
                <ul className="list-disc pl-4 space-y-1 max-h-28 overflow-y-auto font-mono text-[11px]">
                  {importResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Parsed Data Preview */}
        {parsedRows.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900 dark:text-white">
                  Parsed Records ({parsedRows.length})
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                  {validRows.length} Valid
                </span>
                {invalidRows.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 font-semibold text-[11px]">
                    {invalidRows.length} Invalid
                  </span>
                )}
              </div>
              <span className="text-gray-400">Showing first 20 records</span>
            </div>

            <div className="border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden overflow-x-auto max-h-64">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-slate-800/70 border-b border-gray-100 dark:border-slate-800 text-gray-500 font-medium">
                  <tr>
                    <th className="p-2.5 pl-3">Status</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Class / Sec</th>
                    <th className="p-2.5">Gender</th>
                    <th className="p-2.5">Phone</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">Roll No</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                  {parsedRows.slice(0, 20).map((row, idx) => (
                    <tr
                      key={idx}
                      className={
                        !row.isValid
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200'
                          : 'hover:bg-gray-50 dark:hover:bg-slate-800/40 text-gray-700 dark:text-slate-300'
                      }
                    >
                      <td className="p-2.5 pl-3">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-bold">
                            <AlertCircle className="w-3.5 h-3.5" /> Invalid
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-bold">
                        {row.firstName} {row.lastName}
                      </td>
                      <td className="p-2.5">
                        {row.className || '—'} {row.sectionName ? `(${row.sectionName})` : ''}
                      </td>
                      <td className="p-2.5">{row.gender || 'Male'}</td>
                      <td className="p-2.5">{row.phone || '—'}</td>
                      <td className="p-2.5">{row.email || '—'}</td>
                      <td className="p-2.5 font-mono">{row.rollNo || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleModalClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            {importResult ? 'Close' : 'Cancel'}
          </button>
          {parsedRows.length > 0 && !importResult && (
            <button
              type="button"
              disabled={validRows.length === 0 || isSubmitting}
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing {validRows.length} Students...
                </>
              ) : (
                <>
                  Confirm Import ({validRows.length} Students) <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
