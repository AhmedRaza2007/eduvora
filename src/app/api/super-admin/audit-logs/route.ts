import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { auth, response } = await requireAuth(req, ['SUPER_ADMIN']);
    if (response) return response;

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const moduleName = searchParams.get('module') || '';
    const action = searchParams.get('action') || '';

    const where: any = {};
    if (moduleName) where.module = moduleName;
    if (action) where.action = action;

    const logs = await db.auditLog.findMany({
      where,
      take: Math.min(limit, 100),
      orderBy: { createdAt: 'desc' },
      include: {
        institution: { select: { id: true, name: true, code: true } },
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error('API GET /super-admin/audit-logs error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
