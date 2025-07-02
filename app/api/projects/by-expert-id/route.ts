import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const expertId = searchParams.get('id');

  if (!expertId) {
    return NextResponse.json({ 
      error: 'Thiếu id chuyên gia',
      projects: [],
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
        projects: [],
        count: 0,
        expertId: Number(expertId),
        success: false,
        message: `Không tìm thấy chuyên gia với id ${expertId}`
      }, { status: 404 });
    }

    const projects = await prisma.project.findMany({
      where: {
        expertId: Number(expertId),
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
      },
      orderBy: [
        { endYear: 'desc' },    // Dự án gần nhất trước
        { startYear: 'desc' }
      ],
    });

    const response = {
      projects,
      count: projects.length,
      expertId: Number(expertId),
      expertName: expert.fullName,
      success: true,
      message: projects.length > 0 
        ? `Tìm thấy ${projects.length} dự án của ${expert.fullName}`
        : `${expert.fullName} chưa có dự án nào được ghi nhận`
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Project by expert error:', error);
    return NextResponse.json({ 
      error: 'Lỗi máy chủ',
      projects: [],
      count: 0,
      expertId: Number(expertId),
      success: false
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';