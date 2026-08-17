import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const sectionId = searchParams.get('sectionId') || '';
    const classId = searchParams.get('classId') || '';

    const where: any = { date };
    if (sectionId) where.sectionId = sectionId;

    const attendances = await db.attendance.findMany({
      where,
      include: {
        student: { include: { class: true, section: true } },
      },
    });

    // Also fetch all students of sectionId or classId to build full attendance sheet grid
    let studentWhere: any = { status: 'ACTIVE' };
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
    const body = await req.json();
    const { records, date, sectionId } = body; // records: Array of { studentId, status, remarks }

    const inst = await db.institution.findFirst();
    const session = await db.academicSession.findFirst({ where: { isCurrent: true } });

    if (!inst || !session) {
      return NextResponse.json({ success: false, error: 'Session/Institution not found' }, { status: 400 });
    }

    const attendanceDate = date || new Date().toISOString().split('T')[0];
    const results = [];

    for (const rec of records) {
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
          institutionId: inst.id,
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
