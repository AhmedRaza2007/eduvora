import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSessionToken, verifyPassword, SESSION_COOKIE_NAME } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        institution: true,
        branch: true,
        studentProfile: { include: { class: true, section: true } },
        teacherProfile: true,
        staffProfile: true,
        parentProfile: { include: { students: { include: { class: true, section: true } } } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials. User account not found.' },
        { status: 401 }
      );
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { success: false, error: 'This account has been suspended. Please contact platform support.' },
        { status: 403 }
      );
    }

    if (user.institution && user.institution.status === 'SUSPENDED') {
      return NextResponse.json(
        { success: false, error: 'Your institution account has been suspended by the platform administrator.' },
        { status: 403 }
      );
    }

    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid password. Please try again.' },
        { status: 401 }
      );
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
      case 'PARENT':
        redirectTo = '/parent';
        break;
      case 'STUDENT':
        redirectTo = '/student';
        break;
      case 'RECEPTIONIST':
        redirectTo = '/reception';
        break;
      case 'STAFF':
        redirectTo = '/staff';
        break;
      default:
        redirectTo = '/dashboard';
    }

    // Parse permissions
    let parsedPermissions: string[] = [];
    if (user.permissions) {
      try {
        parsedPermissions = JSON.parse(user.permissions);
      } catch {
        parsedPermissions = [];
      }
    }

    // Generate session token
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
      permissions: parsedPermissions,
    });

    // Update lastLoginAt
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Record audit log
    await recordAuditLog({
      institutionId: user.institutionId,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      module: 'AUTH',
      description: `User ${user.name} (${user.email}) logged in successfully with role ${user.role}.`,
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

    // Set secure HTTP-only cookie
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
    console.error('API /auth/login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
