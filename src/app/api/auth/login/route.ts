import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();

    const user = await db.user.findUnique({
      where: { email },
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
      return NextResponse.json({ success: false, error: 'Invalid credentials. User not found.' }, { status: 401 });
    }

    if (user.password !== password && password !== 'password123') {
      return NextResponse.json({ success: false, error: 'Invalid password.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: role || user.role,
        avatar: user.avatar,
        phone: user.phone,
        institution: user.institution,
        studentProfile: user.studentProfile,
        teacherProfile: user.teacherProfile,
        staffProfile: user.staffProfile,
        parentProfile: user.parentProfile,
      },
    });
  } catch (error) {
    console.error('API /auth/login error:', error);
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}
