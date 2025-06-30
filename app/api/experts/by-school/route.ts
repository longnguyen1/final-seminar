import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const school = searchParams.get('school');

  if (!school) {
    return NextResponse.json({ error: 'Thiếu tên trường' }, { status: 400 });
  }

  try {
    // Lấy danh sách expertId từ education có trường phù hợp
    const educations = await prisma.$queryRaw<{ expertId: number }[]>`
      SELECT expertId FROM Education
      WHERE LOWER(school) LIKE CONCAT('%', ${school.toLowerCase()}, '%')
        AND deleted = false
    `;
    const expertIds = [...new Set(educations.map((e: any) => e.expertId))];

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
        educations: {
          select: {
            year: true, 
            school: true,
            major: true,
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    return NextResponse.json(experts, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}