// app/api/experts/[id]/undelete/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  try {
    await prisma.expert.update({
      where: { id },
      data: { deleted: false },
    });
    return NextResponse.json({ message: 'Khôi phục thành công' });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi khôi phục' }, { status: 500 });
  }
}
