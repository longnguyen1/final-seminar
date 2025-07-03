// api/rasa/experts/by-academic-title/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ExpertQueries } from '@/app/api/experts/lib/queries';
import { 
  createRasaResponse, 
  createRasaErrorResponse 
} from '@/app/api/experts/lib/helpers';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const degree = searchParams.get('degree') || '';
    const limit = parseInt(searchParams.get('limit') || '15');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log(`🔍 RASA Degree Search: degree="${degree}", limit=${limit}, offset=${offset}`);

    if (!degree) {
      return NextResponse.json({
        error: 'Missing degree parameter',
        example: '/api/rasa/experts/by-degree?degree=Tiến sĩ&limit=5'
      }, { status: 400 });
    }

    const queries = new ExpertQueries(prisma);
    const experts = await queries.searchByDegree(degree);
    
    const totalCount = experts.length;
    const paginatedExperts = experts.slice(offset, offset + limit);

    console.log(`✅ Found ${totalCount} experts with degree "${degree}", returning ${paginatedExperts.length}`);

    return NextResponse.json({
      success: true,
      data: paginatedExperts,
      total: totalCount,
      pagination: {
        offset,
        limit,
        hasMore: (offset + limit) < totalCount
      },
      debug: {
        searchTerm: degree,
        route: '/api/rasa/experts/by-degree'
      }
    });

  } catch (error: any) {
    console.error('❌ RASA Degree Search Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entityValue = body.entity_value || '';
    const limit = body.limit || 15;
    const offset = body.offset || 0;
    const context = body.context || 'degree_search';

    console.log(`🔍 RASA POST Degree Search: entity_value="${entityValue}", context="${context}"`);

    if (!entityValue) {
      return createRasaErrorResponse('Missing entity_value in request body', context);
    }

    const queries = new ExpertQueries(prisma);
    const experts = await queries.searchByDegree(entityValue);
    
    const totalCount = experts.length;
    const paginatedExperts = experts.slice(offset, offset + limit);

    console.log(`✅ RASA Found ${totalCount} experts with degree "${entityValue}"`);

    return createRasaResponse(
      paginatedExperts,
      context,
      totalCount,
      { offset, limit, hasMore: (offset + limit) < totalCount }
    );

  } catch (error: any) {
    console.error('❌ RASA POST Degree Error:', error);
    return createRasaErrorResponse(error.message, 'degree_search');
  } finally {
    await prisma.$disconnect();
  }
}