import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthContext, requireAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    const { searchParams } = new URL(req.url);

    let institutionId = auth.institutionId;
    if (!institutionId && auth.isSuperAdmin) {
      institutionId = searchParams.get('institutionId');
    }
    if (!institutionId) {
      const firstInst = await db.institution.findFirst({ where: { status: 'ACTIVE' } });
      institutionId = firstInst?.id || null;
    }

    if (!institutionId) {
      return NextResponse.json({ success: true, timetables: [] });
    }

    const classId = searchParams.get('classId') || '';
    let teacherId = searchParams.get('teacherId') || '';

    const where: any = { institutionId };
    if (classId) where.classId = classId;

    // Role-specific scoping
    if (auth.role === 'TEACHER' && auth.user?.id) {
      const teacherRec = await db.teacher.findFirst({ where: { userId: auth.user.id } });
      if (teacherRec) where.teacherId = teacherRec.id;
    } else if (teacherId) {
      where.teacherId = teacherId;
    }

    if (auth.role === 'STUDENT' && auth.user?.id) {
      const studentRec = await db.student.findFirst({ where: { userId: auth.user.id } });
      if (studentRec) where.classId = studentRec.classId;
    }

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

    return NextResponse.json({ success: true, timetables, institutionId });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch timetables' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { auth, response } = await requireAuth(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN']);
    if (response) return response;

    const body = await req.json();
    let institutionId = auth.institutionId;
    if (!institutionId && auth.isSuperAdmin) {
      institutionId = body.institutionId;
    }
    if (!institutionId) {
      const firstInst = await db.institution.findFirst({ where: { status: 'ACTIVE' } });
      institutionId = firstInst?.id || null;
    }

    if (!institutionId) {
      return NextResponse.json({ success: false, error: 'Institution not found' }, { status: 400 });
    }

    // Anti-collision check for teacher schedule conflict within this institution
    const conflict = await db.timetable.findFirst({
      where: {
        institutionId,
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
          error: `Schedule conflict! Teacher is already scheduled for ${conflict.class.name} on ${conflict.dayOfWeek} from ${conflict.startTime} to ${conflict.endTime}.`,
        },
        { status: 400 }
      );
    }

    const timetable = await db.timetable.create({
      data: {
        institutionId,
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

    await recordAuditLog({
      institutionId,
      userId: auth.user?.id,
      userName: auth.user?.name,
      userRole: auth.role,
      action: 'CREATE',
      module: 'TIMETABLE',
      description: `Scheduled slot for ${timetable.class.name} (${timetable.dayOfWeek} ${timetable.startTime}-${timetable.endTime}).`,
      req,
    });

    return NextResponse.json({ success: true, timetable });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create timetable entry' }, { status: 500 });
  }
}
