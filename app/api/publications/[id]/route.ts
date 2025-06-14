// app/api/publications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const pubId = Number(id);
  if (isNaN(pubId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  const publication = await prisma.publication.findUnique({
    where: { id: pubId },
    include: { expert: true },
  });

  if (!publication) {
    return NextResponse.json({ error: 'Không tìm thấy công trình' }, { status: 404 });
  }
  return NextResponse.json(publication);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const pubId = Number(id);
  if (isNaN(pubId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  const body = await req.json();
  try {
    const updated = await prisma.publication.update({
      where: { id: pubId },
      data: {
        year: body.year,
        place: body.place,
        title: body.title,
        type: body.type,
        author: body.author,
        expertId: body.expertId,
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: 'Cập nhật thất bại' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const pubId = Number(id);
  if (isNaN(pubId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  try {
    const deleted = await prisma.publication.update({
      where: { id: pubId },
      data: { deleted: true },
    });
    return NextResponse.json({ message: 'Xóa mềm thành công', data: deleted });
  } catch (e) {
    return NextResponse.json({ error: 'Xóa thất bại' }, { status: 500 });
  }
}
