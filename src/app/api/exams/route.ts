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
      return NextResponse.json({ success: true, exams: [], studentResultCard: null });
    }

    const examId = searchParams.get('examId') || '';
    let studentId = searchParams.get('studentId') || '';

    // If student logged in, lock to own studentId
    if (auth.role === 'STUDENT' && auth.user?.id) {
      const studentRec = await db.student.findFirst({ where: { userId: auth.user.id } });
      if (studentRec) studentId = studentRec.id;
    }

    const exams = await db.exam.findMany({
      where: { institutionId },
      include: {
        session: true,
        schedules: { include: { class: true, subject: true, marks: { include: { student: true } } } },
        results: { include: { student: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    let studentResultCard = null;
    if (studentId && examId) {
      const result = await db.result.findUnique({
        where: { examId_studentId: { examId, studentId } },
        include: { exam: true, student: { include: { class: true, section: true } } },
      });

      const marks = await db.mark.findMany({
        where: {
          studentId,
          examSchedule: { examId },
        },
        include: {
          examSchedule: { include: { subject: true } },
        },
      });

      studentResultCard = { result, marks };
    }

    return NextResponse.json({ success: true, exams, studentResultCard, institutionId });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch exams data' }, { status: 500 });
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

    const session = await db.academicSession.findFirst({
      where: { institutionId, isCurrent: true },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: 'Active academic session not found' }, { status: 400 });
    }

    if (body.action === 'CREATE_EXAM') {
      const exam = await db.exam.create({
        data: {
          institutionId,
          sessionId: session.id,
          name: body.name,
          type: body.type || 'MID_TERM',
          startDate: body.startDate,
          endDate: body.endDate,
        },
      });

      await recordAuditLog({
        institutionId,
        userId: auth.user?.id,
        userName: auth.user?.name,
        userRole: auth.role,
        action: 'CREATE',
        module: 'EXAMS',
        description: `Created exam term: ${exam.name} (${exam.type}).`,
        req,
      });

      return NextResponse.json({ success: true, exam });
    }

    if (body.action === 'CREATE_SCHEDULE') {
      const schedule = await db.examSchedule.create({
        data: {
          examId: body.examId,
          classId: body.classId,
          subjectId: body.subjectId,
          examDate: body.examDate,
          startTime: body.startTime || '09:00',
          durationMinutes: parseInt(body.durationMinutes || 120),
          totalMarks: parseFloat(body.totalMarks || 100),
          passingMarks: parseFloat(body.passingMarks || 40),
          room: body.room || 'Main Hall',
        },
      });
      return NextResponse.json({ success: true, schedule });
    }

    if (body.action === 'ENTRY_MARKS') {
      const marksObtained = parseFloat(body.marksObtained);
      const totalMarks = parseFloat(body.totalMarks || 100);
      const percentage = (marksObtained / totalMarks) * 100;

      let grade = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C';
      else if (percentage >= 50) grade = 'D';

      const isAbsent = Boolean(body.isAbsent);

      const mark = await db.mark.upsert({
        where: {
          examScheduleId_studentId: {
            examScheduleId: body.examScheduleId,
            studentId: body.studentId,
          },
        },
        update: {
          marksObtained,
          grade,
          remarks: body.remarks || null,
          isAbsent,
        },
        create: {
          examScheduleId: body.examScheduleId,
          studentId: body.studentId,
          marksObtained,
          grade,
          remarks: body.remarks || null,
          isAbsent,
        },
      });

      // Recalculate student overall Result for this exam
      const schedule = await db.examSchedule.findUnique({ where: { id: body.examScheduleId } });
      if (schedule) {
        const allMarks = await db.mark.findMany({
          where: {
            studentId: body.studentId,
            examSchedule: { examId: schedule.examId },
          },
          include: { examSchedule: true },
        });

        const tot = allMarks.reduce((acc, m) => acc + m.examSchedule.totalMarks, 0);
        const obt = allMarks.reduce((acc, m) => acc + m.marksObtained, 0);
        const overallPct = tot > 0 ? (obt / tot) * 100 : 0;

        let overallGrade = 'F';
        if (overallPct >= 90) overallGrade = 'A+';
        else if (overallPct >= 80) overallGrade = 'A';
        else if (overallPct >= 70) overallGrade = 'B';
        else if (overallPct >= 60) overallGrade = 'C';
        else if (overallPct >= 50) overallGrade = 'D';

        await db.result.upsert({
          where: {
            examId_studentId: {
              examId: schedule.examId,
              studentId: body.studentId,
            },
          },
          update: {
            totalMarks: tot,
            obtainedMarks: obt,
            percentage: overallPct,
            grade: overallGrade,
            status: overallPct >= 40 ? 'PASS' : 'FAIL',
          },
          create: {
            examId: schedule.examId,
            studentId: body.studentId,
            totalMarks: tot,
            obtainedMarks: obt,
            percentage: overallPct,
            grade: overallGrade,
            status: overallPct >= 40 ? 'PASS' : 'FAIL',
          },
        });
      }

      await recordAuditLog({
        institutionId,
        userId: auth.user?.id,
        userName: auth.user?.name,
        userRole: auth.role,
        action: 'UPDATE',
        module: 'EXAMS',
        description: `Entered marks for student in exam schedule ${body.examScheduleId}: ${marksObtained}/${totalMarks} (${grade}).`,
        req,
      });

      return NextResponse.json({ success: true, mark });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('API POST /exams error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed exam operation' }, { status: 500 });
  }
}
