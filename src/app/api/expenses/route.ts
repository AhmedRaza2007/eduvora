import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || '';

    const where: any = {};
    if (category) where.category = category;

    const expenses = await db.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    return NextResponse.json({ success: true, expenses, totalExpense });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inst = await db.institution.findFirst();

    if (!inst) {
      return NextResponse.json({ success: false, error: 'Institution not found' }, { status: 400 });
    }

    const count = await db.expense.count();
    const expenseNo = `EXP-2026-${(count + 1).toString().padStart(3, '0')}`;

    const expense = await db.expense.create({
      data: {
        institutionId: inst.id,
        expenseNo,
        title: body.title,
        category: body.category || 'OTHER',
        amount: parseFloat(body.amount),
        date: body.date || new Date().toISOString().split('T')[0],
        paymentMethod: body.paymentMethod || 'CASH',
        description: body.description || '',
        receiptUrl: body.receiptUrl || null,
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to add expense' }, { status: 500 });
  }
}
