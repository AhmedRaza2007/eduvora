import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const sessions = await db.academicSession.findMany({
      include: { _count: { select: { students: true, attendances: true, feeInvoices: true } } },
      orderBy: { startDate: 'desc' },
    });
    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inst = await db.institution.findFirst();

    if (!inst) {
      return NextResponse.json({ success: false, error: 'Institution not found' }, { status: 400 });
    }

    if (body.action === 'CREATE_SESSION') {
      const session = await db.academicSession.create({
        data: {
          institutionId: inst.id,
          name: body.name,
          startDate: body.startDate,
          endDate: body.endDate,
          isCurrent: false,
          status: 'ACTIVE',
        },
      });
      return NextResponse.json({ success: true, session });
    }

    if (body.action === 'ACTIVATE_SESSION') {
      // Set all sessions isCurrent = false
      await db.academicSession.updateMany({
        where: { institutionId: inst.id },
        data: { isCurrent: false },
      });

      const session = await db.academicSession.update({
        where: { id: body.sessionId },
        data: { isCurrent: true, status: 'ACTIVE' },
      });

      return NextResponse.json({ success: true, session });
    }

    if (body.action === 'PROMOTE_STUDENTS') {
      const { studentIds, targetClassId, targetSectionId, targetSessionId } = body;

      // Batch update students to new session/class/section while keeping all past attendances & invoices tied to old session!
      const updated = await db.student.updateMany({
        where: { id: { in: studentIds } },
        data: {
          classId: targetClassId,
          sectionId: targetSectionId,
          sessionId: targetSessionId,
        },
      });

      return NextResponse.json({ success: true, count: updated.count });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed session operation' }, { status: 500 });
  }
}
