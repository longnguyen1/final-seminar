// api/rasa/workhistory/expert-workhistory/route.ts
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ExpertQueries } from '../lib/queries';
import { createRasaResponse, createRasaErrorResponse, extractRasaRequest, batchEnrichExperts } from '../lib/helpers';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await extractRasaRequest(request);

    // 2. Lấy các filter từ body
    const {
      expert_name,
      current_workplace,
      graduated_school,
      previous_workplace,
      degree,
      academic_title,
      major,
      position,
      limit = 10,
      offset = 0,
      enrich = true,
    } = body;

    const queries = new ExpertQueries(prisma);

    // 3. Nếu có cả filter education và work, dùng hàm tối ưu mới
    if ((graduated_school || major) && (previous_workplace || position)) {
      const experts = await queries.searchExpertByEducationAndWork(
        { school: graduated_school, major },
        { workplace: previous_workplace, position },
        { limit, offset }
      );
      let enrichedExperts = experts;
      if (enrich) {
        const enriched = await batchEnrichExperts(experts, queries);
        // Map ExpertWithRelations to ExpertResult
        enrichedExperts = enriched.map((e: any) => ({
          id: e.id,
          fullName: e.fullName,
          birthYear: e.birthYear,
          gender: e.gender,
          degree: e.degree,
          academicTitle: e.academicTitle,
          organization: e.organization,
          email: e.email,
          phone: e.phone,
          avatar: e.avatar,
          description: e.description,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
          academicTitleYear: e.academicTitleYear ?? null,
          degreeYear: e.degreeYear ?? null,
          position: e.position ?? null,
          currentWork: e.currentWork ?? null,
          deleted: e.deleted ?? false,
        }));
      }
      return createRasaResponse(enrichedExperts, 'expert_advanced_search');
    }

    // 4. Nếu chỉ có education hoặc chỉ work, giữ logic cũ
    let expertIds: number[] | null = null;
    if (graduated_school || major) {
      const where: any = {};
      if (graduated_school) where.school = { contains: graduated_school };
      if (major) where.major = { contains: major };
      const educations = await prisma.education.findMany({
        where: { ...where, deleted: false },
        select: { expertId: true },
      });
      expertIds = educations.map(e => e.expertId);
    } else if (previous_workplace || position) {
      const where: any = {};
      if (previous_workplace) where.workplace = { contains: previous_workplace };
      if (position) where.position = { contains: position };
      const works = await prisma.workHistory.findMany({
        where: { ...where, deleted: false },
        select: { expertId: true },
      });
      expertIds = works.map(w => w.expertId);
    }

    // 5. Truy vấn bảng expert với các filter cơ bản
    let where: any = { deleted: false };
    if (expert_name) where.fullName = { contains: expert_name };
    if (current_workplace) where.organization = { contains: current_workplace };
    if (degree) where.degree = { contains: degree };
    if (academic_title) where.academicTitle = { contains: academic_title };

    if (expertIds) {
      if (expertIds.length === 0) {
        return createRasaResponse([], 'expert_advanced_search');
      }
      where.id = { in: [...new Set(expertIds)] };
    }

    // 6. Nếu không có filter nào, tránh trả về quá nhiều dữ liệu
    const hasAnyFilter =
      expert_name ||
      current_workplace ||
      graduated_school ||
      previous_workplace ||
      degree ||
      academic_title ||
      major ||
      position;
    if (!hasAnyFilter) {
      return createRasaErrorResponse(
        'Bạn cần cung cấp ít nhất một tiêu chí tìm kiếm.',
        'expert_advanced_search'
      );
    }

    // 7. Lấy thông tin chi tiết của các expert
    let experts: any[] = [];
    if (expertIds && expertIds.length > 0) {
      experts = await queries.getExpertsByIds(expertIds, {
        limit,
        offset,
      });
    } else {
      experts = await prisma.expert.findMany({
        where,
        orderBy: { fullName: 'asc' },
        skip: offset,
        take: limit,
      });
    }

    // 8. Enrich dữ liệu cho response nếu cần
    let enrichedExperts = experts;
    if (enrich) {
      enrichedExperts = await batchEnrichExperts(experts, queries);
    }

    // 9. Trả về response cho Rasa
    return createRasaResponse(enrichedExperts, 'expert_advanced_search');
  } catch (error) {
    console.error('Error processing request:', error);
    return createRasaErrorResponse(
      error instanceof Error ? error.message : String(error),
      'expert_advanced_search'
    );
  }
}