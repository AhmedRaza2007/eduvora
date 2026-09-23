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
      // Demo / fallback to first active institution
      const firstInst = await db.institution.findFirst({ where: { status: 'ACTIVE' } });
      institutionId = firstInst?.id || null;
    }

    if (!institutionId) {
      return NextResponse.json({ success: true, students: [] });
    }

    const search = searchParams.get('search')?.trim() || '';
    const classId = searchParams.get('classId') || '';
    const sectionId = searchParams.get('sectionId') || '';
    const status = searchParams.get('status') || '';
    const branchId = searchParams.get('branchId') || auth.branchId || '';

    const where: any = { institutionId };

    if (branchId && branchId !== 'all') {
      where.branchId = branchId;
    }

    // Role-specific scoping:
    // If student: only show themselves
    if (auth.role === 'STUDENT' && auth.user?.id) {
      where.userId = auth.user.id;
    }

    // If parent: only show their children
    if (auth.role === 'PARENT' && auth.user?.id) {
      const parentRec = await db.parent.findFirst({ where: { userId: auth.user.id } });
      if (parentRec) {
        where.parentId = parentRec.id;
      }
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } },
        { admissionNo: { contains: search, mode: 'insensitive' } },
        { rollNo: { contains: search, mode: 'insensitive' } },
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
    const auth = await getAuthContext(req);
    const body = await req.json();

    // Determine target institutionId
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

    const session = await db.academicSession.findFirst({
      where: { institutionId, isCurrent: true },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Active academic session not found for this institution' },
        { status: 400 }
      );
    }

    // Verify class belongs to institution
    const targetClass = await db.class.findFirst({
      where: { id: body.classId, institutionId },
    });

    if (!targetClass) {
      return NextResponse.json(
        { success: false, error: 'Selected class does not belong to this institution' },
        { status: 400 }
      );
    }

    const count = await db.student.count({ where: { institutionId } });
    const studentId = body.studentId || `STU-${new Date().getFullYear()}-${(count + 1).toString().padStart(3, '0')}`;
    const admissionNo = body.admissionNo || `ADM-${new Date().getFullYear()}-${(count + 101).toString().padStart(3, '0')}`;

    // Create optional parent if parentName provided and no parentId
    let parentId = body.parentId;
    if (!parentId && body.parentName) {
      const newParent = await db.parent.create({
        data: {
          institutionId,
          name: body.parentName,
          contact: body.parentPhone || body.phone || 'N/A',
          email: body.parentEmail || null,
          relationship: body.parentRelationship || 'Father',
        },
      });
      parentId = newParent.id;
    }

    const student = await db.student.create({
      data: {
        institutionId,
        branchId: body.branchId || auth.branchId || null,
        sessionId: session.id,
        studentId,
        admissionNo,
        firstName: body.firstName,
        lastName: body.lastName,
        gender: body.gender || 'Male',
        dob: body.dob || '2010-01-01',
        phone: body.phone || '',
        email: body.email ? body.email.toLowerCase().trim() : '',
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

    await recordAuditLog({
      institutionId,
      userId: auth.user?.id,
      userName: auth.user?.name,
      userRole: auth.role,
      action: 'CREATE',
      module: 'STUDENTS',
      description: `Created student ${student.firstName} ${student.lastName} (${student.studentId}).`,
      req,
    });

    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    console.error('API POST /students error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create student' }, { status: 500 });
  }
}
