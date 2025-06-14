// app/api/educations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const eduId = Number(id);
  if (isNaN(eduId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  const education = await prisma.education.findUnique({ where: { id: eduId } });
  if (!education) {
    return NextResponse.json({ error: 'Không tìm thấy học vấn' }, { status: 404 });
  }
  return NextResponse.json(education);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const eduId = Number(id);
  if (isNaN(eduId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  const body = await req.json();
  try {
    const updated = await prisma.education.update({
      where: { id: eduId },
      data: {
        year: body.year,
        school: body.school,
        major: body.major,
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
  const eduId = Number(id);
  if (isNaN(eduId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  try {
    const deleted = await prisma.education.update({
      where: { id: eduId },
      data: { deleted: true },
    });
    return NextResponse.json({ message: 'Xóa mềm thành công', data: deleted });
  } catch (e) {
    return NextResponse.json({ error: 'Xóa thất bại' }, { status: 500 });
  }
}
