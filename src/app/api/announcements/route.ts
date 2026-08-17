import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const announcements = await db.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, announcements });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inst = await db.institution.findFirst();

    if (!inst) {
      return NextResponse.json({ success: false, error: 'Institution not found' }, { status: 400 });
    }

    const announcement = await db.announcement.create({
      data: {
        institutionId: inst.id,
        title: body.title,
        content: body.content,
        targetAudience: body.targetAudience || 'ALL',
        targetClassId: body.targetClassId || null,
        priority: body.priority || 'NORMAL',
      },
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create announcement' }, { status: 500 });
  }
}
