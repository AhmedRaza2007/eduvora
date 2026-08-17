import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'FINANCIAL';
    const classId = searchParams.get('classId') || '';

    if (type === 'FINANCIAL') {
      const [payments, expenses, salaries] = await Promise.all([
        db.payment.findMany({
          include: { invoice: { include: { student: true } } },
          orderBy: { createdAt: 'desc' },
        }),
        db.expense.findMany({ orderBy: { date: 'desc' } }),
        db.salary.findMany({ include: { teacher: true, staff: true }, orderBy: { createdAt: 'desc' } }),
      ]);

      const totalRevenue = payments.reduce((acc, p) => acc + p.amountPaid, 0);
      const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
      const totalSalaries = salaries.reduce((acc, s) => acc + s.netSalary, 0);
      const netProfit = totalRevenue - totalExpenses - totalSalaries;

      return NextResponse.json({
        success: true,
        type: 'FINANCIAL',
        summary: { totalRevenue, totalExpenses, totalSalaries, netProfit },
        payments,
        expenses,
        salaries,
      });
    }

    if (type === 'ATTENDANCE') {
      const attendances = await db.attendance.findMany({
        take: 100,
        include: { student: { include: { class: true, section: true } } },
        orderBy: { date: 'desc' },
      });

      const total = attendances.length;
      const present = attendances.filter((a) => a.status === 'PRESENT').length;
      const absent = attendances.filter((a) => a.status === 'ABSENT').length;
      const leave = attendances.filter((a) => a.status === 'LEAVE').length;
      const late = attendances.filter((a) => a.status === 'LATE').length;

      return NextResponse.json({
        success: true,
        type: 'ATTENDANCE',
        summary: { total, present, absent, leave, late },
        attendances,
      });
    }

    if (type === 'STUDENTS') {
      const where: any = {};
      if (classId) where.classId = classId;

      const students = await db.student.findMany({
        where,
        include: { class: true, section: true, parent: true },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        success: true,
        type: 'STUDENTS',
        total: students.length,
        students,
      });
    }

    if (type === 'RESULTS') {
      const results = await db.result.findMany({
        include: { exam: true, student: { include: { class: true } } },
        orderBy: { percentage: 'desc' },
      });

      const passed = results.filter((r) => r.status === 'PASS').length;
      const failed = results.filter((r) => r.status === 'FAIL').length;

      return NextResponse.json({
        success: true,
        type: 'RESULTS',
        summary: { total: results.length, passed, failed },
        results,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown report type' }, { status: 400 });
  } catch (error) {
    console.error('API GET /reports error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate report' }, { status: 500 });
  }
}
