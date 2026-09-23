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
      return NextResponse.json({ success: true, teachers: [] });
    }

    const branchId = searchParams.get('branchId') || auth.branchId || '';
    const where: any = { institutionId };
    if (branchId && branchId !== 'all') {
      where.branchId = branchId;
    }

    const teachers = await db.teacher.findMany({
      where,
      include: {
        classesTaught: true,
        classSubjects: { include: { class: true, subject: true } },
        salaries: { take: 5, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, teachers, institutionId });
  } catch (error) {
    console.error('API GET /teachers error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch teachers' }, { status: 500 });
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

    const count = await db.teacher.count({ where: { institutionId } });
    const year = new Date().getFullYear();
    const teacherId = body.teacherId || `TCH-${year}-${(count + 1).toString().padStart(3, '0')}`;

    // Optionally create user account for teacher
    let userId: string | null = null;
    if (body.email) {
      const existingUser = await db.user.findUnique({ where: { email: body.email.toLowerCase().trim() } });
      if (!existingUser) {
        const newUser = await db.user.create({
          data: {
            institutionId,
            branchId: body.branchId || auth.branchId || null,
            name: body.name,
            email: body.email.toLowerCase().trim(),
            password: body.password || 'password123',
            role: 'TEACHER',
            phone: body.phone || null,
            status: 'ACTIVE',
          },
        });
        userId = newUser.id;
      } else {
        userId = existingUser.id;
      }
    }

    const teacher = await db.teacher.create({
      data: {
        institutionId,
        branchId: body.branchId || auth.branchId || null,
        userId,
        teacherId,
        name: body.name,
        email: body.email.toLowerCase().trim(),
        phone: body.phone,
        address: body.address || '',
        qualification: body.qualification || 'Master Degree',
        joiningDate: body.joiningDate || new Date().toISOString().split('T')[0],
        salary: parseFloat(body.salary || 0),
        status: body.status || 'ACTIVE',
        photo: body.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
      },
    });

    await recordAuditLog({
      institutionId,
      userId: auth.user?.id,
      userName: auth.user?.name,
      userRole: auth.role,
      action: 'CREATE',
      module: 'STAFF',
      description: `Created teacher ${teacher.name} (${teacher.teacherId}).`,
      req,
    });

    return NextResponse.json({ success: true, teacher });
  } catch (error: any) {
    console.error('API POST /teachers error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create teacher' }, { status: 500 });
  }
}
