import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthContext, requireAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { auth, response } = await requireAuth(req, ['ADMIN', 'OWNER', 'RECEPTIONIST', 'SUPER_ADMIN']);
    if (response) return response;

    const body = await req.json();
    const { students = [], branchId } = body;

    let institutionId = auth.institutionId;
    if (!institutionId && auth.isSuperAdmin) {
      institutionId = body.institutionId;
    }
    if (!institutionId) {
      const firstInst = await db.institution.findFirst();
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
        { success: false, error: 'No active academic session found for this institution' },
        { status: 400 }
      );
    }

    // Pre-fetch classes and sections
    const classes = await db.class.findMany({
      where: { institutionId },
      include: { sections: true },
    });

    const defaultClass = classes[0];
    const defaultSection = defaultClass?.sections[0];

    let createdCount = 0;
    const errors: string[] = [];
    const baseCount = await db.student.count({ where: { institutionId } });

    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      const rowNum = i + 1;

      if (!s.firstName || !s.lastName) {
        errors.push(`Row ${rowNum}: First and Last name are required.`);
        continue;
      }

      // Find matching class or fallback
      let matchedClass = defaultClass;
      let matchedSection = defaultSection;

      if (s.className) {
        const found = classes.find(
          (c) => c.name.toLowerCase() === s.className.toLowerCase()
        );
        if (found) {
          matchedClass = found;
          if (s.sectionName) {
            const secFound = found.sections.find(
              (sec) => sec.name.toLowerCase() === s.sectionName.toLowerCase()
            );
            if (secFound) matchedSection = secFound;
          }
        }
      }

      if (!matchedClass || !matchedSection) {
        errors.push(`Row ${rowNum}: No class or section available.`);
        continue;
      }

      const countNum = baseCount + createdCount + 1;
      const studentId = s.studentId || `STU-${new Date().getFullYear()}-${countNum.toString().padStart(4, '0')}`;
      const admissionNo = s.admissionNo || `ADM-${new Date().getFullYear()}-${countNum.toString().padStart(4, '0')}`;
      const rollNo = s.rollNo || countNum.toString();

      try {
        await db.student.create({
          data: {
            institutionId,
            branchId: branchId || auth.branchId || null,
            studentId,
            admissionNo,
            firstName: s.firstName.trim(),
            lastName: s.lastName.trim(),
            gender: s.gender || 'Male',
            dob: s.dob || '2010-01-01',
            phone: s.phone || null,
            email: s.email ? s.email.toLowerCase().trim() : null,
            address: s.address || null,
            classId: matchedClass.id,
            sectionId: matchedSection.id,
            rollNo,
            admissionDate: s.admissionDate || new Date().toISOString().split('T')[0],
            sessionId: session.id,
            status: 'ACTIVE',
          },
        });
        createdCount++;
      } catch (err: any) {
        errors.push(`Row ${rowNum} (${s.firstName} ${s.lastName}): ${err.message || 'Database error'}`);
      }
    }

    await recordAuditLog({
      institutionId,
      userId: auth.user?.id,
      userName: auth.user?.name,
      userRole: auth.role,
      action: 'IMPORT',
      module: 'STUDENTS',
      description: `Bulk imported ${createdCount} students (Encountered ${errors.length} errors).`,
      req,
    });

    return NextResponse.json({
      success: true,
      importedCount: createdCount,
      totalSubmitted: students.length,
      errors: errors.slice(0, 20),
    });
  } catch (error: any) {
    console.error('API POST /students/bulk error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed bulk import' },
      { status: 500 }
    );
  }
}
