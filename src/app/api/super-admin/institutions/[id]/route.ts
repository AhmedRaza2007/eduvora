import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, response } = await requireAuth(req, ['SUPER_ADMIN']);
    if (response) return response;

    const { id } = await context.params;

    const institution = await db.institution.findUnique({
      where: { id },
      include: {
        branches: true,
        users: { take: 20 },
        sessions: true,
        _count: {
          select: {
            students: true,
            teachers: true,
            staff: true,
            classes: true,
            feeInvoices: true,
          },
        },
      },
    });

    if (!institution) {
      return NextResponse.json({ success: false, error: 'Institution not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, institution });
  } catch (error: any) {
    console.error('API GET /super-admin/institutions/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch institution' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, response } = await requireAuth(req, ['SUPER_ADMIN']);
    if (response) return response;

    const { id } = await context.params;
    const body = await req.json();

    const existing = await db.institution.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Institution not found' }, { status: 404 });
    }

    const updated = await db.institution.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        type: body.type ?? existing.type,
        status: body.status ?? existing.status,
        subscriptionPlan: body.subscriptionPlan ?? existing.subscriptionPlan,
        subscriptionStatus: body.subscriptionStatus ?? existing.subscriptionStatus,
        phone: body.phone ?? existing.phone,
        email: body.email ?? existing.email,
        address: body.address ?? existing.address,
        city: body.city ?? existing.city,
        province: body.province ?? existing.province,
        country: body.country ?? existing.country,
        currency: body.currency ?? existing.currency,
        maxStudents: body.maxStudents ? parseInt(body.maxStudents) : existing.maxStudents,
        maxBranches: body.maxBranches ? parseInt(body.maxBranches) : existing.maxBranches,
      },
    });

    await recordAuditLog({
      institutionId: id,
      userId: auth.user?.id,
      userName: auth.user?.name,
      userRole: auth.role,
      action: 'UPDATE',
      module: 'INSTITUTION',
      description: `Super Admin updated institution ${updated.name} (Status: ${updated.status}, Plan: ${updated.subscriptionPlan}).`,
      req,
    });

    return NextResponse.json({ success: true, institution: updated });
  } catch (error: any) {
    console.error('API PUT /super-admin/institutions/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update institution' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, response } = await requireAuth(req, ['SUPER_ADMIN']);
    if (response) return response;

    const { id } = await context.params;

    // We archive or suspend rather than hard deleting to preserve audit history and data integrity
    const updated = await db.institution.update({
      where: { id },
      data: { status: 'SUSPENDED', subscriptionStatus: 'SUSPENDED' },
    });

    await recordAuditLog({
      institutionId: id,
      userId: auth.user?.id,
      userName: auth.user?.name,
      userRole: auth.role,
      action: 'STATUS_CHANGE',
      module: 'INSTITUTION',
      description: `Super Admin suspended institution ${updated.name}.`,
      req,
    });

    return NextResponse.json({ success: true, message: 'Institution suspended successfully' });
  } catch (error: any) {
    console.error('API DELETE /super-admin/institutions/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to suspend institution' }, { status: 500 });
  }
}
