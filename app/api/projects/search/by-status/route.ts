import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  if (!status) {
    return NextResponse.json({ 
      error: 'Thiếu trạng thái dự án',
      projects: [],
      count: 0,
      success: false
    }, { status: 400 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        status: { contains: status },
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

    const response = {
      projects,
      count: projects.length,
      status,
      success: true,
      message: projects.length > 0 
        ? `Tìm thấy ${projects.length} dự án có trạng thái "${status}"`
        : `Không tìm thấy dự án nào có trạng thái "${status}"`
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Project by status error:', error);
    return NextResponse.json({ 
      error: 'Lỗi máy chủ',
      projects: [],
      count: 0,
      status,
      success: false
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';