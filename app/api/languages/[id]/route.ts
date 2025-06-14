import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET one language
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const langId = Number(id);
  if (isNaN(langId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  const lang = await prisma.language.findUnique({
    where: { id: langId },
    include: { expert: true },
  });

  if (!lang) {
    return NextResponse.json({ error: 'Không tìm thấy ngoại ngữ' }, { status: 404 });
  }

  return NextResponse.json(lang);
}

// PUT: cập nhật language
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const langId = Number(id);
  if (isNaN(langId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  const body = await req.json();

  try {
    const updated = await prisma.language.update({
      where: { id: langId },
      data: {
        language: body.language,
        listening: body.listening,
        speaking: body.speaking,
        reading: body.reading,
        writing: body.writing,
        expertId: body.expertId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Cập nhật thất bại' }, { status: 500 });
  }
}

// DELETE (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const langId = Number(id);
  if (isNaN(langId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  try {
    const deleted = await prisma.language.update({
      where: { id: langId },
      data: { deleted: true },
    });

    return NextResponse.json({ message: 'Xóa mềm thành công', data: deleted });
  } catch (error) {
    return NextResponse.json({ error: 'Xóa thất bại' }, { status: 500 });
  }
}
