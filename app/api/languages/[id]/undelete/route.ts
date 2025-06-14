import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const langId = Number(id);
  if (isNaN(langId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  try {
    const restored = await prisma.language.update({
      where: { id: langId },
      data: { deleted: false },
    });

    return NextResponse.json({ message: 'Khôi phục thành công', data: restored });
  } catch (error) {
    return NextResponse.json({ error: 'Khôi phục thất bại' }, { status: 500 });
  }
}
