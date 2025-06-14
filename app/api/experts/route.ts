// app/api/experts/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const experts = await prisma.expert.findMany({
      where: { deleted: false },
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(experts);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi lấy dữ liệu' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const expert = await prisma.expert.create({
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
    return NextResponse.json(expert);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi tạo mới chuyên gia' }, { status: 500 });
  }
}
