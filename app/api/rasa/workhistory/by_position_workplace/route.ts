// api/experts/workhistory/by_position_workplace/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ExpertQueries } from '@/app/api/experts/lib/queries';
import { 
  createRasaResponse, 
  createRasaErrorResponse,
  transformWorkHistoryJoinToExperts
} from '@/app/api/experts/lib/helpers';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[DEBUG] Nhận request body:', body);
    const position = body.position || '';
    const workplace = body.workplace || '';
    const limit = body.limit || 10;
    const offset = body.offset || 0;
    const context = body.context || 'workhistory_position_workplace_search';
    const mode = (body.mode as 'and' | 'or' | 'position' | 'workplace') || 'and';

    if (!position && !workplace) {
      return createRasaErrorResponse('Missing position and workplace in request body', context);
    }

    const queries = new ExpertQueries(prisma);

    let joined: any[] = [];
    if (mode === 'and' && position && workplace) {
      // Lấy expertId theo từng điều kiện rồi giao lại
      const byPosition = await queries.searchByWorkPositionAndOrWorkplace(position, '', 'position');
      const byWorkplace = await queries.searchByWorkPositionAndOrWorkplace('', workplace, 'workplace');
      const idsByPosition = new Set(byPosition.map(r => r.expertId));
      const idsByWorkplace = new Set(byWorkplace.map(r => r.expertId));
      const intersectIds = [...idsByPosition].filter(id => idsByWorkplace.has(id));
      // Lấy tất cả workHistory của các expert này (hoặc chỉ lấy expert)
      joined = await queries.getWorkHistoriesByExpertIds(intersectIds);
    } else {
      // Giữ nguyên logic cũ cho các mode khác
      joined = await queries.searchByWorkPositionAndOrWorkplace(position, workplace, mode);
    }

    // Nhóm thành expert duy nhất
    const experts = transformWorkHistoryJoinToExperts(joined);
    const totalCount = experts.length;

    // Phân trang trên danh sách expert
    const paginated = experts.slice(offset, offset + limit);

    return createRasaResponse(
      paginated,
      context,
      totalCount,
      { offset, limit, hasMore: (offset + limit) < totalCount }
    );
  } catch (error) {
    console.error('[ERROR] ', error);
    return createRasaErrorResponse('Internal server error', 'workhistory_position_workplace_search');
  }
}