import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { auth, response } = await requireAuth(req, ['SUPER_ADMIN']);
    if (response) return response;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (type) where.type = type;
    if (status) where.status = status;

    const institutions = await db.institution.findMany({
      where,
      include: {
        _count: { select: { students: true, teachers: true, staff: true, branches: true } },
        branches: { take: 5 },
        users: { where: { role: { in: ['ADMIN', 'OWNER'] } }, take: 2 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, institutions });
  } catch (error: any) {
    console.error('API GET /super-admin/institutions error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch institutions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { auth, response } = await requireAuth(req, ['SUPER_ADMIN']);
    if (response) return response;

    const body = await req.json();

    const {
      name,
      type,
      logo,
      email,
      phone,
      address,
      city,
      province,
      country = 'Pakistan',
      currency = 'PKR',
      academicSession = '2026-2027',
      adminName,
      adminEmail,
      adminPhone,
      adminPassword = 'password123',
      subscriptionPlan = 'FREE',
    } = body;

    if (!name || !email || !adminEmail || !adminName) {
      return NextResponse.json(
        { success: false, error: 'Institution Name, Email, Admin Name, and Admin Email are required.' },
        { status: 400 }
      );
    }

    // Generate unique code based on name and count
    const count = await db.institution.count();
    const cleanCode = name
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 6)
      .toUpperCase();
    const code = `${cleanCode}-${(count + 1).toString().padStart(3, '0')}`;

    // 1. Create Institution
    const institution = await db.institution.create({
      data: {
        name,
        type: type || 'School',
        code,
        logo: logo || null,
        email,
        phone: phone || null,
        address: address || null,
        city: city || null,
        province: province || null,
        country: country || 'Pakistan',
        currency: currency || 'PKR',
        subscriptionPlan: subscriptionPlan || 'FREE',
        subscriptionStatus: 'ACTIVE',
        status: 'ACTIVE',
      },
    });

    // 2. Create Default Main Branch
    const mainBranch = await db.branch.create({
      data: {
        institutionId: institution.id,
        name: 'Main Campus',
        code: `${code}-CAMPUS-01`,
        address: address || null,
        city: city || null,
        phone: phone || null,
        isMain: true,
        status: 'ACTIVE',
      },
    });

    // 3. Create Initial Admin User
    const adminUser = await db.user.create({
      data: {
        institutionId: institution.id,
        branchId: mainBranch.id,
        name: adminName,
        email: adminEmail.toLowerCase().trim(),
        phone: adminPhone || null,
        password: adminPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    // 4. Create Default Academic Session
    const currentYear = new Date().getFullYear();
    await db.academicSession.create({
      data: {
        institutionId: institution.id,
        name: academicSession || `${currentYear}-${currentYear + 1}`,
        startDate: `${currentYear}-08-01`,
        endDate: `${currentYear + 1}-06-30`,
        isCurrent: true,
        status: 'ACTIVE',
      },
    });

    // 5. Create Default Fee Types
    await db.feeType.createMany({
      data: [
        { institutionId: institution.id, name: 'Tuition Fee', description: 'Monthly tuition fee' },
        { institutionId: institution.id, name: 'Admission Fee', description: 'One-time admission registration fee' },
        { institutionId: institution.id, name: 'Examination Fee', description: 'Mid-term and final examination fee' },
        { institutionId: institution.id, name: 'Transport Fee', description: 'Monthly institutional transport fee' },
      ],
    });

    // 6. Record Audit Log
    await recordAuditLog({
      institutionId: institution.id,
      userId: auth.user?.id,
      userName: auth.user?.name,
      userRole: auth.role,
      action: 'CREATE',
      module: 'INSTITUTION',
      description: `Super Admin created new institution: ${name} (${code}) with admin ${adminName} (${adminEmail}).`,
      req,
    });

    return NextResponse.json({
      success: true,
      institution,
      branch: mainBranch,
      admin: { id: adminUser.id, name: adminUser.name, email: adminUser.email },
    });
  } catch (error: any) {
    console.error('API POST /super-admin/institutions error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create institution' },
      { status: 500 }
    );
  }
}
