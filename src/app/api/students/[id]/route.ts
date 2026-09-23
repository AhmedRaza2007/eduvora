import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthContext } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthContext(req);
    const { id } = await params;

    const student = await db.student.findUnique({
      where: { id },
      include: {
        class: true,
        section: true,
        session: true,
        parent: true,
        attendances: { orderBy: { date: 'desc' }, take: 30 },
        feeInvoices: { include: { feeType: true, payments: true }, orderBy: { createdAt: 'desc' } },
        marks: { include: { examSchedule: { include: { exam: true, subject: true } } } },
        results: { include: { exam: true } },
      },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    // Strict Tenant Isolation:
    // If user is authenticated and not superadmin, ensure student belongs to their institution
    if (auth.institutionId && !auth.isSuperAdmin && student.institutionId !== auth.institutionId) {
      return NextResponse.json({ success: false, error: 'Access denied: student not in your institution' }, { status: 403 });
    }

    // Role-specific checks:
    // If student: only allowed to see their own profile
    if (auth.role === 'STUDENT' && auth.user?.id && student.userId !== auth.user.id) {
      return NextResponse.json({ success: false, error: 'Access denied: you may only view your own profile' }, { status: 403 });
    }

    // Also fetch documents
    const documents = await db.document.findMany({
      where: { entityType: 'STUDENT', entityId: id, institutionId: student.institutionId },
    });

    return NextResponse.json({ success: true, student, documents });
  } catch (error) {
    console.error('API GET /students/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch student details' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthContext(req);
    const { id } = await params;
    const body = await req.json();

    const existing = await db.student.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    if (auth.institutionId && !auth.isSuperAdmin && existing.institutionId !== auth.institutionId) {
      return NextResponse.json({ success: false, error: 'Unauthorized to modify student in another institution' }, { status: 403 });
    }

    const student = await db.student.update({
      where: { id },
      data: {
        firstName: body.firstName ?? existing.firstName,
        lastName: body.lastName ?? existing.lastName,
        gender: body.gender ?? existing.gender,
        dob: body.dob ?? existing.dob,
        phone: body.phone ?? existing.phone,
        email: body.email ? body.email.toLowerCase().trim() : existing.email,
        address: body.address ?? existing.address,
        classId: body.classId ?? existing.classId,
        sectionId: body.sectionId ?? existing.sectionId,
        rollNo: body.rollNo ?? existing.rollNo,
        status: body.status ?? existing.status,
      },
    });

    await recordAuditLog({
      institutionId: existing.institutionId,
      userId: auth.user?.id,
      userName: auth.user?.name,
      userRole: auth.role,
      action: 'UPDATE',
      module: 'STUDENTS',
      description: `Updated student record for ${student.firstName} ${student.lastName} (${student.studentId}).`,
      req,
    });

    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthContext(req);
    const { id } = await params;

    const existing = await db.student.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    if (auth.institutionId && !auth.isSuperAdmin && existing.institutionId !== auth.institutionId) {
      return NextResponse.json({ success: false, error: 'Unauthorized to delete student in another institution' }, { status: 403 });
    }

    await db.student.delete({ where: { id } });

    await recordAuditLog({
      institutionId: existing.institutionId,
      userId: auth.user?.id,
      userName: auth.user?.name,
      userRole: auth.role,
      action: 'DELETE',
      module: 'STUDENTS',
      description: `Deleted student ${existing.firstName} ${existing.lastName} (${existing.studentId}).`,
      req,
    });

    return NextResponse.json({ success: true, message: 'Student deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete student' }, { status: 500 });
  }
}
