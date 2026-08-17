import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [classes, subjects, teachers] = await Promise.all([
      db.class.findMany({
        include: {
          sections: { include: { _count: { select: { students: true } } } },
          classTeacher: true,
          classSubjects: { include: { subject: true, teacher: true } },
          _count: { select: { students: true } },
        },
        orderBy: { name: 'asc' },
      }),
      db.subject.findMany({
        include: { classSubjects: { include: { class: true } } },
      }),
      db.teacher.findMany({ where: { status: 'ACTIVE' } }),
    ]);

    return NextResponse.json({ success: true, classes, subjects, teachers });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch classes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inst = await db.institution.findFirst();

    if (!inst) {
      return NextResponse.json({ success: false, error: 'Institution not found' }, { status: 400 });
    }

    if (body.type === 'CLASS') {
      const newClass = await db.class.create({
        data: {
          institutionId: inst.id,
          name: body.name,
          code: body.code || body.name.substring(0, 5).toUpperCase(),
          classTeacherId: body.classTeacherId || null,
        },
      });

      // Default Section A
      await db.section.create({
        data: { classId: newClass.id, name: 'Section A', capacity: 40 },
      });

      return NextResponse.json({ success: true, class: newClass });
    }

    if (body.type === 'SUBJECT') {
      const subject = await db.subject.create({
        data: {
          institutionId: inst.id,
          name: body.name,
          code: body.code || body.name.substring(0, 4).toUpperCase(),
          type: body.subjectType || 'Core',
        },
      });
      return NextResponse.json({ success: true, subject });
    }

    if (body.type === 'SECTION') {
      const section = await db.section.create({
        data: {
          classId: body.classId,
          name: body.name,
          capacity: parseInt(body.capacity || 40),
        },
      });
      return NextResponse.json({ success: true, section });
    }

    return NextResponse.json({ success: false, error: 'Invalid type specified' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create record' }, { status: 500 });
  }
}
