import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthContext, requireAuth, hashPassword } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { auth, response } = await requireAuth(req, ['SUPER_ADMIN', 'ADMIN', 'OWNER']);
    if (response) return response;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const roleFilter = searchParams.get('role') || '';
    const statusFilter = searchParams.get('status') || '';
    const requestedInstId = searchParams.get('institutionId') || '';

    let institutionId = auth.institutionId;
    if (auth.isSuperAdmin) {
      institutionId = requestedInstId || null;
    }

    const where: any = {};

    if (institutionId) {
      where.institutionId = institutionId;
    }

    if (roleFilter) {
      where.role = roleFilter;
    }

    if (statusFilter) {
      where.status = statusFilter;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { cnic: { contains: search } },
      ];
    }

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        cnic: true,
        avatar: true,
        lastLoginAt: true,
        createdAt: true,
        institutionId: true,
        branchId: true,
        institution: {
          select: {
            id: true,
            name: true,
            type: true,
            currency: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
            isMain: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error('API GET /users error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { auth, response } = await requireAuth(req, ['SUPER_ADMIN', 'ADMIN', 'OWNER']);
    if (response) return response;

    const body = await req.json();
    const {
      name,
      email,
      password,
      role = 'TEACHER',
      institutionId: bodyInstId,
      branchId,
      status = 'ACTIVE',
      phone,
      cnic,
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    // Role privilege escalation guard: Only SUPER_ADMIN can create a SUPER_ADMIN
    if (role === 'SUPER_ADMIN' && !auth.isSuperAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only a Super Admin can create Super Admin accounts.' },
        { status: 403 }
      );
    }

    // Tenant boundary: Non-super admins can only create users in their own institution
    let targetInstId: string | null = null;
    if (role !== 'SUPER_ADMIN') {
      if (auth.isSuperAdmin) {
        targetInstId = bodyInstId || null;
        if (!targetInstId) {
          const firstInst = await db.institution.findFirst({ where: { status: 'ACTIVE' } });
          targetInstId = firstInst?.id || null;
        }
      } else {
        targetInstId = auth.institutionId;
      }

      if (!targetInstId) {
        return NextResponse.json(
          { success: false, error: 'Target institution could not be determined.' },
          { status: 400 }
        );
      }
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check existing email
    const existing = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A user account with this email already exists.' },
        { status: 409 }
      );
    }

    const hashedPassword = hashPassword(password);

    const newUser = await db.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: role.toUpperCase().trim(),
        institutionId: targetInstId,
        branchId: branchId || null,
        status: status.toUpperCase().trim(),
        phone: phone || null,
        cnic: cnic || null,
      },
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
        institution: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // If role is TEACHER, create linked teacher profile if one doesn't exist
    if (role === 'TEACHER' && targetInstId) {
      const count = await db.teacher.count({ where: { institutionId: targetInstId } });
      const year = new Date().getFullYear();
      await db.teacher.create({
        data: {
          institutionId: targetInstId,
          branchId: branchId || null,
          userId: newUser.id,
          teacherId: `TCH-${year}-${(count + 1).toString().padStart(3, '0')}`,
          name: newUser.name,
          email: cleanEmail,
          phone: phone || null,
          status: status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
          qualification: 'Faculty Staff',
          salary: 45000,
          joiningDate: new Date().toISOString().split('T')[0],
        },
      });
    }

    await recordAuditLog({
      institutionId: targetInstId,
      userId: auth.user?.id,
      userName: auth.user?.name,
      userRole: auth.role,
      action: 'CREATE',
      module: 'USERS',
      description: `Created user account ${newUser.name} (${cleanEmail}) with role ${newUser.role}.`,
      req,
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error('API POST /users error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
