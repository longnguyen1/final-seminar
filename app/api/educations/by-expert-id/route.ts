//api/educations/by-expert-id/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const expertId = searchParams.get('id');

  if (!expertId) {
    return NextResponse.json({ 
      error: 'Thiếu id chuyên gia',
      educations: [],
      count: 0,
      success: false
    }, { status: 400 });
  }

  try {
    // Kiểm tra expert có tồn tại không
    const expert = await prisma.expert.findUnique({
      where: {
        id: Number(expertId),
        deleted: false,
      },
      select: {
        id: true,
        fullName: true,
      }
    });

    if (!expert) {
      return NextResponse.json({
        error: 'Không tìm thấy chuyên gia',
        educations: [],
        count: 0,
        expertId: Number(expertId),
        success: false,
        message: `Không tìm thấy chuyên gia với id ${expertId}`
      }, { status: 404 });
    }

    const educations = await prisma.education.findMany({
      where: {
        expertId: Number(expertId),
        deleted: false,
      },
      select: {
        id: true,
        expertId: true,
        year: true,
        school: true,
        major: true,
      },
      orderBy: { year: 'desc' }, // Năm gần nhất trước
    });

    const response = {
      educations,
      count: educations.length,
      expertId: Number(expertId),
      expertName: expert.fullName,
      success: true,
      message: educations.length > 0 
        ? `Tìm thấy ${educations.length} bản ghi quá trình đào tạo của ${expert.fullName}`
        : `${expert.fullName} chưa có thông tin quá trình đào tạo`
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Education by expert error:', error);
    return NextResponse.json({ 
      error: 'Lỗi máy chủ',
      educations: [],
      count: 0,
      expertId: Number(expertId),
      success: false
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';