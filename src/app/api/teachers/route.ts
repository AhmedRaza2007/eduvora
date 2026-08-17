import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const teachers = await db.teacher.findMany({
      include: {
        classesTaught: true,
        classSubjects: { include: { class: true, subject: true } },
        salaries: { take: 5, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, teachers });
  } catch (error) {
    console.error('API GET /teachers error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch teachers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inst = await db.institution.findFirst();
    const mainBranch = await db.branch.findFirst({ where: { isMain: true } });

    if (!inst) {
      return NextResponse.json({ success: false, error: 'Institution not found' }, { status: 400 });
    }

    const count = await db.teacher.count();
    const teacherId = `TCH-2026-${(count + 1).toString().padStart(3, '0')}`;

    const teacher = await db.teacher.create({
      data: {
        institutionId: inst.id,
        branchId: mainBranch?.id,
        teacherId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address || '',
        qualification: body.qualification || 'Master Degree',
        joiningDate: body.joiningDate || new Date().toISOString().split('T')[0],
        salary: parseFloat(body.salary || 0),
        status: body.status || 'ACTIVE',
        photo: body.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
      },
    });

    return NextResponse.json({ success: true, teacher });
  } catch (error: any) {
    console.error('API POST /teachers error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create teacher' }, { status: 500 });
  }
}
