'use client';

import React from 'react';
import { useRole, UserRole } from '@/context/RoleContext';
import { ShieldCheck, UserCheck } from 'lucide-react';

export function RoleSwitcher() {
  const { role, setRole } = useRole();

  const roles: { key: UserRole; label: string; desc: string }[] = [
    { key: 'ADMIN', label: 'Admin', desc: 'Full operational access' },
    { key: 'TEACHER', label: 'Teacher', desc: 'Assigned classes, marks & attendance' },
    { key: 'ACCOUNTANT', label: 'Accountant', desc: 'Fees, expenses, salaries & reports' },
    { key: 'RECEPTIONIST', label: 'Receptionist', desc: 'Admissions, students & front desk' },
    { key: 'PARENT', label: 'Parent Portal', desc: 'Children profiles, fees & results' },
    { key: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Multi-tenant SaaS administration' },
  ];

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="font-bold tracking-wide uppercase text-[10px] bg-white/10 px-2 py-0.5 rounded-full">
          Eduvora Live Demo Mode
        </span>
        <span className="hidden sm:inline text-indigo-200">Switch user role to test server-side permissions:</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
        {roles.map((r) => (
          <button
            key={r.key}
            onClick={() => setRole(r.key)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all whitespace-nowrap ${
              role === r.key
                ? 'bg-white text-indigo-950 shadow-md ring-2 ring-indigo-400 font-bold scale-105'
                : 'bg-white/10 hover:bg-white/20 text-indigo-100'
            }`}
            title={r.desc}
          >
            <UserCheck className="w-3 h-3" />
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
