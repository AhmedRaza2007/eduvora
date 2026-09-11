import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const studentId = searchParams.get('studentId') || '';

    const where: any = {};
    if (status) where.status = status;
    if (studentId) where.studentId = studentId;

    const [invoices, feeTypes, payments] = await Promise.all([
      db.feeInvoice.findMany({
        where,
        include: {
          student: { include: { class: true, section: true } },
          feeType: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.feeType.findMany(),
      db.payment.findMany({
        take: 30,
        orderBy: { createdAt: 'desc' },
        include: { invoice: { include: { student: true, feeType: true } } },
      }),
    ]);

    return NextResponse.json({ success: true, invoices, feeTypes, payments });
  } catch (error) {
    console.error('API GET /fees error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch fees data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inst = await db.institution.findFirst();
    const session = await db.academicSession.findFirst({ where: { isCurrent: true } });

    if (!inst || !session) {
      return NextResponse.json({ success: false, error: 'Session/Institution not found' }, { status: 400 });
    }

    if (body.action === 'CREATE_INVOICE') {
      let invoiceNo = body.invoiceNo;
      if (!invoiceNo) {
        const count = await db.feeInvoice.count();
        const year = new Date().getFullYear();
        let counter = count + 1;
        invoiceNo = `INV-${year}-${counter.toString().padStart(3, '0')}`;
        let existing = await db.feeInvoice.findUnique({ where: { invoiceNo } });
        while (existing) {
          counter++;
          invoiceNo = `INV-${year}-${counter.toString().padStart(3, '0')}`;
          existing = await db.feeInvoice.findUnique({ where: { invoiceNo } });
        }
      }

      const invoice = await db.feeInvoice.create({
        data: {
          invoiceNo,
          institutionId: inst.id,
          studentId: body.studentId,
          feeTypeId: body.feeTypeId,
          title: body.title,
          amount: parseFloat(body.amount),
          dueDate: body.dueDate,
          sessionId: session.id,
          status: 'UNPAID',
        },
        include: { student: true, feeType: true },
      });
      return NextResponse.json({ success: true, invoice });
    }

    if (body.action === 'COLLECT_PAYMENT') {
      const invoice = await db.feeInvoice.findUnique({
        where: { id: body.invoiceId },
      });

      if (!invoice) {
        return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
      }

      const amountPaidNow = parseFloat(body.amountPaid);
      const newPaidAmount = invoice.paidAmount + amountPaidNow;

      let newStatus = 'PARTIAL';
      if (newPaidAmount >= invoice.amount) {
        newStatus = 'PAID';
      }

      const pCount = await db.payment.count();
      const receiptNo = `RCP-2026-${(pCount + 8800 + 1).toString()}`;

      const payment = await db.payment.create({
        data: {
          institutionId: inst.id,
          invoiceId: invoice.id,
          receiptNo,
          amountPaid: amountPaidNow,
          paymentDate: body.paymentDate || new Date().toISOString().split('T')[0],
          paymentMethod: body.paymentMethod || 'CASH',
          transactionRef: body.transactionRef || null,
        },
      });

      const updatedInvoice = await db.feeInvoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
        },
        include: { student: true, feeType: true, payments: true },
      });

      return NextResponse.json({ success: true, payment, invoice: updatedInvoice });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('API POST /fees error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed fee operation' }, { status: 500 });
  }
}
