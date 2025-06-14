// app/api/publications/[id]/undelete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const pubId = Number(id);
  if (isNaN(pubId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  try {
    const restored = await prisma.publication.update({
      where: { id: pubId },
      data: { deleted: false },
    });
    return NextResponse.json({ message: 'Khôi phục thành công', data: restored });
  } catch (e) {
    return NextResponse.json({ error: 'Khôi phục thất bại' }, { status: 500 });
  }
}
