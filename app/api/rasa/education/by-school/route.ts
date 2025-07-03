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
    const school = searchParams.get('school') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log(`🔍 RASA Education School Search: school="${school}", limit=${limit}, offset=${offset}`);

    if (!school) {
      return NextResponse.json({
        error: 'Missing school parameter',
        example: '/api/rasa/education/by-school?school=Bách khoa&limit=5'
      }, { status: 400 });
    }

    const queries = new ExpertQueries(prisma);
    const joinedData = await queries.searchBySchool(school);
    
    // Transform joined data to expert+education structure
    const expertsWithEducation = transformEducationJoinToExperts(joinedData);
    
    const totalCount = expertsWithEducation.length;
    const paginatedResults = expertsWithEducation.slice(offset, offset + limit);

    console.log(`✅ Found ${totalCount} experts educated at "${school}", returning ${paginatedResults.length}`);

    return NextResponse.json({
      success: true,
      data: paginatedResults,
      total: totalCount,
      pagination: {
        offset,
        limit,
        hasMore: (offset + limit) < totalCount
      },
      debug: {
        searchTerm: school,
        route: '/api/rasa/education/by-school',
        dataType: 'expert_with_education'
      }
    });

  } catch (error: any) {
    console.error('❌ RASA Education School Search Error:', error);
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
    const limit = body.limit || 10;
    const offset = body.offset || 0;
    const context = body.context || 'education_school_search';

    console.log(`🔍 RASA POST Education School Search: entity_value="${entityValue}", context="${context}"`);

    if (!entityValue) {
      return createRasaErrorResponse('Missing entity_value in request body', context);
    }

    const queries = new ExpertQueries(prisma);
    const joinedData = await queries.searchBySchool(entityValue);
    const expertsWithEducation = transformEducationJoinToExperts(joinedData);
    
    const totalCount = expertsWithEducation.length;
    const paginatedResults = expertsWithEducation.slice(offset, offset + limit);

    console.log(`✅ RASA Found ${totalCount} experts educated at "${entityValue}"`);

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
    console.error('❌ RASA POST Education School Error:', error);
    return createRasaErrorResponse(error.message, 'education_school_search');
  } finally {
    await prisma.$disconnect();
  }
}