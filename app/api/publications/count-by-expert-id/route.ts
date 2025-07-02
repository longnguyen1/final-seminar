import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const expertId = searchParams.get('id');

  if (!expertId) {
    return NextResponse.json({ 
      error: 'Thiếu id chuyên gia',
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
        count: 0,
        expertId: Number(expertId),
        success: false,
        message: `Không tìm thấy chuyên gia với id ${expertId}`
      }, { status: 404 });
    }

    // Đếm tổng số publications
    const totalCount = await prisma.publication.count({
      where: {
        expertId: Number(expertId),
        deleted: false,
      }
    });

    // Đếm theo từng loại
    const countByType = await prisma.publication.groupBy({
      by: ['type'],
      where: {
        expertId: Number(expertId),
        deleted: false,
      },
      _count: {
        type: true,
      },
      orderBy: {
        _count: {
          type: 'desc',
        },
      },
    });

    const response = {
      count: totalCount,
      expertId: Number(expertId),
      expertName: expert.fullName,
      countByType: countByType.map(item => ({
        type: item.type,
        count: item._count.type,
      })),
      success: true,
      message: totalCount > 0 
        ? `${expert.fullName} có tổng cộng ${totalCount} công trình khoa học`
        : `${expert.fullName} chưa có công trình khoa học nào được ghi nhận`
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Count publications error:', error);
    return NextResponse.json({ 
      error: 'Lỗi máy chủ',
      count: 0,
      expertId: Number(expertId),
      success: false
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';