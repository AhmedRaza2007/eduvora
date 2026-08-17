import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType') || '';
    const entityId = searchParams.get('entityId') || '';

    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const documents = await db.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, documents });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inst = await db.institution.findFirst();

    if (!inst) {
      return NextResponse.json({ success: false, error: 'Institution not found' }, { status: 400 });
    }

    const doc = await db.document.create({
      data: {
        institutionId: inst.id,
        entityType: body.entityType || 'STUDENT',
        entityId: body.entityId,
        title: body.title,
        category: body.category || 'CERTIFICATE',
        fileUrl: body.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: body.fileSize || '1.5 MB',
        fileType: body.fileType || 'pdf',
      },
    });

    return NextResponse.json({ success: true, document: doc });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to record document' }, { status: 500 });
  }
}
