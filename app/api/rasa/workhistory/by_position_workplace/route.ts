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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const position = searchParams.get('position') || '';
  const workplace = searchParams.get('workplace') || '';
  const limit = parseInt(searchParams.get('limit') || '15', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const context = searchParams.get('context') || 'workhistory_position_workplace_search';
  const mode = (searchParams.get('mode') as 'and' | 'or' | 'position' | 'workplace') || 'and';

  if (!position && !workplace) {
    return createRasaErrorResponse('Missing position and workplace in query', context);
  }

  const queries = new ExpertQueries(prisma);
  const joined = await queries.searchByWorkPositionAndOrWorkplace(position, workplace, mode);

  const totalCount = joined.length;
  const paginated = joined.slice(offset, offset + limit);
  const experts = transformWorkHistoryJoinToExperts(paginated);

  return createRasaResponse(
    experts,
    context,
    totalCount,
    { offset, limit, hasMore: (offset + limit) < totalCount }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
    const joined = await queries.searchByWorkPositionAndOrWorkplace(position, workplace, mode);

    const totalCount = joined.length;
    const paginated = joined.slice(offset, offset + limit);

    // Chuyển dữ liệu join về dạng ExpertWithRelations (giống các API khác)
    const experts = transformWorkHistoryJoinToExperts(paginated);

    return createRasaResponse(
      experts,
      context,
      totalCount,
      { offset, limit, hasMore: (offset + limit) < totalCount }
    );
  } catch (error: any) {
    console.error('❌ RASA WorkHistory Position+Workplace Error:', error);
    return createRasaErrorResponse(error.message, 'workhistory_position_workplace_search');
  } finally {
    await prisma.$disconnect();
  }
}