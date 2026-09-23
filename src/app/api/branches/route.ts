import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthContext, requireAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);

    // If authenticated as tenant admin/user, filter by their institutionId
    // If not authenticated (demo mode fallback), get branches of the first active institution
    let institutionId = auth.institutionId;
    if (!institutionId) {
      const firstInst = await db.institution.findFirst({ where: { status: 'ACTIVE' } });
      institutionId = firstInst?.id || null;
    }

    if (!institutionId) {
      return NextResponse.json({ success: true, branches: [] });
    }

    const branches = await db.branch.findMany({
      where: { institutionId },
      include: {
        _count: {
          select: { students: true, teachers: true, staff: true },
        },
      },
      orderBy: [{ isMain: 'desc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json({ success: true, branches });
  } catch (error: any) {
    console.error('API GET /branches error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch branches' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { auth, response } = await requireAuth(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN']);
    if (response) return response;

    const body = await req.json();
    const institutionId = auth.isSuperAdmin ? body.institutionId || auth.institutionId : auth.institutionId;

    if (!institutionId) {
      return NextResponse.json({ success: false, error: 'Institution not found' }, { status: 400 });
    }

    const { name, code, address, city, phone, isMain = false } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Branch name is required' }, { status: 400 });
    }

    // Generate branch code if not provided
    const count = await db.branch.count({ where: { institutionId } });
    const branchCode = code || `CAMPUS-${(count + 1).toString().padStart(2, '0')}`;

    const branch = await db.branch.create({
      data: {
        institutionId,
        name,
        code: branchCode,
        address: address || null,
        city: city || null,
        phone: phone || null,
        isMain: Boolean(isMain),
        status: 'ACTIVE',
      },
    });

    await recordAuditLog({
      institutionId,
      userId: auth.user?.id,
      userName: auth.user?.name,
      userRole: auth.role,
      action: 'CREATE',
      module: 'BRANCHES',
      description: `Created new branch / campus: ${name} (${branchCode}).`,
      req,
    });

    return NextResponse.json({ success: true, branch });
  } catch (error: any) {
    console.error('API POST /branches error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create branch' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { auth, response } = await requireAuth(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN']);
    if (response) return response;

    const body = await req.json();
    const { id, name, address, city, phone, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Branch ID is required' }, { status: 400 });
    }

    const existing = await db.branch.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Branch not found' }, { status: 404 });
    }

    // Verify tenant ownership
    if (!auth.isSuperAdmin && existing.institutionId !== auth.institutionId) {
      return NextResponse.json({ success: false, error: 'Unauthorized for this branch' }, { status: 403 });
    }

    const updated = await db.branch.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        address: address ?? existing.address,
        city: city ?? existing.city,
        phone: phone ?? existing.phone,
        status: status ?? existing.status,
      },
    });

    await recordAuditLog({
      institutionId: existing.institutionId,
      userId: auth.user?.id,
      userName: auth.user?.name,
      userRole: auth.role,
      action: 'UPDATE',
      module: 'BRANCHES',
      description: `Updated branch: ${updated.name} (Status: ${updated.status}).`,
      req,
    });

    return NextResponse.json({ success: true, branch: updated });
  } catch (error: any) {
    console.error('API PUT /branches error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update branch' }, { status: 500 });
  }
}
