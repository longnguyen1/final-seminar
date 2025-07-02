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

    // Đếm tổng số projects
    const totalCount = await prisma.project.count({
      where: {
        expertId: Number(expertId),
        deleted: false,
      }
    });

    // Đếm theo từng trạng thái
    const countByStatus = await prisma.project.groupBy({
      by: ['status'],
      where: {
        expertId: Number(expertId),
        deleted: false,
        status: {
          not: null
        }
      },
      _count: {
        status: true,
      },
      orderBy: {
        _count: {
          status: 'desc',
        },
      },
    });

    // Đếm theo từng vai trò
    const countByRole = await prisma.project.groupBy({
      by: ['role'],
      where: {
        expertId: Number(expertId),
        deleted: false,
        role: {
          not: null
        }
      },
      _count: {
        role: true,
      },
      orderBy: {
        _count: {
          role: 'desc',
        },
      },
    });

    const response = {
      count: totalCount,
      expertId: Number(expertId),
      expertName: expert.fullName,
      countByStatus: countByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      countByRole: countByRole.map(item => ({
        role: item.role,
        count: item._count.role,
      })),
      success: true,
      message: totalCount > 0 
        ? `${expert.fullName} có tổng cộng ${totalCount} dự án`
        : `${expert.fullName} chưa có dự án nào được ghi nhận`
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Count projects error:', error);
    return NextResponse.json({ 
      error: 'Lỗi máy chủ',
      count: 0,
      expertId: Number(expertId),
      success: false
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';