// app/api/experts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;          // ← đây
  const numId = Number(id);
  if (isNaN(numId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }
  const expert = await prisma.expert.findUnique({ where: { id: numId } });
  if (!expert) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }
  return NextResponse.json(expert);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const numId = Number(id);
  const data = await req.json();
  const updated = await prisma.expert.update({
    where: { id: numId },
    data: {
      fullName: data.fullName,
      birthYear: data.birthYear,
      gender: data.gender,
      academicTitle: data.academicTitle,
      academicTitleYear: data.academicTitleYear,
      degree: data.degree,
      degreeYear: data.degreeYear,
      position: data.position,
      currentWork: data.currentWork,
      organization: data.organization,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const numId = Number(id);
  await prisma.expert.update({
    where: { id: numId },
    data: { deleted: true },
  });
  return NextResponse.json({ message: 'Đã xóa mềm' });
}
