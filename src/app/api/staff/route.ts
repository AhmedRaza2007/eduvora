import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const staff = await db.staff.findMany({
      include: { salaries: { take: 5, orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, staff });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inst = await db.institution.findFirst();

    if (!inst) {
      return NextResponse.json({ success: false, error: 'Institution not found' }, { status: 400 });
    }

    const count = await db.staff.count();
    const staffId = `STF-2026-${(count + 1).toString().padStart(3, '0')}`;

    const staffMember = await db.staff.create({
      data: {
        institutionId: inst.id,
        staffId,
        name: body.name,
        role: body.role || 'Staff',
        email: body.email || null,
        phone: body.phone,
        address: body.address || '',
        joiningDate: body.joiningDate || new Date().toISOString().split('T')[0],
        salary: parseFloat(body.salary || 0),
        status: body.status || 'ACTIVE',
        photo: body.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      },
    });

    return NextResponse.json({ success: true, staff: staffMember });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to add staff member' }, { status: 500 });
  }
}
