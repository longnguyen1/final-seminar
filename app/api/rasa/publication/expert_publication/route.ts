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
    const expertId = parseInt(searchParams.get('expertId') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!expertId || expertId <= 0) {
      return NextResponse.json({
        error: 'Missing or invalid expertId parameter',
        example: '/api/rasa/publication/expert-publication?expertId=1&limit=10'
      }, { status: 400 });
    }

    const queries = new ExpertQueries(prisma);
    const publications = await queries.getExpertPublications(expertId);

    const totalCount = publications.length;
    const paginatedPublications = publications.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginatedPublications,
      total: totalCount,
      pagination: {
        offset,
        limit,
        hasMore: (offset + limit) < totalCount
      },
      debug: {
        expertId,
        route: '/api/rasa/publication/expert-publication',
        dataType: 'publication_records'
      }
    });

  } catch (error: any) {
    console.error('❌ RASA Expert Publication Details Error:', error);
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
    const expertId = parseInt(body.expert_id || body.expertId || '0', 10);
    const limit = body.limit || 10;
    const offset = body.offset || 0;
    const context = body.context || 'expert_publication_details';

    if (!expertId || expertId <= 0) {
      return createRasaErrorResponse('Missing or invalid expert_id in request body', context);
    }

    const queries = new ExpertQueries(prisma);
    const publications = await queries.getExpertPublications(expertId);

    const totalCount = publications.length;
    const paginatedPublications = publications.slice(offset, offset + limit);

    return createRasaResponse(
      paginatedPublications,
      context,
      totalCount,
      {
        offset,
        limit,
        hasMore: (offset + limit) < totalCount
      }
    );

  } catch (error: any) {
    console.error('❌ RASA POST Expert Publication Details Error:', error);
    return createRasaErrorResponse(error.message, 'expert_publication_details');
  } finally {
    await prisma.$disconnect();
  }
}