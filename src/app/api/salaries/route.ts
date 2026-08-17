import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const salaries = await db.salary.findMany({
      include: {
        teacher: true,
        staff: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const teachers = await db.teacher.findMany({ where: { status: 'ACTIVE' } });
    const staffMembers = await db.staff.findMany({ where: { status: 'ACTIVE' } });

    return NextResponse.json({ success: true, salaries, teachers, staff: staffMembers });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch salaries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inst = await db.institution.findFirst();

    if (!inst) {
      return NextResponse.json({ success: false, error: 'Institution not found' }, { status: 400 });
    }

    const baseSalary = parseFloat(body.baseSalary || 0);
    const bonus = parseFloat(body.bonus || 0);
    const deduction = parseFloat(body.deduction || 0);
    const advance = parseFloat(body.advance || 0);

    // Prompt financial calculation rule: Net Salary = Base Salary + Bonus - Deduction - Advance
    const netSalary = baseSalary + bonus - deduction - advance;

    const count = await db.salary.count();
    const salarySlipNo = `SLIP-2026-${(count + 701).toString()}`;

    const salary = await db.salary.create({
      data: {
        institutionId: inst.id,
        staffType: body.staffType, // TEACHER or STAFF
        teacherId: body.teacherId || null,
        staffId: body.staffId || null,
        month: body.month || 'August',
        year: parseInt(body.year || 2026),
        baseSalary,
        bonus,
        deduction,
        advance,
        netSalary,
        status: body.status || 'PAID',
        paidDate: body.status === 'PAID' ? new Date().toISOString().split('T')[0] : null,
        paymentMethod: body.paymentMethod || 'BANK_TRANSFER',
        salarySlipNo,
      },
      include: { teacher: true, staff: true },
    });

    return NextResponse.json({ success: true, salary });
  } catch (error: any) {
    console.error('API POST /salaries error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to process salary' }, { status: 500 });
  }
}
