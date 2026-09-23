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
      return NextResponse.json({ success: true, invoices: [], feeTypes: [], payments: [] });
    }

    const status = searchParams.get('status') || '';
    const studentId = searchParams.get('studentId') || '';

    const where: any = { institutionId };
    if (status) where.status = status;
    if (studentId) where.studentId = studentId;

    // Role-specific scoping:
    if (auth.role === 'STUDENT' && auth.user?.id) {
      const studentRec = await db.student.findFirst({ where: { userId: auth.user.id } });
      if (studentRec) where.studentId = studentRec.id;
    } else if (auth.role === 'PARENT' && auth.user?.id) {
      const parentRec = await db.parent.findFirst({ where: { userId: auth.user.id } });
      if (parentRec) {
        const childStudents = await db.student.findMany({
          where: { parentId: parentRec.id, institutionId },
          select: { id: true },
        });
        where.studentId = { in: childStudents.map((c) => c.id) };
      }
    }

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
      db.feeType.findMany({ where: { institutionId } }),
      db.payment.findMany({
        where: { institutionId },
        take: 30,
        orderBy: { createdAt: 'desc' },
        include: { invoice: { include: { student: true, feeType: true } } },
      }),
    ]);

    return NextResponse.json({ success: true, invoices, feeTypes, payments, institutionId });
  } catch (error) {
    console.error('API GET /fees error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch fees data' }, { status: 500 });
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
      return NextResponse.json({ success: false, error: 'Active session not found' }, { status: 400 });
    }

    if (body.action === 'CREATE_INVOICE') {
      // Verify student belongs to this institution
      const targetStudent = await db.student.findFirst({
        where: { id: body.studentId, institutionId },
      });

      if (!targetStudent) {
        return NextResponse.json(
          { success: false, error: 'Student does not belong to this institution' },
          { status: 400 }
        );
      }

      let invoiceNo = body.invoiceNo;
      if (!invoiceNo) {
        const count = await db.feeInvoice.count({ where: { institutionId } });
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
          institutionId,
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

      await recordAuditLog({
        institutionId,
        userId: auth.user?.id,
        userName: auth.user?.name,
        userRole: auth.role,
        action: 'CREATE',
        module: 'FEES',
        description: `Created fee invoice ${invoice.invoiceNo} (${invoice.title}) for amount PKR ${invoice.amount}.`,
        req,
      });

      return NextResponse.json({ success: true, invoice });
    }

    if (body.action === 'COLLECT_PAYMENT') {
      const invoice = await db.feeInvoice.findFirst({
        where: { id: body.invoiceId, institutionId },
      });

      if (!invoice) {
        return NextResponse.json({ success: false, error: 'Invoice not found in your institution' }, { status: 404 });
      }

      const amountPaidNow = parseFloat(body.amountPaid);
      const newPaidAmount = invoice.paidAmount + amountPaidNow;

      let newStatus = 'PARTIAL';
      if (newPaidAmount >= invoice.amount) {
        newStatus = 'PAID';
      }

      const pCount = await db.payment.count({ where: { institutionId } });
      const receiptNo = `RCP-${new Date().getFullYear()}-${(pCount + 1001).toString()}`;

      const payment = await db.payment.create({
        data: {
          institutionId,
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

      await recordAuditLog({
        institutionId,
        userId: auth.user?.id,
        userName: auth.user?.name,
        userRole: auth.role,
        action: 'PAYMENT',
        module: 'FEES',
        description: `Collected fee payment of PKR ${amountPaidNow} (Receipt: ${receiptNo}) via ${payment.paymentMethod}.`,
        req,
      });

      return NextResponse.json({ success: true, payment, invoice: updatedInvoice });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('API POST /fees error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed fee operation' }, { status: 500 });
  }
}
