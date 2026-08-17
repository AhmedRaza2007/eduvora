'use client';

import React, { useEffect, useState } from 'react';
import { UserCog, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { useRole, UserRole } from '@/context/RoleContext';
import { Badge } from '@/components/ui/Badge';

export default function UsersPage() {
  const { role, setRole } = useRole();

  const permissionsMatrix = [
    { module: 'Dashboard Overview', superAdmin: true, admin: true, teacher: true, accountant: true, receptionist: true, parent: true },
    { module: 'Student CRUD Directory', superAdmin: true, admin: true, teacher: true, accountant: true, receptionist: true, parent: false },
    { module: 'Daily Class Attendance', superAdmin: true, admin: true, teacher: true, accountant: false, receptionist: false, parent: false },
    { module: 'Fees & Payment Receipts', superAdmin: true, admin: true, teacher: false, accountant: true, receptionist: true, parent: false },
    { module: 'Teacher & Staff Payroll', superAdmin: true, admin: true, teacher: false, accountant: true, receptionist: false, parent: false },
    { module: 'Expenses Management', superAdmin: true, admin: true, teacher: false, accountant: true, receptionist: false, parent: false },
    { module: 'Exams & Marks Entry', superAdmin: true, admin: true, teacher: true, accountant: false, receptionist: false, parent: false },
    { module: 'Reports & CSV Export', superAdmin: true, admin: true, teacher: false, accountant: true, receptionist: false, parent: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserCog className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Server-Side Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Configure role permissions and server authorization bounds for Super Admin, Admin, Teacher, Accountant, Receptionist, and Parent</p>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" /> Module Access Control Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 uppercase font-semibold">
                <th className="py-3 px-2">Module Name</th>
                <th className="py-3 px-2 text-center">Super Admin</th>
                <th className="py-3 px-2 text-center">Admin</th>
                <th className="py-3 px-2 text-center">Teacher</th>
                <th className="py-3 px-2 text-center">Accountant</th>
                <th className="py-3 px-2 text-center">Receptionist</th>
                <th className="py-3 px-2 text-center">Parent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
              {permissionsMatrix.map((pm, i) => (
                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-2 font-bold text-gray-900 dark:text-white">{pm.module}</td>
                  <td className="py-3 px-2 text-center">{pm.superAdmin && <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />}</td>
                  <td className="py-3 px-2 text-center">{pm.admin && <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />}</td>
                  <td className="py-3 px-2 text-center">{pm.teacher ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Lock className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                  <td className="py-3 px-2 text-center">{pm.accountant ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Lock className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                  <td className="py-3 px-2 text-center">{pm.receptionist ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Lock className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                  <td className="py-3 px-2 text-center">{pm.parent ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Lock className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
