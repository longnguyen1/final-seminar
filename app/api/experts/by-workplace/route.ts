import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const workplace = searchParams.get('workplace');

  if (!workplace) {
    return NextResponse.json({ error: 'Thiếu nơi làm việc' }, { status: 400 });
  }

  try {
    // Lấy danh sách expertId từ workHistory có workplace phù hợp
    const works = await prisma.$queryRaw<{ expertId: number }[]>`
      SELECT expertId FROM WorkHistory
      WHERE LOWER(workplace) LIKE CONCAT('%', ${workplace.toLowerCase()}, '%')
        AND deleted = false
    `;
    const expertIds = [...new Set(works.map((w:any) => w.expertId))];

    if (expertIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Lấy thông tin chuyên gia
    const experts = await prisma.expert.findMany({
      where: {
        id: { in: expertIds },
        deleted: false,
      },
      select: {
        id: true,
        fullName: true,
        organization: true,
        degree: true,
        academicTitle: true,
        gender: true,
        birthYear: true,
        phone: true,
        email: true,
      },
      orderBy: { fullName: 'asc' },
    });

    return NextResponse.json(experts, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}