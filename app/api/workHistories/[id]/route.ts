// app/api/workHistories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const historyId = Number(id);
  if (isNaN(historyId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  const history = await prisma.workHistory.findUnique({
    where: { id: historyId },
    include: { expert: true },
  });

  if (!history) {
    return NextResponse.json({ error: 'Không tìm thấy lịch sử công tác' }, { status: 404 });
  }
  return NextResponse.json(history);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const historyId = Number(id);
  if (isNaN(historyId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  const body = await req.json();
  try {
    const updated = await prisma.workHistory.update({
      where: { id: historyId },
      data: {
        startYear: body.startYear,
        endYear: body.endYear,
        position: body.position,
        workplace: body.workplace,
        field: body.field,
        expertId: body.expertId,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Cập nhật thất bại' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const historyId = Number(id);
  if (isNaN(historyId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  try {
    const softDeleted = await prisma.workHistory.update({
      where: { id: historyId },
      data: { deleted: true },
    });
    return NextResponse.json({ message: 'Xóa mềm thành công', data: softDeleted });
  } catch (error) {
    return NextResponse.json({ error: 'Xóa thất bại' }, { status: 500 });
  }
}
