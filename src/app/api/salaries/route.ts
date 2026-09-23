import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthContext, requireAuth } from '@/lib/auth';
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
      return NextResponse.json({ success: true, salaries: [], teachers: [], staff: [] });
    }

    const where: any = { institutionId };

    // Scoping for teachers and staff members
    if (auth.role === 'TEACHER' && auth.user?.id) {
      const teacherRec = await db.teacher.findFirst({ where: { userId: auth.user.id } });
      if (teacherRec) where.teacherId = teacherRec.id;
    } else if (auth.role === 'STAFF' && auth.user?.id) {
      const staffRec = await db.staff.findFirst({ where: { userId: auth.user.id } });
      if (staffRec) where.staffId = staffRec.id;
    }

    const [salaries, teachers, staffMembers] = await Promise.all([
      db.salary.findMany({
        where,
        include: {
          teacher: true,
          staff: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.teacher.findMany({ where: { institutionId, status: 'ACTIVE' } }),
      db.staff.findMany({ where: { institutionId, status: 'ACTIVE' } }),
    ]);

    return NextResponse.json({ success: true, salaries, teachers, staff: staffMembers, institutionId });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch salaries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { auth, response } = await requireAuth(req, ['ADMIN', 'OWNER', 'ACCOUNTANT', 'SUPER_ADMIN']);
    if (response) return response;

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

    const baseSalary = parseFloat(body.baseSalary || 0);
    const bonus = parseFloat(body.bonus || 0);
    const deduction = parseFloat(body.deduction || 0);
    const advance = parseFloat(body.advance || 0);

    // Formula: Net Salary = Base Salary + Bonus - Deduction - Advance
    const netSalary = baseSalary + bonus - deduction - advance;

    const count = await db.salary.count({ where: { institutionId } });
    const year = parseInt(body.year || new Date().getFullYear());
    const salarySlipNo = body.salarySlipNo || `SLIP-${year}-${(count + 1001).toString()}`;

    const salary = await db.salary.create({
      data: {
        institutionId,
        staffType: body.staffType, // TEACHER or STAFF
        teacherId: body.teacherId || null,
        staffId: body.staffId || null,
        month: body.month || 'August',
        year,
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

    await recordAuditLog({
      institutionId,
      userId: auth.user?.id,
      userName: auth.user?.name,
      userRole: auth.role,
      action: 'PAYMENT',
      module: 'FINANCE',
      description: `Disbursed salary slip ${salarySlipNo} (Net Salary: PKR ${netSalary}) to ${body.staffType}.`,
      req,
    });

    return NextResponse.json({ success: true, salary });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to process salary' }, { status: 500 });
  }
}
