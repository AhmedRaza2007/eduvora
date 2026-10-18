import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetRole = (body.role || 'ADMIN').toUpperCase().trim();

    const validRoles = [
      'SUPER_ADMIN',
      'ADMIN',
      'OWNER',
      'TEACHER',
      'ACCOUNTANT',
      'RECEPTIONIST',
      'STAFF',
      'PARENT',
      'STUDENT',
    ];

    if (!validRoles.includes(targetRole)) {
      return NextResponse.json(
        { success: false, error: `Invalid role: ${targetRole}` },
        { status: 400 }
      );
    }

    // Role-to-default-email mapping for seeded demo accounts
    const roleEmailMap: Record<string, string> = {
      SUPER_ADMIN: 'superadmin@eduvora.com',
      ADMIN: 'admin@eduvora.edu',
      OWNER: 'admin@eduvora.edu',
      TEACHER: 'teacher@eduvora.edu',
      ACCOUNTANT: 'accountant@eduvora.edu',
      RECEPTIONIST: 'reception@eduvora.edu',
      PARENT: 'parent@eduvora.edu',
      STUDENT: 'student@eduvora.edu',
      STAFF: 'staff@eduvora.edu',
    };

    const targetEmail = roleEmailMap[targetRole];

    // Try finding by specific seeded email first, then fallback to any user with that role
    let user = await db.user.findFirst({
      where: {
        OR: [
          { email: targetEmail },
          { role: targetRole, status: 'ACTIVE' },
        ],
      },
      include: {
        institution: true,
        branch: true,
        studentProfile: { include: { class: true, section: true } },
        teacherProfile: true,
        staffProfile: true,
        parentProfile: { include: { students: { include: { class: true, section: true } } } },
      },
    });

    // Fallback if seeded account doesn't exist yet: find default institution
    if (!user) {
      let institution = await db.institution.findFirst({ where: { status: 'ACTIVE' } });
      if (!institution) {
        institution = await db.institution.create({
          data: {
            name: 'Eduvora Global Academy',
            code: 'EDU-01',
            type: 'School & College',
            currency: 'PKR',
            status: 'ACTIVE',
          },
        });
      }

      user = await db.user.create({
        data: {
          institutionId: targetRole === 'SUPER_ADMIN' ? null : institution.id,
          name: `${targetRole.replace('_', ' ')} Demo User`,
          email: targetEmail || `demo-${targetRole.toLowerCase()}@eduvora.edu`,
          password: 'password123',
          role: targetRole,
          status: 'ACTIVE',
        },
        include: {
          institution: true,
          branch: true,
          studentProfile: { include: { class: true, section: true } },
          teacherProfile: true,
          staffProfile: true,
          parentProfile: { include: { students: { include: { class: true, section: true } } } },
        },
      });
    }

    // Determine redirect route based on role
    let redirectTo = '/dashboard';
    switch (user.role) {
      case 'SUPER_ADMIN':
        redirectTo = '/super-admin';
        break;
      case 'TEACHER':
        redirectTo = '/teacher';
        break;
      case 'ACCOUNTANT':
        redirectTo = '/dashboard/fees';
        break;
      case 'RECEPTIONIST':
        redirectTo = '/reception';
        break;
      case 'PARENT':
        redirectTo = '/parent';
        break;
      case 'STUDENT':
        redirectTo = '/student';
        break;
      case 'STAFF':
        redirectTo = '/staff';
        break;
      default:
        redirectTo = '/dashboard';
    }

    // Generate signed session token
    const token = createSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
      branchId: user.branchId,
      institutionName: user.institution?.name || null,
      institutionType: user.institution?.type || null,
      branchName: user.branch?.name || null,
      avatar: user.avatar,
      permissions: [],
    });

    // Record audit log
    await recordAuditLog({
      institutionId: user.institutionId,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      module: 'AUTH',
      description: `Switched active demo session to role ${user.role} (${user.email}).`,
      req,
    });

    const response = NextResponse.json({
      success: true,
      redirectTo,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        institutionId: user.institutionId,
        branchId: user.branchId,
        institution: user.institution,
        branch: user.branch,
        studentProfile: user.studentProfile,
        teacherProfile: user.teacherProfile,
        staffProfile: user.staffProfile,
        parentProfile: user.parentProfile,
      },
    });

    // Write HTTP-only cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('API /auth/demo-switch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to switch role session' },
      { status: 500 }
    );
  }
}
