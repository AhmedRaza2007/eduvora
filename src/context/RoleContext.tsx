'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'ACCOUNTANT' | 'RECEPTIONIST' | 'PARENT';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  institution?: { name: string; type: string };
  studentProfile?: any;
  teacherProfile?: any;
  parentProfile?: any;
}

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  user: User;
  setUser: (user: User) => void;
  hasPermission: (permission: string) => boolean;
}

const DEFAULT_USER: User = {
  id: 'usr-admin-1',
  name: 'Dr. Arthur Pendelton',
  email: 'admin@eduvora.edu',
  role: 'ADMIN',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
  institution: { name: 'Eduvora Global Academy', type: 'School & Academy' },
};

const RoleContext = createContext<RoleContextType>({
  role: 'ADMIN',
  setRole: () => {},
  user: DEFAULT_USER,
  setUser: () => {},
  hasPermission: () => true,
});

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRoleState] = useState<UserRole>('ADMIN');
  const [user, setUserState] = useState<User>(DEFAULT_USER);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    // Update display user based on role
    const roleNames: Record<UserRole, string> = {
      SUPER_ADMIN: 'System SuperAdmin',
      ADMIN: 'Dr. Arthur Pendelton (Admin)',
      TEACHER: 'Prof. Sarah Jenkins (Teacher)',
      ACCOUNTANT: 'Robert Sterling (Accountant)',
      RECEPTIONIST: 'Emily Watson (Receptionist)',
      PARENT: 'Michael Vance (Parent)',
    };
    setUserState((prev) => ({
      ...prev,
      role: newRole,
      name: roleNames[newRole],
    }));
  };

  const hasPermission = (moduleName: string): boolean => {
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return true;

    switch (role) {
      case 'TEACHER':
        return ['dashboard', 'students', 'attendance', 'classes', 'subjects', 'timetable', 'exams', 'results', 'announcements', 'documents'].includes(moduleName);
      case 'ACCOUNTANT':
        return ['dashboard', 'students', 'fees', 'payments', 'expenses', 'salaries', 'reports', 'announcements'].includes(moduleName);
      case 'RECEPTIONIST':
        return ['dashboard', 'students', 'admissions', 'parents', 'fees', 'announcements', 'documents'].includes(moduleName);
      case 'PARENT':
        return ['dashboard', 'children', 'attendance', 'fees', 'results', 'timetable', 'notifications', 'announcements'].includes(moduleName);
      default:
        return true;
    }
  };

  return (
    <RoleContext.Provider value={{ role, setRole, user, setUser: setUserState, hasPermission }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
