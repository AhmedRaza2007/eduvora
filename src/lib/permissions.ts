export type Permission =
  | 'platform.manage'
  | 'institutions.manage'
  | 'institutions.view'
  | 'branches.manage'
  | 'branches.view'
  | 'students.view'
  | 'students.create'
  | 'students.edit'
  | 'students.delete'
  | 'attendance.view'
  | 'attendance.mark'
  | 'attendance.edit'
  | 'fees.view'
  | 'fees.create'
  | 'fees.collect'
  | 'expenses.view'
  | 'expenses.create'
  | 'salaries.view'
  | 'salaries.create'
  | 'salaries.pay'
  | 'exams.view'
  | 'exams.create'
  | 'exams.marks'
  | 'classes.view'
  | 'classes.manage'
  | 'subjects.view'
  | 'subjects.manage'
  | 'timetable.view'
  | 'timetable.manage'
  | 'admissions.view'
  | 'admissions.manage'
  | 'users.view'
  | 'users.manage'
  | 'reports.view'
  | 'reports.export'
  | 'documents.view'
  | 'documents.manage'
  | 'announcements.view'
  | 'announcements.create';

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: [
    'platform.manage',
    'institutions.manage',
    'institutions.view',
    'branches.manage',
    'branches.view',
    'students.view',
    'students.create',
    'students.edit',
    'students.delete',
    'attendance.view',
    'attendance.mark',
    'attendance.edit',
    'fees.view',
    'fees.create',
    'fees.collect',
    'expenses.view',
    'expenses.create',
    'salaries.view',
    'salaries.create',
    'salaries.pay',
    'exams.view',
    'exams.create',
    'exams.marks',
    'classes.view',
    'classes.manage',
    'subjects.view',
    'subjects.manage',
    'timetable.view',
    'timetable.manage',
    'admissions.view',
    'admissions.manage',
    'users.view',
    'users.manage',
    'reports.view',
    'reports.export',
    'documents.view',
    'documents.manage',
    'announcements.view',
    'announcements.create',
  ],
  OWNER: [
    'institutions.view',
    'branches.manage',
    'branches.view',
    'students.view',
    'students.create',
    'students.edit',
    'students.delete',
    'attendance.view',
    'attendance.mark',
    'attendance.edit',
    'fees.view',
    'fees.create',
    'fees.collect',
    'expenses.view',
    'expenses.create',
    'salaries.view',
    'salaries.create',
    'salaries.pay',
    'exams.view',
    'exams.create',
    'exams.marks',
    'classes.view',
    'classes.manage',
    'subjects.view',
    'subjects.manage',
    'timetable.view',
    'timetable.manage',
    'admissions.view',
    'admissions.manage',
    'users.view',
    'users.manage',
    'reports.view',
    'reports.export',
    'documents.view',
    'documents.manage',
    'announcements.view',
    'announcements.create',
  ],
  ADMIN: [
    'institutions.view',
    'branches.manage',
    'branches.view',
    'students.view',
    'students.create',
    'students.edit',
    'students.delete',
    'attendance.view',
    'attendance.mark',
    'attendance.edit',
    'fees.view',
    'fees.create',
    'fees.collect',
    'expenses.view',
    'expenses.create',
    'salaries.view',
    'salaries.create',
    'salaries.pay',
    'exams.view',
    'exams.create',
    'exams.marks',
    'classes.view',
    'classes.manage',
    'subjects.view',
    'subjects.manage',
    'timetable.view',
    'timetable.manage',
    'admissions.view',
    'admissions.manage',
    'users.view',
    'users.manage',
    'reports.view',
    'reports.export',
    'documents.view',
    'documents.manage',
    'announcements.view',
    'announcements.create',
  ],
  TEACHER: [
    'students.view',
    'attendance.view',
    'attendance.mark',
    'attendance.edit',
    'exams.view',
    'exams.marks',
    'classes.view',
    'subjects.view',
    'timetable.view',
    'documents.view',
    'announcements.view',
    'announcements.create',
  ],
  ACCOUNTANT: [
    'students.view',
    'fees.view',
    'fees.create',
    'fees.collect',
    'expenses.view',
    'expenses.create',
    'salaries.view',
    'salaries.create',
    'salaries.pay',
    'reports.view',
    'reports.export',
    'announcements.view',
  ],
  RECEPTIONIST: [
    'students.view',
    'students.create',
    'admissions.view',
    'admissions.manage',
    'fees.view',
    'fees.collect',
    'documents.view',
    'documents.manage',
    'announcements.view',
  ],
  STAFF: [
    'documents.view',
    'announcements.view',
  ],
  PARENT: [
    'students.view',
    'attendance.view',
    'fees.view',
    'exams.view',
    'timetable.view',
    'announcements.view',
  ],
  STUDENT: [
    'attendance.view',
    'fees.view',
    'exams.view',
    'timetable.view',
    'announcements.view',
    'documents.view',
  ],
};

export function hasPermission(
  role: string,
  permission: Permission,
  customPermissions?: string[] | null
): boolean {
  if (role === 'SUPER_ADMIN') return true;

  if (customPermissions && customPermissions.length > 0) {
    if (customPermissions.includes(permission)) return true;
  }

  const rolePerms = ROLE_PERMISSIONS[role] || [];
  return rolePerms.includes(permission);
}
