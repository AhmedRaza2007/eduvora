'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole, UserRole } from '@/context/RoleContext';
import {
  ShieldCheck,
  ChevronDown,
  UserCheck,
  GraduationCap,
  Calculator,
  PhoneCall,
  Users2,
  BookOpen,
  ShieldAlert,
  Check,
  Loader2,
} from 'lucide-react';

export function RoleSwitcher() {
  const router = useRouter();
  const { role, setRole, user } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const roles: {
    key: UserRole;
    label: string;
    desc: string;
    icon: React.ElementType;
    portalUrl: string;
    badgeColor: string;
  }[] = [
    {
      key: 'ADMIN',
      label: 'Admin',
      desc: 'Campus & academic management',
      icon: UserCheck,
      portalUrl: '/dashboard',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    {
      key: 'TEACHER',
      label: 'Teacher',
      desc: 'Class attendance, timetable & marks',
      icon: GraduationCap,
      portalUrl: '/teacher',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      key: 'ACCOUNTANT',
      label: 'Accountant',
      desc: 'Fees, expenses & financial reports',
      icon: Calculator,
      portalUrl: '/dashboard/fees',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      key: 'RECEPTIONIST',
      label: 'Receptionist',
      desc: 'Admissions, inquiries & front desk',
      icon: PhoneCall,
      portalUrl: '/reception',
      badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    },
    {
      key: 'PARENT',
      label: 'Parent',
      desc: 'Children progress, fees & results',
      icon: Users2,
      portalUrl: '/parent',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
    {
      key: 'STUDENT',
      label: 'Student',
      desc: 'Schedule, attendance & performance',
      icon: BookOpen,
      portalUrl: '/student',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      key: 'SUPER_ADMIN',
      label: 'Super Admin',
      desc: 'Platform control & multi-tenant console',
      icon: ShieldAlert,
      portalUrl: '/super-admin',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRole = async (targetRole: (typeof roles)[0]) => {
    setIsSwitching(true);
    setIsOpen(false);
    try {
      await setRole(targetRole.key);
      router.push(targetRole.portalUrl);
    } catch (err) {
      console.error('Role switch failed:', err);
    } finally {
      setIsSwitching(false);
    }
  };

  const currentRoleConfig = roles.find((r) => r.key === role) || roles[0];
  const CurrentIcon = currentRoleConfig.icon;

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-200 px-4 sm:px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-md">
      {/* Left Side: System Context */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Demo Evaluation Mode</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-xs">
          <span>Active Session:</span>
          <span className="font-bold text-white flex items-center gap-1">
            <CurrentIcon className="w-3.5 h-3.5 text-indigo-400" />
            {currentRoleConfig.label} ({user.name})
          </span>
        </div>
      </div>

      {/* Right Side: Professional Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isSwitching}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 hover:border-slate-600 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {isSwitching ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          ) : (
            <CurrentIcon className="w-3.5 h-3.5 text-indigo-400" />
          )}
          <span>Switch Role</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 p-2 z-50 animate-fade-in space-y-1">
            <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">
                Switch Evaluation Role
              </p>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                Authenticates session server-side for selected role:
              </p>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-1 py-1 no-scrollbar">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => handleSelectRole(r)}
                    className={`w-full flex items-start justify-between gap-3 p-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800/60'
                        : 'hover:bg-gray-50 dark:hover:bg-slate-800/70 text-gray-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`p-1.5 rounded-lg border shrink-0 mt-0.5 ${r.badgeColor}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">{r.label}</p>
                        <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5 leading-snug">
                          {r.desc}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-slate-800 px-3 py-1">
              <p className="text-[10px] text-gray-400 dark:text-slate-500 text-center">
                RBAC enforced server-side via HMAC SHA-256 session token
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
