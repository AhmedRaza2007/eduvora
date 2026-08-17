import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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

    // Also fetch documents
    const documents = await db.document.findMany({
      where: { entityType: 'STUDENT', entityId: id },
    });

    return NextResponse.json({ success: true, student, documents });
  } catch (error) {
    console.error('API GET /students/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch student details' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const student = await db.student.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        gender: body.gender,
        dob: body.dob,
        phone: body.phone,
        email: body.email,
        address: body.address,
        classId: body.classId,
        sectionId: body.sectionId,
        rollNo: body.rollNo,
        status: body.status,
      },
    });

    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.student.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Student deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete student' }, { status: 500 });
  }
}
