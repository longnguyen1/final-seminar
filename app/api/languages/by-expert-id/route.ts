import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const expertId = searchParams.get('id');

  if (!expertId) {
    return NextResponse.json({ 
      error: 'Thiếu id chuyên gia',
      languages: [],
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
        languages: [],
        count: 0,
        expertId: Number(expertId),
        success: false,
        message: `Không tìm thấy chuyên gia với id ${expertId}`
      }, { status: 404 });
    }

    const languages = await prisma.language.findMany({
      where: {
        expertId: Number(expertId),
        deleted: false,
      },
      select: {
        id: true,
        expertId: true,
        language: true,
        listening: true,
        speaking: true,
        reading: true,
        writing: true,
      },
      orderBy: { language: 'asc' }, // Sắp xếp theo tên ngôn ngữ
    });

    const response = {
      languages,
      count: languages.length,
      expertId: Number(expertId),
      expertName: expert.fullName,
      success: true,
      message: languages.length > 0 
        ? `Tìm thấy ${languages.length} ngôn ngữ của ${expert.fullName}`
        : `${expert.fullName} chưa có thông tin ngoại ngữ`
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Language by expert error:', error);
    return NextResponse.json({ 
      error: 'Lỗi máy chủ',
      languages: [],
      count: 0,
      expertId: Number(expertId),
      success: false
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';