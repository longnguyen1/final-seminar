import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ExpertQueries } from '../../../experts/lib/queries';
import { batchEnrichExperts } from '../../../experts/lib/helpers';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Lấy các trường lọc từ body
    const {
      school,
      major,
      year,
      degree,
      academicTitle,
      expertId,
      limit = 10,
      offset = 0,
    } = body;

    // Xây dựng điều kiện where cho bảng Education
    const where: any = { deleted: false };
    if (school) where.school = { contains: school };
    if (major) where.major = { contains: major };
    if (year) where.year = year;
    if (degree) where.degree = { contains: degree };
    if (academicTitle) where.academicTitle = { contains: academicTitle };
    if (expertId) where.expertId = expertId;

    // Truy vấn Education để lấy expertId
    const educations = await prisma.education.findMany({
      where,
      select: { expertId: true },
    });
    const expertIds = Array.from(new Set(educations.map(e => e.expertId)));

    // Đếm tổng số expertId duy nhất
    const total = expertIds.length;

    let experts: any[] = [];
    if (expertIds.length > 0) {
      // Lấy thông tin bảng Expert theo expertIds, có phân trang
      const queries = new ExpertQueries(prisma);
      experts = await queries.getExpertsByIds(
        expertIds.slice(offset, offset + limit)
      );
      // enrich thêm education, workHistory, ...
      experts = await batchEnrichExperts(experts, queries);
    }

    return NextResponse.json({
      success: true,
      data: experts,
      total,
      pagination: {
        offset,
        limit,
        hasMore: offset + limit < total,
      },
      debug: {
        where,
        expertIds,
        route: '/api/rasa/education/search-education',
      }
    });
  } catch (error: any) {
    console.error('❌ Education Search Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}