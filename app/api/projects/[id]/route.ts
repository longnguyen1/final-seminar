import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET một project theo ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const projectId = Number(id);
  if (isNaN(projectId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { expert: true },
  });

  if (!project) {
    return NextResponse.json({ error: 'Không tìm thấy đề tài' }, { status: 404 });
  }

  return NextResponse.json(project);
}

// PUT cập nhật project
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const projectId = Number(id);
  if (isNaN(projectId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  const body = await req.json();

  try {
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        startYear: body.startYear,
        endYear: body.endYear,
        title: body.title,
        status: body.status,
        role: body.role,
        expertId: body.expertId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Cập nhật thất bại' }, { status: 500 });
  }
}

// DELETE (xóa mềm)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const projectId = Number(id);
  if (isNaN(projectId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  try {
    const deleted = await prisma.project.update({
      where: { id: projectId },
      data: { deleted: true },
    });

    return NextResponse.json({ message: 'Xóa mềm thành công', data: deleted });
  } catch (error) {
    return NextResponse.json({ error: 'Xóa thất bại' }, { status: 500 });
  }
}
