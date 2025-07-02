import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');

  if (!role) {
    return NextResponse.json({ 
      error: 'Thiếu vai trò trong dự án',
      projects: [],
      count: 0,
      success: false
    }, { status: 400 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        role: { contains: role },
        deleted: false,
      },
      select: {
        id: true,
        expertId: true,
        title: true,
        status: true,
        role: true,
        startYear: true,
        endYear: true,
        expert: {
          select: {
            fullName: true,
            organization: true,
            degree: true,
            academicTitle: true,
          }
        }
      },
      orderBy: [
        { endYear: 'desc' },
        { startYear: 'desc' },
        { title: 'asc' }
      ],
      take: 100, // Giới hạn kết quả để tránh quá tải
    });

    // Thống kê theo trạng thái
    const countByStatus = await prisma.project.groupBy({
      by: ['status'],
      where: {
        role: { contains: role },
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

    const response = {
      projects,
      count: projects.length,
      role,
      countByStatus: countByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      success: true,
      message: projects.length > 0 
        ? `Tìm thấy ${projects.length} dự án với vai trò "${role}"`
        : `Không tìm thấy dự án nào với vai trò "${role}"`
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Project by role error:', error);
    return NextResponse.json({ 
      error: 'Lỗi máy chủ',
      projects: [],
      count: 0,
      role,
      success: false
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';