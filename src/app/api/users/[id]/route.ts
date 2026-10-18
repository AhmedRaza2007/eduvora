import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, hashPassword } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, response } = await requireAuth(req, ['SUPER_ADMIN', 'ADMIN', 'OWNER']);
    if (response) return response;

    const { id } = await context.params;
    const body = await req.json();

    const targetUser = await db.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User account not found' },
        { status: 404 }
      );
    }

    // Tenant check
    if (!auth.isSuperAdmin && targetUser.institutionId !== auth.institutionId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot edit users outside your institution' },
        { status: 403 }
      );
    }

    // Role privilege escalation check
    if (body.role === 'SUPER_ADMIN' && !auth.isSuperAdmin) {
      return NextResponse.json(
        { success: false, error: 'Cannot elevate role to Super Admin' },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (body.name) updateData.name = body.name.trim();
    if (body.status) updateData.status = body.status.toUpperCase().trim();
    if (body.role) updateData.role = body.role.toUpperCase().trim();
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.cnic !== undefined) updateData.cnic = body.cnic;
    if (body.branchId !== undefined) updateData.branchId = body.branchId || null;
    if (body.password) {
      updateData.password = hashPassword(body.password);
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        cnic: true,
        institutionId: true,
        branchId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await recordAuditLog({
      institutionId: updatedUser.institutionId,
      userId: auth.user?.id,
      userName: auth.user?.name,
      userRole: auth.role,
      action: 'UPDATE',
      module: 'USERS',
      description: `Updated user account ${updatedUser.name} (${updatedUser.email}).`,
      req,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('API PATCH /users/[id] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, response } = await requireAuth(req, ['SUPER_ADMIN', 'ADMIN', 'OWNER']);
    if (response) return response;

    const { id } = await context.params;

    if (id === auth.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Self-deletion is prohibited for safety.' },
        { status: 400 }
      );
    }

    const targetUser = await db.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User account not found' },
        { status: 404 }
      );
    }

    if (!auth.isSuperAdmin && targetUser.institutionId !== auth.institutionId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot delete users outside your institution' },
        { status: 403 }
      );
    }

    await db.user.delete({
      where: { id },
    });

    await recordAuditLog({
      institutionId: targetUser.institutionId,
      userId: auth.user?.id,
      userName: auth.user?.name,
      userRole: auth.role,
      action: 'DELETE',
      module: 'USERS',
      description: `Deleted user account ${targetUser.name} (${targetUser.email}).`,
      req,
    });

    return NextResponse.json({ success: true, message: 'User removed successfully' });
  } catch (error: any) {
    console.error('API DELETE /users/[id] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
