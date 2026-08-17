import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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

    const documents = await db.document.findMany({
      where: { entityType: 'TEACHER', entityId: id },
    });

    return NextResponse.json({ success: true, teacher, documents });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch teacher details' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const teacher = await db.teacher.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        qualification: body.qualification,
        salary: parseFloat(body.salary || 0),
        status: body.status,
      },
    });

    return NextResponse.json({ success: true, teacher });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update teacher' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.teacher.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete teacher' }, { status: 500 });
  }
}
