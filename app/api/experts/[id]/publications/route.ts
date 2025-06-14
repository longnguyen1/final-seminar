// app/api/experts/[id]/publications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params; // ✅ Sửa ở đây
  const expertId = Number(id);

  if (isNaN(expertId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  const publications = await prisma.publication.findMany({
    where: { expertId, deleted: false },
    orderBy: { year: 'desc' },
  });

  return NextResponse.json(publications);
}
