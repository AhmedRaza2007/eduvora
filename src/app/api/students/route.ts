import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const classId = searchParams.get('classId') || '';
    const sectionId = searchParams.get('sectionId') || '';
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { studentId: { contains: search } },
        { admissionNo: { contains: search } },
        { rollNo: { contains: search } },
      ];
    }
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;
    if (status) where.status = status;

    const students = await db.student.findMany({
      where,
      include: {
        class: true,
        section: true,
        session: true,
        parent: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, students });
  } catch (error) {
    console.error('API GET /students error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inst = await db.institution.findFirst();
    const session = await db.academicSession.findFirst({ where: { isCurrent: true } });

    if (!inst || !session) {
      return NextResponse.json({ success: false, error: 'Institution or active session not found' }, { status: 400 });
    }

    const count = await db.student.count();
    const studentId = body.studentId || `STU-2026-${(count + 1).toString().padStart(3, '0')}`;
    const admissionNo = body.admissionNo || `ADM-2026-${(count + 101).toString().padStart(3, '0')}`;

    // Create optional parent if parentName provided and no parentId
    let parentId = body.parentId;
    if (!parentId && body.parentName) {
      const newParent = await db.parent.create({
        data: {
          institutionId: inst.id,
          name: body.parentName,
          contact: body.parentPhone || body.phone || 'N/A',
          email: body.parentEmail,
          relationship: body.parentRelationship || 'Father',
        },
      });
      parentId = newParent.id;
    }

    const student = await db.student.create({
      data: {
        institutionId: inst.id,
        sessionId: session.id,
        studentId,
        admissionNo,
        firstName: body.firstName,
        lastName: body.lastName,
        gender: body.gender || 'Male',
        dob: body.dob || '2010-01-01',
        phone: body.phone || '',
        email: body.email || '',
        address: body.address || '',
        classId: body.classId,
        sectionId: body.sectionId,
        rollNo: body.rollNo || (count + 1).toString(),
        admissionDate: body.admissionDate || new Date().toISOString().split('T')[0],
        status: body.status || 'ACTIVE',
        parentId,
        photo: body.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      },
      include: { class: true, section: true, parent: true },
    });

    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    console.error('API POST /students error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create student' }, { status: 500 });
  }
}
