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
      return NextResponse.json({ success: true, classes: [], subjects: [], teachers: [] });
    }

    const [classes, subjects, teachers] = await Promise.all([
      db.class.findMany({
        where: { institutionId },
        include: {
          sections: { include: { _count: { select: { students: true } } } },
          classTeacher: true,
          classSubjects: { include: { subject: true, teacher: true } },
          _count: { select: { students: true } },
        },
        orderBy: { name: 'asc' },
      }),
      db.subject.findMany({
        where: { institutionId },
        include: { classSubjects: { include: { class: true } } },
      }),
      db.teacher.findMany({ where: { institutionId, status: 'ACTIVE' } }),
    ]);

    return NextResponse.json({ success: true, classes, subjects, teachers, institutionId });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch classes' }, { status: 500 });
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

    if (body.type === 'CLASS') {
      const newClass = await db.class.create({
        data: {
          institutionId,
          branchId: body.branchId || auth.branchId || null,
          name: body.name,
          code: body.code || body.name.substring(0, 6).toUpperCase(),
          department: body.department || null,
          program: body.program || null,
          semester: body.semester || null,
          creditHours: body.creditHours ? parseInt(body.creditHours) : null,
          batchTiming: body.batchTiming || null,
          batchDays: body.batchDays || null,
          feeMonthly: body.feeMonthly ? parseFloat(body.feeMonthly) : null,
          classTeacherId: body.classTeacherId || null,
        },
      });

      // Default Section A
      await db.section.create({
        data: {
          classId: newClass.id,
          name: body.sectionName || 'Section A',
          capacity: body.capacity ? parseInt(body.capacity) : 40,
        },
      });

      await recordAuditLog({
        institutionId,
        userId: auth.user?.id,
        userName: auth.user?.name,
        userRole: auth.role,
        action: 'CREATE',
        module: 'ACADEMICS',
        description: `Created class/program ${newClass.name} (${newClass.code}).`,
        req,
      });

      return NextResponse.json({ success: true, class: newClass });
    }

    if (body.type === 'SUBJECT') {
      const subject = await db.subject.create({
        data: {
          institutionId,
          name: body.name,
          code: body.code || body.name.substring(0, 4).toUpperCase(),
          type: body.subjectType || 'Core',
        },
      });

      if (body.classId) {
        await db.classSubject.create({
          data: {
            classId: body.classId,
            subjectId: subject.id,
            teacherId: body.teacherId || null,
          },
        });
      }

      await recordAuditLog({
        institutionId,
        userId: auth.user?.id,
        userName: auth.user?.name,
        userRole: auth.role,
        action: 'CREATE',
        module: 'ACADEMICS',
        description: `Created subject ${subject.name} (${subject.code}).`,
        req,
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

    return NextResponse.json({ success: false, error: 'Invalid class entity type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create class entity' }, { status: 500 });
  }
}
