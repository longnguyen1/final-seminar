// app/api/experts/[id]/educations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;           // ← await ở đây
  const expertId = Number(id);
  if (isNaN(expertId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }
  const educations = await prisma.education.findMany({
    where: { expertId, deleted: false },
    orderBy: { year: 'desc' },
  });
  return NextResponse.json(educations);
}
