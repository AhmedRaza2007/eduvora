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
      return NextResponse.json({ success: true, sessions: [] });
    }

    const sessions = await db.academicSession.findMany({
      where: { institutionId },
      include: { _count: { select: { students: true, attendances: true, feeInvoices: true } } },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json({ success: true, sessions, institutionId });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch sessions' }, { status: 500 });
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

    if (body.action === 'CREATE_SESSION') {
      const session = await db.academicSession.create({
        data: {
          institutionId,
          name: body.name,
          startDate: body.startDate,
          endDate: body.endDate,
          isCurrent: false,
          status: 'ACTIVE',
        },
      });

      await recordAuditLog({
        institutionId,
        userId: auth.user?.id,
        userName: auth.user?.name,
        userRole: auth.role,
        action: 'CREATE',
        module: 'ACADEMICS',
        description: `Created academic session ${session.name} (${session.startDate} to ${session.endDate}).`,
        req,
      });

      return NextResponse.json({ success: true, session });
    }

    if (body.action === 'ACTIVATE_SESSION') {
      await db.academicSession.updateMany({
        where: { institutionId },
        data: { isCurrent: false },
      });

      const session = await db.academicSession.update({
        where: { id: body.sessionId },
        data: { isCurrent: true, status: 'ACTIVE' },
      });

      await recordAuditLog({
        institutionId,
        userId: auth.user?.id,
        userName: auth.user?.name,
        userRole: auth.role,
        action: 'UPDATE',
        module: 'ACADEMICS',
        description: `Set current active academic session to ${session.name}.`,
        req,
      });

      return NextResponse.json({ success: true, session });
    }

    if (body.action === 'PROMOTE_STUDENTS') {
      const { studentIds, targetClassId, targetSectionId, targetSessionId } = body;

      const updated = await db.student.updateMany({
        where: { id: { in: studentIds }, institutionId },
        data: {
          sessionId: targetSessionId,
          classId: targetClassId,
          sectionId: targetSectionId,
        },
      });

      await recordAuditLog({
        institutionId,
        userId: auth.user?.id,
        userName: auth.user?.name,
        userRole: auth.role,
        action: 'UPDATE',
        module: 'STUDENTS',
        description: `Promoted ${updated.count} students to new session/class.`,
        req,
      });

      return NextResponse.json({ success: true, updatedCount: updated.count });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed academic session operation' }, { status: 500 });
  }
}
