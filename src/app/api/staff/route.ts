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
      return NextResponse.json({ success: true, staff: [] });
    }

    const branchId = searchParams.get('branchId') || auth.branchId || '';
    const where: any = { institutionId };
    if (branchId && branchId !== 'all') {
      where.branchId = branchId;
    }

    const staff = await db.staff.findMany({
      where,
      include: { salaries: { take: 5, orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, staff, institutionId });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { auth, response } = await requireAuth(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN']);
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

    const count = await db.staff.count({ where: { institutionId } });
    const year = new Date().getFullYear();
    const staffId = body.staffId || `STF-${year}-${(count + 1).toString().padStart(3, '0')}`;

    // Optionally create user account for staff/accountant/receptionist
    let userId: string | null = null;
    if (body.email) {
      const existingUser = await db.user.findUnique({ where: { email: body.email.toLowerCase().trim() } });
      if (!existingUser) {
        const role = body.role?.toUpperCase().includes('ACCOUNT')
          ? 'ACCOUNTANT'
          : body.role?.toUpperCase().includes('RECEPT')
          ? 'RECEPTIONIST'
          : 'STAFF';

        const newUser = await db.user.create({
          data: {
            institutionId,
            branchId: body.branchId || auth.branchId || null,
            name: body.name,
            email: body.email.toLowerCase().trim(),
            password: body.password || 'password123',
            role,
            phone: body.phone || null,
            status: 'ACTIVE',
          },
        });
        userId = newUser.id;
      } else {
        userId = existingUser.id;
      }
    }

    const staffMember = await db.staff.create({
      data: {
        institutionId,
        branchId: body.branchId || auth.branchId || null,
        userId,
        staffId,
        name: body.name,
        role: body.role || 'Staff',
        email: body.email ? body.email.toLowerCase().trim() : null,
        phone: body.phone,
        address: body.address || '',
        joiningDate: body.joiningDate || new Date().toISOString().split('T')[0],
        salary: parseFloat(body.salary || 0),
        status: body.status || 'ACTIVE',
        photo: body.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      },
    });

    await recordAuditLog({
      institutionId,
      userId: auth.user?.id,
      userName: auth.user?.name,
      userRole: auth.role,
      action: 'CREATE',
      module: 'STAFF',
      description: `Created staff member ${staffMember.name} (${staffMember.staffId}, Role: ${staffMember.role}).`,
      req,
    });

    return NextResponse.json({ success: true, staff: staffMember });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to add staff member' }, { status: 500 });
  }
}
