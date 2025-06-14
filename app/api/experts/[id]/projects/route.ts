import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params; // ← fix ở đây
  const expertId = Number(id);

  if (isNaN(expertId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  const projects = await prisma.project.findMany({
    where: { expertId, deleted: false },
    orderBy: { startYear: 'desc' },
  });

  return NextResponse.json(projects);
}
