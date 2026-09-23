import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { auth, response } = await requireAuth(req, ['SUPER_ADMIN']);
    if (response) return response;

    const [
      totalInstitutions,
      activeInstitutions,
      totalStudents,
      totalTeachers,
      totalBranches,
      revenueAgg,
      recentInstitutions,
      recentActivity,
    ] = await Promise.all([
      db.institution.count(),
      db.institution.count({ where: { status: 'ACTIVE' } }),
      db.student.count({ where: { status: 'ACTIVE' } }),
      db.teacher.count({ where: { status: 'ACTIVE' } }),
      db.branch.count(),
      db.payment.aggregate({ _sum: { amountPaid: true } }),
      db.institution.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { students: true, teachers: true, branches: true } },
          users: { where: { role: 'ADMIN' }, take: 1 },
        },
      }),
      db.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalRevenue = revenueAgg._sum.amountPaid || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalInstitutions,
        activeInstitutions,
        totalStudents,
        totalTeachers,
        totalBranches,
        totalRevenue,
        platformGrowth: '+18.4%',
      },
      recentInstitutions,
      recentActivity,
    });
  } catch (error: any) {
    console.error('API GET /super-admin/stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Super Admin platform statistics' },
      { status: 500 }
    );
  }
}
