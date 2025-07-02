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
    const title = searchParams.get('title') || '';
    const limit = parseInt(searchParams.get('limit') || '5');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log(`🔍 RASA Academic Title Search: title="${title}", limit=${limit}, offset=${offset}`);

    if (!title) {
      return NextResponse.json({
        error: 'Missing title parameter',
        example: '/api/rasa/experts/by-academic-title?title=Giáo sư&limit=5'
      }, { status: 400 });
    }

    const queries = new ExpertQueries(prisma);
    const experts = await queries.searchByAcademicTitle(title);
    
    const totalCount = experts.length;
    const paginatedExperts = experts.slice(offset, offset + limit);

    console.log(`✅ Found ${totalCount} experts with title "${title}", returning ${paginatedExperts.length}`);

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
        searchTerm: title,
        route: '/api/rasa/experts/by-academic-title'
      }
    });

  } catch (error: any) {
    console.error('❌ RASA Academic Title Search Error:', error);
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
    const limit = body.limit || 5;
    const offset = body.offset || 0;
    const context = body.context || 'academic_title_search';

    console.log(`🔍 RASA POST Academic Title Search: entity_value="${entityValue}", context="${context}"`);

    if (!entityValue) {
      return createRasaErrorResponse('Missing entity_value in request body', context);
    }

    const queries = new ExpertQueries(prisma);
    const experts = await queries.searchByAcademicTitle(entityValue);
    
    const totalCount = experts.length;
    const paginatedExperts = experts.slice(offset, offset + limit);

    console.log(`✅ RASA Found ${totalCount} experts with title "${entityValue}"`);

    return createRasaResponse(
      paginatedExperts,
      context,
      totalCount,
      { offset, limit, hasMore: (offset + limit) < totalCount }
    );

  } catch (error: any) {
    console.error('❌ RASA POST Academic Title Error:', error);
    return createRasaErrorResponse(error.message, 'academic_title_search');
  } finally {
    await prisma.$disconnect();
  }
}