import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthContext } from '@/lib/auth';
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
      return NextResponse.json({ success: true, admissions: [] });
    }

    const admissions = await db.admission.findMany({
      where: { institutionId },
      include: { targetClass: true },
      orderBy: { appliedDate: 'desc' },
    });

    return NextResponse.json({ success: true, admissions, institutionId });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch admissions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
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

    const count = await db.admission.count({ where: { institutionId } });
    const year = new Date().getFullYear();
    const applicationNo = `APP-${year}-${(count + 1001).toString()}`;

    const admission = await db.admission.create({
      data: {
        institutionId,
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

    await recordAuditLog({
      institutionId,
      userId: auth.user?.id,
      userName: auth.user?.name,
      userRole: auth.role,
      action: 'CREATE',
      module: 'ADMISSIONS',
      description: `New admission application submitted: ${admission.applicantName} (${admission.applicationNo}).`,
      req,
    });

    return NextResponse.json({ success: true, admission });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create admission application' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    const body = await req.json();
    const { id, status } = body;

    const existing = await db.admission.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Admission application not found' }, { status: 404 });
    }

    if (auth.institutionId && !auth.isSuperAdmin && existing.institutionId !== auth.institutionId) {
      return NextResponse.json({ success: false, error: 'Unauthorized to update admission in another institution' }, { status: 403 });
    }

    const admission = await db.admission.update({
      where: { id },
      data: { status },
      include: { targetClass: true },
    });

    // If status is ENROLLED, auto create Student record in same institution!
    if (status === 'ENROLLED') {
      const session = await db.academicSession.findFirst({
        where: { institutionId: admission.institutionId, isCurrent: true },
      });
      const sec = await db.section.findFirst({ where: { classId: admission.targetClassId } });
      const stCount = await db.student.count({ where: { institutionId: admission.institutionId } });
      const year = new Date().getFullYear();

      if (session && sec) {
        await db.student.create({
          data: {
            institutionId: admission.institutionId,
            sessionId: session.id,
            studentId: `STU-${year}-${(stCount + 1).toString().padStart(3, '0')}`,
            admissionNo: `ADM-${year}-${(stCount + 101).toString().padStart(3, '0')}`,
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

    await recordAuditLog({
      institutionId: admission.institutionId,
      userId: auth.user?.id,
      userName: auth.user?.name,
      userRole: auth.role,
      action: 'UPDATE',
      module: 'ADMISSIONS',
      description: `Updated admission application ${admission.applicationNo} status to ${status}.`,
      req,
    });

    return NextResponse.json({ success: true, admission });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update admission status' }, { status: 500 });
  }
}
