import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET all (tùy chọn lọc theo expertId)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const expertId = searchParams.get("expertId");

  const educations = await prisma.education.findMany({
    where: {
      deleted: false,
      ...(expertId ? { expertId: Number(expertId) } : {}),
    },
    orderBy: { year: "asc" },
  });

  return NextResponse.json(educations);
}


// POST: Tạo mới
export async function POST(req: Request) {
  const body = await req.json();

  try {
    const newEducation = await prisma.education.create({
      data: {
        year: body.year,
        school: body.school,
        major: body.major,
        expertId: body.expertId,
      },
    });

    return NextResponse.json(newEducation);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create education.' }, { status: 500 });
  }
}
