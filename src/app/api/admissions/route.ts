import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const admissions = await db.admission.findMany({
      include: { targetClass: true },
      orderBy: { appliedDate: 'desc' },
    });

    return NextResponse.json({ success: true, admissions });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch admissions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inst = await db.institution.findFirst();

    if (!inst) {
      return NextResponse.json({ success: false, error: 'Institution not found' }, { status: 400 });
    }

    const count = await db.admission.count();
    const applicationNo = `APP-2026-${(count + 901).toString()}`;

    const admission = await db.admission.create({
      data: {
        institutionId: inst.id,
        applicationNo,
        applicantName: body.applicantName,
        dob: body.dob || '2012-01-01',
        gender: body.gender || 'Male',
        phone: body.phone,
        email: body.email || '',
        address: body.address || '',
        targetClassId: body.targetClassId,
        parentName: body.parentName,
        parentPhone: body.parentPhone || body.phone,
        admissionFee: parseFloat(body.admissionFee || 500),
        status: body.status || 'PENDING',
        appliedDate: body.appliedDate || new Date().toISOString().split('T')[0],
      },
      include: { targetClass: true },
    });

    return NextResponse.json({ success: true, admission });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create admission application' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    const admission = await db.admission.update({
      where: { id },
      data: { status },
      include: { targetClass: true },
    });

    // If status is ENROLLED, auto create Student record!
    if (status === 'ENROLLED') {
      const session = await db.academicSession.findFirst({ where: { isCurrent: true } });
      const sec = await db.section.findFirst({ where: { classId: admission.targetClassId } });
      const stCount = await db.student.count();

      if (session && sec) {
        await db.student.create({
          data: {
            institutionId: admission.institutionId,
            sessionId: session.id,
            studentId: `STU-2026-${(stCount + 1).toString().padStart(3, '0')}`,
            admissionNo: `ADM-2026-${(stCount + 101).toString().padStart(3, '0')}`,
            firstName: admission.applicantName.split(' ')[0],
            lastName: admission.applicantName.split(' ').slice(1).join(' ') || 'Student',
            gender: admission.gender,
            dob: admission.dob,
            phone: admission.phone,
            email: admission.email,
            address: admission.address,
            classId: admission.targetClassId,
            sectionId: sec.id,
            rollNo: (stCount + 1).toString(),
            admissionDate: new Date().toISOString().split('T')[0],
            status: 'ACTIVE',
          },
        });
      }
    }

    return NextResponse.json({ success: true, admission });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update admission status' }, { status: 500 });
  }
}
