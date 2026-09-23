import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthContext } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthContext(req);
    const { id } = await params;

    const teacher = await db.teacher.findUnique({
      where: { id },
      include: {
        classesTaught: true,
        classSubjects: { include: { class: true, subject: true } },
        timetables: { include: { class: true, section: true, subject: true } },
        salaries: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!teacher) {
      return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });
    }

    if (auth.institutionId && !auth.isSuperAdmin && teacher.institutionId !== auth.institutionId) {
      return NextResponse.json({ success: false, error: 'Access denied: teacher not in your institution' }, { status: 403 });
    }

    const documents = await db.document.findMany({
      where: { entityType: 'TEACHER', entityId: id, institutionId: teacher.institutionId },
    });

    return NextResponse.json({ success: true, teacher, documents });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch teacher details' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthContext(req);
    const { id } = await params;
    const body = await req.json();

    const existing = await db.teacher.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });
    }

    if (auth.institutionId && !auth.isSuperAdmin && existing.institutionId !== auth.institutionId) {
      return NextResponse.json({ success: false, error: 'Unauthorized to modify teacher in another institution' }, { status: 403 });
    }

    const teacher = await db.teacher.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        email: body.email ? body.email.toLowerCase().trim() : existing.email,
        phone: body.phone ?? existing.phone,
        address: body.address ?? existing.address,
        qualification: body.qualification ?? existing.qualification,
        salary: body.salary !== undefined ? parseFloat(body.salary) : existing.salary,
        status: body.status ?? existing.status,
      },
    });

    await recordAuditLog({
      institutionId: existing.institutionId,
      userId: auth.user?.id,
      userName: auth.user?.name,
      userRole: auth.role,
      action: 'UPDATE',
      module: 'STAFF',
      description: `Updated teacher record for ${teacher.name} (${teacher.teacherId}).`,
      req,
    });

    return NextResponse.json({ success: true, teacher });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update teacher' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthContext(req);
    const { id } = await params;

    const existing = await db.teacher.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });
    }

    if (auth.institutionId && !auth.isSuperAdmin && existing.institutionId !== auth.institutionId) {
      return NextResponse.json({ success: false, error: 'Unauthorized to delete teacher in another institution' }, { status: 403 });
    }

    await db.teacher.delete({ where: { id } });

    await recordAuditLog({
      institutionId: existing.institutionId,
      userId: auth.user?.id,
      userName: auth.user?.name,
      userRole: auth.role,
      action: 'DELETE',
      module: 'STAFF',
      description: `Deleted teacher ${existing.name} (${existing.teacherId}).`,
      req,
    });

    return NextResponse.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete teacher' }, { status: 500 });
  }
}
