import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthContext } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);

    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const dbUser = await db.user.findUnique({
      where: { id: auth.user.id },
      include: {
        institution: true,
        branch: true,
        studentProfile: { include: { class: true, section: true } },
        teacherProfile: true,
        staffProfile: true,
        parentProfile: { include: { students: { include: { class: true, section: true } } } },
      },
    });

    if (!dbUser || dbUser.status === 'SUSPENDED') {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        avatar: dbUser.avatar,
        phone: dbUser.phone,
        cnic: dbUser.cnic,
        institutionId: dbUser.institutionId,
        branchId: dbUser.branchId,
        institution: dbUser.institution,
        branch: dbUser.branch,
        studentProfile: dbUser.studentProfile,
        teacherProfile: dbUser.teacherProfile,
        staffProfile: dbUser.staffProfile,
        parentProfile: dbUser.parentProfile,
      },
    });
  } catch (error: any) {
    console.error('API /auth/me error:', error);
    return NextResponse.json({ authenticated: false, error: 'Failed to verify session' }, { status: 500 });
  }
}
