//api/experts/search-all/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  const organization = searchParams.get('organization');
  const degree = searchParams.get('degree');
  const academicTitle = searchParams.get('academicTitle');

  console.log('Search params:', { name, organization, degree, academicTitle });

  const where: any = { deleted: false };
  
  if (name) {
    where.fullName = { contains: name };
  }
  
  if (organization) {
    where.organization = { contains: organization };
  }
  
  if (degree) {
    where.degree = { contains: degree };
  }
  
  if (academicTitle) {
    where.academicTitle = { contains: academicTitle };
  }

  try {
    const experts = await prisma.expert.findMany({
      where,
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
      take: 50
    });

    const response: {
      experts: any[];
      count: number;
      success: boolean;
      message: string;
      expert?: any;
    } = {
      experts,
      count: experts.length,
      success: true,
      message: experts.length > 0 
        ? `Tìm thấy ${experts.length} chuyên gia phù hợp` 
        : 'Không tìm thấy chuyên gia nào phù hợp với yêu cầu'
    };

    // Nếu chỉ có 1 expert, trả về thông tin chi tiết
    if (experts.length === 1) {
      response.expert = experts[0];
    }

    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('Search experts error:', error);
    return NextResponse.json({ 
      experts: [], 
      count: 0, 
      success: false,
      error: 'Lỗi truy vấn cơ sở dữ liệu',
      message: 'Đã xảy ra lỗi khi tìm kiếm chuyên gia'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';