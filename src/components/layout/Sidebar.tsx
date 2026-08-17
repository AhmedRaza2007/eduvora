'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  Briefcase,
  School,
  BookOpen,
  Clock,
  UserPlus,
  Award,
  FileCheck,
  Users2,
  Receipt,
  DollarSign,
  Bell,
  FileText,
  BarChart3,
  UserCog,
  Settings,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission } = useRole();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
    { name: 'Students', href: '/dashboard/students', icon: Users, key: 'students' },
    { name: 'Attendance', href: '/dashboard/attendance', icon: CalendarCheck, key: 'attendance' },
    { name: 'Fees & Payments', href: '/dashboard/fees', icon: CreditCard, key: 'fees' },
    { name: 'Teachers', href: '/dashboard/teachers', icon: GraduationCap, key: 'teachers' },
    { name: 'Staff', href: '/dashboard/staff', icon: Briefcase, key: 'staff' },
    { name: 'Classes & Sections', href: '/dashboard/classes', icon: School, key: 'classes' },
    { name: 'Subjects', href: '/dashboard/subjects', icon: BookOpen, key: 'subjects' },
    { name: 'Timetable', href: '/dashboard/timetable', icon: Clock, key: 'timetable' },
    { name: 'Admissions', href: '/dashboard/admissions', icon: UserPlus, key: 'admissions' },
    { name: 'Exams', href: '/dashboard/exams', icon: Award, key: 'exams' },
    { name: 'Results', href: '/dashboard/results', icon: FileCheck, key: 'results' },
    { name: 'Parents', href: '/dashboard/parents', icon: Users2, key: 'parents' },
    { name: 'Expenses', href: '/dashboard/expenses', icon: Receipt, key: 'expenses' },
    { name: 'Salaries', href: '/dashboard/salaries', icon: DollarSign, key: 'salaries' },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, key: 'notifications' },
    { name: 'Documents', href: '/dashboard/documents', icon: FileText, key: 'documents' },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, key: 'reports' },
    { name: 'Users & Roles', href: '/dashboard/users', icon: UserCog, key: 'users' },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, key: 'settings' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 transition-colors">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            EV
          </div>
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
              Eduvora
            </h1>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">SaaS EMS Platform</p>
          </div>
        </Link>
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 no-scrollbar">
        {navItems.map((item) => {
          if (!hasPermission(item.key)) return null;

          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/25 scale-[1.02]'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-500'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer link to public landing page */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-800">
        <Link
          href="/"
          className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 dark:bg-slate-800/50 hover:bg-indigo-100 dark:hover:bg-slate-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-colors"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Public Landing Page
          </span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative w-72 h-full z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
