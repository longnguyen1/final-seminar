import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  const organization = searchParams.get('org');
  const degree = searchParams.get('degree');
  const academicTitle = searchParams.get('academicTitle'); // Thêm dòng này

  const where: any = { deleted: false };
  if (name) where.fullName = { contains: name };
  if (organization) where.organization = { equals: organization, mode: 'insensitive' };
  if (degree) where.degree = { contains: degree };
  if (academicTitle) where.academicTitle = { contains: academicTitle }; // Thêm dòng này

  const experts = await prisma.expert.findMany({
    where,
    select: {
      id: true,
      fullName: true,
      organization: true,
      degree: true,
      academicTitle: true, // Thêm dòng này nếu muốn trả về học hàm
      gender: true,
      birthYear: true,
      phone: true,
      email: true
    },
    orderBy: { fullName: 'asc' }
  });

  return NextResponse.json({ experts, total: experts.length });
}