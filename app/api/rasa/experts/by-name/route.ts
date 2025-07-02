import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// ✅ Updated import path - đi lên 3 levels để tới lib
import { ExpertQueries } from '@/app/api/experts/lib/queries';
import { 
  createRasaResponse, 
  createRasaErrorResponse 
} from '@/app/api/experts/lib/helpers';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || '';
    const limit = parseInt(searchParams.get('limit') || '5');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log(`🔍 RASA Expert Search: name="${name}", limit=${limit}, offset=${offset}`);

    if (!name) {
      return NextResponse.json({
        error: 'Missing name parameter',
        example: '/api/rasa/experts/by-name?name=Nguyen&limit=5'
      }, { status: 400 });
    }

    // Use existing queries library
    const queries = new ExpertQueries(prisma);
    const experts = await queries.searchByName(name);
    
    // Apply pagination
    const totalCount = experts.length;
    const paginatedExperts = experts.slice(offset, offset + limit);

    console.log(`✅ Found ${totalCount} experts, returning ${paginatedExperts.length}`);

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
        searchTerm: name,
        route: '/api/rasa/experts/by-name'
      }
    });

  } catch (error: any) {
    console.error('❌ RASA Expert Search Error:', error);
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
    const context = body.context || 'expert_search';

    console.log(`🔍 RASA POST Search: entity_value="${entityValue}", context="${context}"`);

    if (!entityValue) {
      return createRasaErrorResponse('Missing entity_value in request body', context);
    }

    const queries = new ExpertQueries(prisma);
    const experts = await queries.searchByName(entityValue);
    
    const totalCount = experts.length;
    const paginatedExperts = experts.slice(offset, offset + limit);

    console.log(`✅ RASA Found ${totalCount} experts for "${entityValue}"`);

    return createRasaResponse(
      paginatedExperts,
      context,
      totalCount,
      { offset, limit, hasMore: (offset + limit) < totalCount }
    );

  } catch (error: any) {
    console.error('❌ RASA POST Error:', error);
    return createRasaErrorResponse(error.message, 'expert_search');
  } finally {
    await prisma.$disconnect();
  }
}