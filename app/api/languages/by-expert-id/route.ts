import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const expertId = searchParams.get('id');

  if (!expertId) {
    return NextResponse.json({ error: 'Thiếu expertId' }, { status: 400 });
  }

  try {
    const languages = await prisma.language.findMany({
      where: {
        expertId: Number(expertId),
        deleted: false,
      },
      select: {
        id: true,
        language: true,
        listening: true,
        speaking: true,
        reading: true,
        writing: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json(languages, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';