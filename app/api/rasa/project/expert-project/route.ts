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
    const expertId = parseInt(searchParams.get('expertId') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log(`🔍 RASA Expert Project Details: expertId=${expertId}, limit=${limit}, offset=${offset}`);

    if (!expertId || expertId <= 0) {
      return NextResponse.json({
        error: 'Missing or invalid expertId parameter',
        example: '/api/rasa/project/expert-project?expertId=1&limit=10'
      }, { status: 400 });
    }

    const queries = new ExpertQueries(prisma);
    const projects = await queries.getExpertProjects(expertId);
    
    const totalCount = projects.length;
    const paginatedProjects = projects.slice(offset, offset + limit);

    console.log(`✅ Found ${totalCount} project records for expert ${expertId}, returning ${paginatedProjects.length}`);

    return NextResponse.json({
      success: true,
      data: paginatedProjects,
      total: totalCount,
      pagination: {
        offset,
        limit,
        hasMore: (offset + limit) < totalCount
      },
      debug: {
        expertId,
        route: '/api/rasa/project/expert-project',
        dataType: 'project_records'
      }
    });

  } catch (error: any) {
    console.error('❌ RASA Expert Project Details Error:', error);
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
    const expertId = parseInt(body.expert_id || body.expertId || '0');
    const limit = body.limit || 10;
    const offset = body.offset || 0;
    const context = body.context || 'expert_project_details';

    console.log(`🔍 RASA POST Expert Project Details: expertId=${expertId}, context="${context}"`);

    if (!expertId || expertId <= 0) {
      return createRasaErrorResponse('Missing or invalid expert_id in request body', context);
    }

    const queries = new ExpertQueries(prisma);
    const projects = await queries.getExpertProjects(expertId);
    
    const totalCount = projects.length;
    const paginatedProjects = projects.slice(offset, offset + limit);

    console.log(`✅ RASA Found ${totalCount} project records for expert ${expertId}`);

    return createRasaResponse(
      paginatedProjects,
      context,
      totalCount,
      { 
        offset, 
        limit, 
        hasMore: (offset + limit) < totalCount
      }
    );

  } catch (error: any) {
    console.error('❌ RASA POST Expert Project Details Error:', error);
    return createRasaErrorResponse(error.message, 'expert_project_details');
  } finally {
    await prisma.$disconnect();
  }
}