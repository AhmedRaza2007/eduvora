import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId') || '';
    const teacherId = searchParams.get('teacherId') || '';

    const where: any = {};
    if (classId) where.classId = classId;
    if (teacherId) where.teacherId = teacherId;

    const timetables = await db.timetable.findMany({
      where,
      include: {
        class: true,
        section: true,
        subject: true,
        teacher: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return NextResponse.json({ success: true, timetables });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch timetables' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inst = await db.institution.findFirst();

    if (!inst) {
      return NextResponse.json({ success: false, error: 'Institution not found' }, { status: 400 });
    }

    // Anti-collision check for teacher schedule conflict
    const conflict = await db.timetable.findFirst({
      where: {
        teacherId: body.teacherId,
        dayOfWeek: body.dayOfWeek,
        OR: [
          {
            startTime: { lte: body.startTime },
            endTime: { gt: body.startTime },
          },
          {
            startTime: { lt: body.endTime },
            endTime: { gte: body.endTime },
          },
        ],
      },
      include: { teacher: true, class: true },
    });

    if (conflict) {
      return NextResponse.json(
        {
          success: false,
          error: `Schedule Conflict: ${conflict.teacher.name} is already assigned to ${conflict.class.name} on ${body.dayOfWeek} from ${conflict.startTime} to ${conflict.endTime}.`,
        },
        { status: 400 }
      );
    }

    const timetable = await db.timetable.create({
      data: {
        institutionId: inst.id,
        classId: body.classId,
        sectionId: body.sectionId,
        subjectId: body.subjectId,
        teacherId: body.teacherId,
        room: body.room || 'Room 101',
        dayOfWeek: body.dayOfWeek,
        startTime: body.startTime,
        endTime: body.endTime,
      },
      include: { class: true, section: true, subject: true, teacher: true },
    });

    return NextResponse.json({ success: true, timetable });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create timetable slot' }, { status: 500 });
  }
}
