import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  const organization = searchParams.get('organization');
  const degree = searchParams.get('degree');

  if (!name && !organization && !degree) {
    return NextResponse.json({ error: 'At least one parameter (name, organization, degree) is required' }, { status: 400 });
  }
  const where: any = { deleted: false };

  if (name) {
    where.fullName = {
      contains: name,
    };
  } else {
    where.fullName = { not: '' }; // Ensure we don't return experts with empty names
  }
  if (organization) {
    where.organization = {
      contains: organization,
    };
  } else {
    where.organization = { not: '' }; // Ensure we don't return experts with empty organizations
  }
  if (degree) {
    where.degree = {
      contains: degree,
    };
  } else {
    where.degree = { not: '' }; // Ensure we don't return experts with empty degrees
  }

  // Nếu chỉ tìm theo tên, trả về object đầu tiên (hoặc null nếu không có)
  if (name && !organization && !degree) {
    // If only name is provided, we can optimize the query
    const experts = await prisma.expert.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        organization: true,
        degree: true,
        phone: true,
        email: true,
        gender: true,
        birthYear: true,
      }
    });
    return NextResponse.json(experts || { error: 'No experts found' });
  }

  // Nếu tìm theo organization hoặc degree, trả về danh sách
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
    orderBy: {
      fullName: 'asc'
    }
  });


  return NextResponse.json(experts);
}