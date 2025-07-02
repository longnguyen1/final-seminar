import { NextResponse } from 'next/server';
import {
  ExpertResult,
  ExpertWithRelations,
  RasaBaseRequest,
  RasaExpertRequest,
  RasaResponse,
  RasaErrorResponse,
  RasaPublicationStats,
  RasaProjectStats,
  RasaPaginatedList,
  RasaLanguageSummary,
  PublicationResult,
  ProjectResult,
  LanguageResult,
  ExpertEducationJoin,
  ExpertWorkHistoryJoin,
  ExpertPublicationJoin,
  ExpertProjectJoin,
  ExpertLanguageJoin,
  ExpertRelationsBundle,
  PublicationStatsResult,
  ProjectStatsResult,
  CountResult,
  SearchContext
} from './types';
import { ExpertQueries } from './queries';

// ============ RESPONSE HELPERS ============

export function createRasaResponse<T = ExpertWithRelations[]>(
  data: T,
  context: string,
  total?: number,
  pagination?: { offset: number; limit: number; hasMore: boolean }
): NextResponse {
  const response: RasaResponse<T> = {
    success: true,
    data,
    total: total ?? (Array.isArray(data) ? data.length : 1),
    context,
    ...(pagination && { 
      pagination: {
        ...pagination,
        nextOffset: pagination.hasMore ? pagination.offset + pagination.limit : undefined
      }
    })
  };
  
  return NextResponse.json(response, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache'
    }
  });
}

export function createRasaErrorResponse(message: string, context: string): NextResponse {
  const response: RasaErrorResponse = {
    success: false,
    data: [],
    total: 0,
    context,
    message
  };
  
  return NextResponse.json(response, {
    status: 400,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

export async function extractRasaRequest(req: Request): Promise<RasaExpertRequest> {
  try {
    const body = await req.json();
    return {
      entity_value: body.entity_value || '',
      context: body.context || 'general',
      limit: Math.max(1, Math.min(body.limit || 5, 50)), // Bounded between 1-50
      offset: Math.max(0, body.offset || 0),
      expert_name: body.expert_name,
      current_workplace: body.current_workplace,
      graduated_school: body.graduated_school,
      previous_workplace: body.previous_workplace,
      degree: body.degree,
      academic_title: body.academic_title,
      major: body.major,
      position: body.position,
      language: body.language
    };
  } catch (error) {
    throw new Error('Invalid request body format');
  }
}

// ============ DATA ENRICHMENT ============

export async function enrichExpertWithRelations(
  expert: ExpertResult, 
  queries: ExpertQueries
): Promise<ExpertWithRelations> {
  const relations = await queries.getAllExpertRelations(expert.id);
  
  return {
    expert,
    educations: relations.educations,
    workHistories: relations.workHistories,
    publications: relations.publications,
    projects: relations.projects,
    languages: relations.languages
  };
}

export async function batchEnrichExperts(
  experts: ExpertResult[],
  queries: ExpertQueries,
  batchSize: number = 5
): Promise<ExpertWithRelations[]> {
  const results: ExpertWithRelations[] = [];
  
  for (let i = 0; i < experts.length; i += batchSize) {
    const batch = experts.slice(i, i + batchSize);
    const enrichedBatch = await Promise.all(
      batch.map(expert => enrichExpertWithRelations(expert, queries))
    );
    results.push(...enrichedBatch);
  }
  
  return results;
}

// ============ JOIN DATA TRANSFORMATION ============

export function transformEducationJoinToExperts(joinedData: ExpertEducationJoin[]): ExpertWithRelations[] {
  const expertMap = new Map<number, ExpertWithRelations>();

  joinedData.forEach(row => {
    if (!expertMap.has(row.id)) {
      expertMap.set(row.id, {
        expert: {
          id: row.id,
          fullName: row.fullName,
          birthYear: row.birthYear,
          gender: row.gender,
          academicTitle: row.academicTitle,
          academicTitleYear: row.academicTitleYear,
          degree: row.degree,
          degreeYear: row.degreeYear,
          position: row.position,
          currentWork: row.currentWork,
          organization: row.organization,
          email: row.email,
          phone: row.phone,
          deleted: row.deleted
        },
        educations: [],
        workHistories: [],
        publications: [],
        projects: [],
        languages: []
      });
    }

    const expert = expertMap.get(row.id)!;
    expert.educations.push({
      id: row.educationId,
      expertId: row.id,
      year: row.year,
      school: row.school,
      major: row.major,
      deleted: false
    });
  });

  return Array.from(expertMap.values());
}

export function transformWorkHistoryJoinToExperts(joinedData: ExpertWorkHistoryJoin[]): ExpertWithRelations[] {
  const expertMap = new Map<number, ExpertWithRelations>();

  joinedData.forEach(row => {
    if (!expertMap.has(row.id)) {
      expertMap.set(row.id, {
        expert: {
          id: row.id,
          fullName: row.fullName,
          birthYear: row.birthYear,
          gender: row.gender,
          academicTitle: row.academicTitle,
          academicTitleYear: row.academicTitleYear,
          degree: row.degree,
          degreeYear: row.degreeYear,
          position: row.position,
          currentWork: row.currentWork,
          organization: row.organization,
          email: row.email,
          phone: row.phone,
          deleted: row.deleted
        },
        educations: [],
        workHistories: [],
        publications: [],
        projects: [],
        languages: []
      });
    }

    const expert = expertMap.get(row.id)!;
    expert.workHistories.push({
      id: row.workHistoryId,
      expertId: row.id,
      startYear: row.startYear,
      endYear: row.endYear,
      workplace: row.workplace,
      position: row.workPosition, // Use workPosition from join
      field: row.field,
      deleted: false
    });
  });

  return Array.from(expertMap.values());
}

export function transformLanguageJoinToExperts(joinedData: ExpertLanguageJoin[]): ExpertWithRelations[] {
  const expertMap = new Map<number, ExpertWithRelations>();

  joinedData.forEach(row => {
    if (!expertMap.has(row.id)) {
      expertMap.set(row.id, {
        expert: {
          id: row.id,
          fullName: row.fullName,
          birthYear: row.birthYear,
          gender: row.gender,
          academicTitle: row.academicTitle,
          academicTitleYear: row.academicTitleYear,
          degree: row.degree,
          degreeYear: row.degreeYear,
          position: row.position,
          currentWork: row.currentWork,
          organization: row.organization,
          email: row.email,
          phone: row.phone,
          deleted: row.deleted
        },
        educations: [],
        workHistories: [],
        publications: [],
        projects: [],
        languages: []
      });
    }

    const expert = expertMap.get(row.id)!;
    expert.languages.push({
      id: row.languageId,
      expertId: row.id,
      language: row.languageName,
      listening: row.listening,
      speaking: row.speaking,
      reading: row.reading,
      writing: row.writing,
      deleted: false
    });
  });

  return Array.from(expertMap.values());
}

// ============ CONTEXT DETECTION ============

export function detectSearchContext(userMessage: string): string {
  const message = userMessage.toLowerCase();

  if (message.includes('hiện') || message.includes('đang làm') || message.includes('currently') || message.includes('working at')) {
    return 'current_workplace';
  }

  if (message.includes('tốt nghiệp') || message.includes('học') || message.includes('graduated') || message.includes('studied')) {
    return 'graduated_school';
  }

  if (message.includes('đã làm') || message.includes('từng làm') || message.includes('cũ') || message.includes('former') || message.includes('previous')) {
    return 'previous_workplace';
  }

  if (message.includes('ngoại ngữ') || message.includes('ngôn ngữ') || message.includes('language') || message.includes('biết')) {
    return 'language';
  }

  return 'general';
}

export function getSearchFieldFromContext(context: string): 'organization' | 'school' | 'workplace' | 'general' {
  switch (context) {
    case 'current_workplace':
      return 'organization';
    case 'graduated_school':
      return 'school';
    case 'previous_workplace':
      return 'workplace';
    default:
      return 'general';
  }
}

export function getSearchContextInfo(context: string): SearchContext {
  switch (context) {
    case 'current_workplace':
      return { type: 'current_workplace', field: 'organization', table: 'expert' };
    case 'graduated_school':
      return { type: 'graduated_school', field: 'school', table: 'education' };
    case 'previous_workplace':
      return { type: 'previous_workplace', field: 'workplace', table: 'workhistory' };
    case 'language':
      return { type: 'language', field: 'language', table: 'language' };
    default:
      return { type: 'general', field: 'fullName', table: 'expert' };
  }
}

// ============ FORMATTING HELPERS ============

export function formatPublicationStatsForRasa(
  expert: ExpertResult,
  stats: { total: number; byType: Record<string, number>; byYear: Record<string, number> },
  recentPublications: PublicationResult[]
): RasaPublicationStats {
  return {
    expert_name: expert.fullName,
    total_publications: stats.total,
    by_type: stats.byType,
    by_year: stats.byYear,
    recent_publications: recentPublications.slice(0, 3)
  };
}

export function formatProjectStatsForRasa(
  expert: ExpertResult,
  stats: { total: number; byStatus: Record<string, number>; byRole: Record<string, number> },
  recentProjects: ProjectResult[]
): RasaProjectStats {
  return {
    expert_name: expert.fullName,
    total_projects: stats.total,
    by_status: stats.byStatus,
    by_role: stats.byRole,
    recent_projects: recentProjects.slice(0, 3)
  };
}

export function formatLanguagesForRasa(
  expert: ExpertResult,
  languages: LanguageResult[]
): RasaLanguageSummary {
  return {
    expert_name: expert.fullName,
    languages: languages.map(lang => ({
      language: lang.language || 'Unknown',
      proficiency: {
        listening: lang.listening || 'Not specified',
        speaking: lang.speaking || 'Not specified',
        reading: lang.reading || 'Not specified',
        writing: lang.writing || 'Not specified'
      }
    }))
  };
}

// ============ PERFORMANCE OPTIMIZATION ============

export function createLightweightRasaResponse(
  experts: ExpertResult[],
  context: string,
  total?: number
): NextResponse {
  const lightweightData = experts.map(expert => ({
    expert,
    educations: [],
    workHistories: [],
    publications: [],
    projects: [],
    languages: []
  }));

  return createRasaResponse(lightweightData, context, total);
}

export function normalizeEntityValue(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd');
}

// ============ DEBUG & LOGGING ============

export function logSearchMetrics(
  context: string,
  entityValue: string,
  resultCount: number,
  duration: number
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 Search Metrics: ${context} | "${entityValue}" | ${resultCount} results | ${duration}ms`);
  }
}

export function createErrorContext(error: any, context: string, additionalInfo?: any): any {
  return {
    context,
    error: error.message || 'Unknown error',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    additionalInfo
  };
}

// ============ VALIDATION ============

export function validatePaginationParams(limit?: number, offset?: number): { limit: number; offset: number } {
  return {
    limit: Math.max(1, Math.min(limit || 5, 50)),
    offset: Math.max(0, offset || 0)
  };
}

export function validateEntityValue(entityValue: string): string {
  if (!entityValue || typeof entityValue !== 'string') {
    throw new Error('Entity value must be a non-empty string');
  }
  
  const trimmed = entityValue.trim();
  if (trimmed.length === 0) {
    throw new Error('Entity value cannot be empty or whitespace only');
  }
  
  if (trimmed.length > 200) {
    throw new Error('Entity value too long (max 200 characters)');
  }
  
  return trimmed;
}