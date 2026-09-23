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
      return NextResponse.json({ success: true, expenses: [], totalExpense: 0 });
    }

    const category = searchParams.get('category') || '';
    const where: any = { institutionId };
    if (category) where.category = category;

    const expenses = await db.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    return NextResponse.json({ success: true, expenses, totalExpense, institutionId });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch expenses' }, { status: 500 });
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

    const count = await db.expense.count({ where: { institutionId } });
    const year = new Date().getFullYear();
    const expenseNo = body.expenseNo || `EXP-${year}-${(count + 1).toString().padStart(4, '0')}`;

    const expense = await db.expense.create({
      data: {
        institutionId,
        expenseNo,
        title: body.title,
        category: body.category || 'OTHER',
        amount: parseFloat(body.amount),
        date: body.date || new Date().toISOString().split('T')[0],
        paymentMethod: body.paymentMethod || 'CASH',
        description: body.description || '',
        receiptUrl: body.receiptUrl || null,
        addedById: auth.user?.id || null,
      },
    });

    await recordAuditLog({
      institutionId,
      userId: auth.user?.id,
      userName: auth.user?.name,
      userRole: auth.role,
      action: 'CREATE',
      module: 'FINANCE',
      description: `Created expense ${expense.title} (Category: ${expense.category}) for PKR ${expense.amount}.`,
      req,
    });

    return NextResponse.json({ success: true, expense });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to add expense' }, { status: 500 });
  }
}
