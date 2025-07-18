import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const expertId = searchParams.get('id');

  if (!expertId) {
    return NextResponse.json({ error: 'Thiếu expertId' }, { status: 400 });
  }

  try {
    const publications = await prisma.publication.findMany({
      where: {
        expertId: Number(expertId),
        deleted: false,
      },
      select: {
        id: true,
        title: true,
        year: true,
        place: true,
        type: true,
        author: true,
      },
      orderBy: {
        year: 'asc',
      },
    });

    return NextResponse.json(publications, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';