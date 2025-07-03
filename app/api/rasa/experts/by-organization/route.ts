//api/rasa/experts/by-organization/route.ts
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
    const organization = searchParams.get('organization') || '';
    const limit = parseInt(searchParams.get('limit') || '15');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log(`🔍 RASA Organization Search: organization="${organization}", limit=${limit}, offset=${offset}`);

    if (!organization) {
      return NextResponse.json({
        error: 'Missing organization parameter',
        example: '/api/rasa/experts/by-organization?organization=Bách khoa&limit=5'
      }, { status: 400 });
    }

    const queries = new ExpertQueries(prisma);
    const experts = await queries.searchByOrganization(organization);
    
    const totalCount = experts.length;
    const paginatedExperts = experts.slice(offset, offset + limit);
    console.log(`[DEBUG] API received organization: "${organization}"`);
    console.log(`[DEBUG] Total experts found: ${totalCount}`);

    console.log(`✅ Found ${totalCount} experts at "${organization}", returning ${paginatedExperts.length}`);

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
        searchTerm: organization,
        route: '/api/rasa/experts/by-organization'
      }
    });

  } catch (error: any) {
    console.error('❌ RASA Organization Search Error:', error);
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
    const context = body.context || 'organization_search';

    console.log(`🔍 RASA POST Organization Search: entity_value="${entityValue}", context="${context}"`);

    if (!entityValue) {
      return createRasaErrorResponse('Missing entity_value in request body', context);
    }

    const queries = new ExpertQueries(prisma);
    const experts = await queries.searchByOrganization(entityValue);
    
    const totalCount = experts.length;
    const paginatedExperts = experts.slice(offset, offset + limit);
    
    console.log(`[DEBUG] API received entity_value: "${entityValue}"`);
    console.log(`[DEBUG] Entities from tracker: ${entityValue}`);
    console.log(`✅ RASA Found ${totalCount} experts at "${entityValue}"`);

    return createRasaResponse(
      paginatedExperts,
      context,
      totalCount,
      { offset, limit, hasMore: (offset + limit) < totalCount }
    );

  } catch (error: any) {
    console.error('❌ RASA POST Organization Error:', error);
    return createRasaErrorResponse(error.message, 'organization_search');
  } finally {
    await prisma.$disconnect();
  }
}