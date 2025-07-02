//api/rasa/education/by-school/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ExpertQueries } from '@/app/api/experts/lib/queries';
import { 
  transformEducationJoinToExperts,
  createRasaResponse, 
  createRasaErrorResponse 
} from '@/app/api/experts/lib/helpers';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const major = searchParams.get('major') || '';
    const limit = parseInt(searchParams.get('limit') || '5');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log(`🔍 RASA Education Major Search: major="${major}", limit=${limit}, offset=${offset}`);

    if (!major) {
      return NextResponse.json({
        error: 'Missing major parameter',
        example: '/api/rasa/education/by-major?major=Computer Science&limit=5'
      }, { status: 400 });
    }

    const queries = new ExpertQueries(prisma);
    const joinedData = await queries.searchByMajor(major);
    
    // Transform joined data to expert+education structure
    const expertsWithEducation = transformEducationJoinToExperts(joinedData);
    
    const totalCount = expertsWithEducation.length;
    const paginatedResults = expertsWithEducation.slice(offset, offset + limit);

    console.log(`✅ Found ${totalCount} experts with major "${major}", returning ${paginatedResults.length}`);

    return NextResponse.json({
      success: true,
      data: paginatedResults,
      total: totalCount,
      pagination: {
        offset,
        limit,
        hasMore: (offset + limit) < totalCount,
        nextOffset: (offset + limit) < totalCount ? offset + limit : null
      },
      debug: {
        searchTerm: major,
        route: '/api/rasa/education/by-major',
        dataType: 'expert_with_education'
      }
    });

  } catch (error: any) {
    console.error('❌ RASA Education Major Search Error:', error);
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
    const context = body.context || 'education_major_search';

    console.log(`🔍 RASA POST Education Major Search: entity_value="${entityValue}", context="${context}"`);

    if (!entityValue) {
      return createRasaErrorResponse('Missing entity_value in request body', context);
    }

    const queries = new ExpertQueries(prisma);
    const joinedData = await queries.searchByMajor(entityValue);
    const expertsWithEducation = transformEducationJoinToExperts(joinedData);
    
    const totalCount = expertsWithEducation.length;
    const paginatedResults = expertsWithEducation.slice(offset, offset + limit);

    console.log(`✅ RASA Found ${totalCount} experts with major "${entityValue}"`);

    return createRasaResponse(
      paginatedResults,
      context,
      totalCount,
      { 
        offset, 
        limit, 
        hasMore: (offset + limit) < totalCount
      }
    );

  } catch (error: any) {
    console.error('❌ RASA POST Education Major Error:', error);
    return createRasaErrorResponse(error.message, 'education_major_search');
  } finally {
    await prisma.$disconnect();
  }
}