'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'OWNER'
  | 'ADMIN'
  | 'TEACHER'
  | 'ACCOUNTANT'
  | 'RECEPTIONIST'
  | 'STAFF'
  | 'PARENT'
  | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  phone?: string | null;
  institutionId?: string | null;
  branchId?: string | null;
  institution?: { id?: string; name: string; type: string; currency?: string; code?: string } | null;
  branch?: { id: string; name: string; code: string; isMain: boolean } | null;
  studentProfile?: any;
  teacherProfile?: any;
  parentProfile?: any;
  staffProfile?: any;
}

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  user: User;
  setUser: (user: User) => void;
  selectedBranchId: string;
  setSelectedBranchId: (branchId: string) => void;
  branches: any[];
  hasPermission: (moduleName: string) => boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const DEFAULT_USER: User = {
  id: 'usr-admin-1',
  name: 'Dr. Arthur Pendelton',
  email: 'admin@eduvora.edu',
  role: 'ADMIN',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
  institution: { name: 'Eduvora Global Academy', type: 'School & College', currency: 'PKR' },
  branch: { id: 'branch-1', name: 'Main Campus', code: 'CAMPUS-01', isMain: true },
};

const RoleContext = createContext<RoleContextType>({
  role: 'ADMIN',
  setRole: () => {},
  user: DEFAULT_USER,
  setUser: () => {},
  selectedBranchId: 'all',
  setSelectedBranchId: () => {},
  branches: [],
  hasPermission: () => true,
  refreshUser: async () => {},
  logout: async () => {},
});

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRoleState] = useState<UserRole>('ADMIN');
  const [user, setUserState] = useState<User>(DEFAULT_USER);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [branches, setBranches] = useState<any[]>([]);

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUserState(data.user);
        setRoleState(data.user.role as UserRole);
        if (data.user.branchId) {
          setSelectedBranchId(data.user.branchId);
        }
      }
    } catch {
      // Offline or demo mode fallback
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    window.location.href = '/login';
  };

  // Fetch branches for branch switcher
  useEffect(() => {
    refreshUser();
    fetch('/api/branches')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.branches) {
          setBranches(data.branches);
        }
      })
      .catch(() => {});
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    const roleProfiles: Record<UserRole, { name: string; email: string }> = {
      SUPER_ADMIN: { name: 'Eduvora SuperAdmin', email: 'superadmin@eduvora.com' },
      OWNER: { name: 'Dr. Arthur Pendelton (Owner)', email: 'admin@eduvora.edu' },
      ADMIN: { name: 'Dr. Arthur Pendelton (Admin)', email: 'admin@eduvora.edu' },
      TEACHER: { name: 'Prof. Sarah Jenkins (Teacher)', email: 'teacher@eduvora.edu' },
      ACCOUNTANT: { name: 'Robert Sterling (Accountant)', email: 'accountant@eduvora.edu' },
      RECEPTIONIST: { name: 'Emily Watson (Receptionist)', email: 'reception@eduvora.edu' },
      STAFF: { name: 'James Wilson (Staff)', email: 'staff@eduvora.edu' },
      PARENT: { name: 'Michael Vance (Parent)', email: 'parent@eduvora.edu' },
      STUDENT: { name: 'Lucas Vance (Student)', email: 'student@eduvora.edu' },
    };

    const profile = roleProfiles[newRole] || roleProfiles.ADMIN;
    setUserState((prev) => ({
      ...prev,
      role: newRole,
      name: profile.name,
      email: profile.email,
    }));
  };

  const hasPermission = (moduleName: string): boolean => {
    if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'OWNER') return true;

    switch (role) {
      case 'TEACHER':
        return [
          'dashboard',
          'students',
          'attendance',
          'classes',
          'subjects',
          'timetable',
          'exams',
          'results',
          'announcements',
          'documents',
        ].includes(moduleName);
      case 'ACCOUNTANT':
        return [
          'dashboard',
          'students',
          'fees',
          'payments',
          'expenses',
          'salaries',
          'reports',
          'announcements',
        ].includes(moduleName);
      case 'RECEPTIONIST':
        return [
          'dashboard',
          'students',
          'admissions',
          'parents',
          'fees',
          'announcements',
          'documents',
        ].includes(moduleName);
      case 'PARENT':
        return [
          'dashboard',
          'children',
          'parents',
          'attendance',
          'fees',
          'results',
          'timetable',
          'notifications',
          'announcements',
        ].includes(moduleName);
      case 'STUDENT':
        return [
          'dashboard',
          'attendance',
          'fees',
          'results',
          'timetable',
          'announcements',
          'documents',
        ].includes(moduleName);
      case 'STAFF':
        return ['dashboard', 'salaries', 'announcements', 'documents'].includes(moduleName);
      default:
        return true;
    }
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        user,
        setUser: setUserState,
        selectedBranchId,
        setSelectedBranchId,
        branches,
        hasPermission,
        refreshUser,
        logout,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
