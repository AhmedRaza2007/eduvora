import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthContext } from '@/lib/auth';

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
      return NextResponse.json({ success: true, attendances: [], students: [] });
    }

    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const sectionId = searchParams.get('sectionId') || '';
    const classId = searchParams.get('classId') || '';

    const where: any = { institutionId, date };
    if (sectionId) where.sectionId = sectionId;

    const attendances = await db.attendance.findMany({
      where,
      include: {
        student: { include: { class: true, section: true } },
      },
    });

    let studentWhere: any = { institutionId, status: 'ACTIVE' };
    if (sectionId) studentWhere.sectionId = sectionId;
    else if (classId) studentWhere.classId = classId;

    const students = await db.student.findMany({
      where: studentWhere,
      include: { class: true, section: true },
      orderBy: { rollNo: 'asc' },
    });

    return NextResponse.json({ success: true, attendances, students, date });
  } catch (error) {
    console.error('API GET /attendance error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    const body = await req.json();
    const { records, date, sectionId } = body;

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
        { success: false, error: 'Active session not found for this institution' },
        { status: 400 }
      );
    }

    const attendanceDate = date || new Date().toISOString().split('T')[0];
    const results = [];

    for (const rec of records || []) {
      // Upsert to prevent duplicate attendance record for same student/date/session
      const att = await db.attendance.upsert({
        where: {
          studentId_date_sessionId: {
            studentId: rec.studentId,
            date: attendanceDate,
            sessionId: session.id,
          },
        },
        update: {
          status: rec.status,
          remarks: rec.remarks || null,
        },
        create: {
          institutionId,
          studentId: rec.studentId,
          sectionId: rec.sectionId || sectionId,
          date: attendanceDate,
          status: rec.status,
          remarks: rec.remarks || null,
          sessionId: session.id,
        },
      });
      results.push(att);
    }

    return NextResponse.json({ success: true, count: results.length, records: results });
  } catch (error: any) {
    console.error('API POST /attendance error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to save attendance' }, { status: 500 });
  }
}
