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
      return NextResponse.json({ success: true, announcements: [] });
    }

    const announcements = await db.announcement.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, announcements, institutionId });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { auth, response } = await requireAuth(req, ['ADMIN', 'OWNER', 'TEACHER', 'SUPER_ADMIN']);
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

    const announcement = await db.announcement.create({
      data: {
        institutionId,
        title: body.title,
        content: body.content,
        targetAudience: body.targetAudience || 'ALL',
        targetClassId: body.targetClassId || null,
        priority: body.priority || 'NORMAL',
        createdById: auth.user?.id || null,
      },
    });

    await recordAuditLog({
      institutionId,
      userId: auth.user?.id,
      userName: auth.user?.name,
      userRole: auth.role,
      action: 'CREATE',
      module: 'ANNOUNCEMENTS',
      description: `Posted announcement: "${announcement.title}" (Audience: ${announcement.targetAudience}).`,
      req,
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create announcement' }, { status: 500 });
  }
}
