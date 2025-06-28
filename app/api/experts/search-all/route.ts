import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  const organization = searchParams.get('org');
  const degree = searchParams.get('degree');

  const where: any = { deleted: false };
  if (name) where.fullName = { contains: name };
  if (organization) where.organization = { contains: organization };
  if (degree) where.degree = { contains: degree };

  const experts = await prisma.expert.findMany({
    where,
    select: {
      id: true,
      fullName: true,
      organization: true,
      degree: true,
      gender: true,
      birthYear: true,
      phone: true,
      email: true
    },
    orderBy: { fullName: 'asc' }
  });

  return NextResponse.json({ experts, total: experts.length });
}