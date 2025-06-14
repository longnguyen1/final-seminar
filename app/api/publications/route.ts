import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET all publications (chỉ hiện cái chưa bị soft delete)
export async function GET() {
  const publications = await prisma.publication.findMany({
    where: { deleted: false },
    include: { expert: true },
  });
  return NextResponse.json(publications);
}

// POST: Tạo mới publication
export async function POST(req: Request) {
  const body = await req.json();

  try {
    const newPublication = await prisma.publication.create({
      data: {
        year: body.year,
        place: body.place,
        title: body.title,
        type: body.type,
        author: body.author,
        expertId: body.expertId,
      },
    });

    return NextResponse.json(newPublication);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create publication' }, { status: 500 });
  }
}
