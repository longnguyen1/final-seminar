import { PrismaClient } from '@prisma/client';
import { 
  ExpertResult, 
  EducationResult, 
  WorkHistoryResult,
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
  ExpertWithRelations
} from './types';

export class ExpertQueries {
  constructor(private prisma: PrismaClient) {}

  // ============ GENERIC EXPERT SEARCH ============

  /**
   * Generic search for Expert by a single field (LIKE, case-insensitive)
   */
  private async searchExpertByField(
    field: 'fullName' | 'organization' | 'degree' | 'academicTitle',
    value: string
  ): Promise<ExpertResult[]> {
    return await this.prisma.$queryRaw<ExpertResult[]>`
      SELECT 
        e.id, e.fullName, e.birthYear, e.gender, e.academicTitle, 
        e.academicTitleYear, e.degree, e.degreeYear, e.position, 
        e.currentWork, e.organization, e.email, e.phone, e.deleted
      FROM Expert e
      WHERE e.deleted = false 
        AND LOWER(e.${field}) LIKE LOWER(${`%${value}%`})
      ORDER BY e.fullName ASC
    `;
  }

  // ============ EXPERT SEARCH QUERIES ============

  async searchByName(name: string): Promise<ExpertResult[]> {
    return this.searchExpertByField('fullName', name);
  }

  async searchByOrganization(org: string): Promise<ExpertResult[]> {
    return this.searchExpertByField('organization', org);
  }

  async searchByDegree(degree: string): Promise<ExpertResult[]> {
    return this.searchExpertByField('degree', degree);
  }

  async searchByAcademicTitle(title: string): Promise<ExpertResult[]> {
    return this.searchExpertByField('academicTitle', title);
  }

  // ============ EDUCATION JOIN QUERIES ============

  async searchBySchool(school: string): Promise<ExpertEducationJoin[]> {
    return await this.prisma.$queryRaw<ExpertEducationJoin[]>`
      SELECT 
        e.id, e.fullName, e.birthYear, e.gender, e.academicTitle, e.academicTitleYear,
        e.degree, e.degreeYear, e.position, e.currentWork, e.organization, 
        e.email, e.phone, e.deleted,
        ed.id as educationId, ed.year, ed.school, ed.major
      FROM Expert e
      INNER JOIN Education ed ON e.id = ed.expertId
      WHERE e.deleted = false 
        AND ed.deleted = false
        AND LOWER(ed.school) LIKE LOWER(${`%${school}%`})
      ORDER BY e.fullName ASC, ed.year DESC
    `;
  }

  async searchByMajor(major: string): Promise<ExpertEducationJoin[]> {
    return await this.prisma.$queryRaw<ExpertEducationJoin[]>`
      SELECT 
        e.id, e.fullName, e.birthYear, e.gender, e.academicTitle, e.academicTitleYear,
        e.degree, e.degreeYear, e.position, e.currentWork, e.organization, 
        e.email, e.phone, e.deleted, 
        ed.id as educationId, ed.year, ed.school, ed.major
      FROM Expert e
      INNER JOIN Education ed ON e.id = ed.expertId
      WHERE e.deleted = false 
        AND ed.deleted = false
        AND LOWER(ed.major) LIKE LOWER(${`%${major}%`})
      ORDER BY e.fullName ASC, ed.year DESC
    `;
  }

  // ============ WORK HISTORY JOIN QUERIES ============

  async searchByWorkplace(workplace: string): Promise<ExpertWorkHistoryJoin[]> {
    return await this.prisma.$queryRaw<ExpertWorkHistoryJoin[]>`
      SELECT 
        e.id, e.fullName, e.birthYear, e.gender, e.academicTitle, e.academicTitleYear,
        e.degree, e.degreeYear, e.position, e.currentWork, e.organization, 
        e.email, e.phone, e.deleted,
        wh.id as workHistoryId, wh.startYear, wh.endYear, 
        wh.position as workPosition, wh.workplace, wh.field
      FROM Expert e
      INNER JOIN WorkHistory wh ON e.id = wh.expertId
      WHERE e.deleted = false 
        AND wh.deleted = false
        AND LOWER(wh.workplace) LIKE LOWER(${`%${workplace}%`})
      ORDER BY e.fullName ASC, wh.startYear DESC
    `;
  }

  async searchByPosition(position: string): Promise<ExpertWorkHistoryJoin[]> {
    return await this.prisma.$queryRaw<ExpertWorkHistoryJoin[]>`
      SELECT 
        e.id, e.fullName, e.birthYear, e.gender, e.academicTitle, e.academicTitleYear,
        e.degree, e.degreeYear, e.position, e.currentWork, e.organization, 
        e.email, e.phone, e.deleted,
        wh.id as workHistoryId, wh.startYear, wh.endYear, 
        wh.position as workPosition, wh.workplace, wh.field
      FROM Expert e
      INNER JOIN WorkHistory wh ON e.id = wh.expertId
      WHERE e.deleted = false 
        AND wh.deleted = false
        AND (
          LOWER(wh.position) LIKE LOWER(${`%${position}%`}) OR
          LOWER(e.position) LIKE LOWER(${`%${position}%`})
        )
      ORDER BY e.fullName ASC, wh.startYear DESC
    `;
  }

  // queries.ts
async searchByWorkPositionAndOrWorkplace(
  position: string,
  workplace: string,
  mode: 'and' | 'or' | 'position' | 'workplace' = 'and'
): Promise<ExpertWorkHistoryJoin[]> {
  let where = 'e.deleted = false AND wh.deleted = false';
  const params: any[] = [];

  if (mode === 'and') {
    where += ' AND LOWER(wh.position) LIKE ? AND LOWER(wh.workplace) LIKE ?';
    params.push(`%${position.toLowerCase()}%`, `%${workplace.toLowerCase()}%`);
  } else if (mode === 'or') {
    where += ' AND (LOWER(wh.position) LIKE ? OR LOWER(wh.workplace) LIKE ?)';
    params.push(`%${position.toLowerCase()}%`, `%${workplace.toLowerCase()}%`);
  } else if (mode === 'position') {
    where += ' AND LOWER(wh.position) LIKE ?';
    params.push(`%${position.toLowerCase()}%`);
  } else if (mode === 'workplace') {
    where += ' AND LOWER(wh.workplace) LIKE ?';
    params.push(`%${workplace.toLowerCase()}%`);
  }

  const sql = `
  SELECT 
    e.id, e.fullName, e.birthYear, e.gender, e.academicTitle, e.academicTitleYear,
    e.degree, e.degreeYear, e.position, e.currentWork, e.organization, 
    e.email, e.phone, e.deleted,
    wh.id as workHistoryId, wh.startYear, wh.endYear, 
    wh.position as workPosition, wh.workplace, wh.field,
    wh.expertId as expertId -- Thêm dòng này
  FROM Expert e
  INNER JOIN WorkHistory wh ON e.id = wh.expertId
  WHERE ${where}
  ORDER BY e.fullName ASC, wh.startYear DESC
`;

  return await this.prisma.$queryRawUnsafe<ExpertWorkHistoryJoin[]>(sql, ...params);
}

  // ============ LANGUAGE JOIN QUERIES ============

  async searchByLanguage(language: string): Promise<ExpertLanguageJoin[]> {
    return await this.prisma.$queryRaw<ExpertLanguageJoin[]>`
      SELECT 
        e.id, e.fullName, e.birthYear, e.gender, e.academicTitle, e.academicTitleYear,
        e.degree, e.degreeYear, e.position, e.currentWork, e.organization, 
        e.email, e.phone, e.deleted,
        l.id as languageId, l.language as languageName, 
        l.listening, l.speaking, l.reading, l.writing
      FROM Expert e
      INNER JOIN Language l ON e.id = l.expertId
      WHERE e.deleted = false 
        AND l.deleted = false
        AND LOWER(l.language) LIKE LOWER(${`%${language}%`})
      ORDER BY e.fullName ASC, l.language ASC
    `;
  }

  // ============ RELATION QUERIES ============

async getExpertsByIds(ids: number[], options?: { limit?: number; offset?: number }): Promise<ExpertResult[]> {
  if (!ids || ids.length === 0) return [];
  const { limit = 10, offset = 0 } = options || {};
  return await this.prisma.$queryRaw<ExpertResult[]>`
    SELECT 
      id, fullName, birthYear, gender, academicTitle, academicTitleYear,
      degree, degreeYear, position, currentWork, organization, 
      email, phone, deleted
    FROM Expert
    WHERE deleted = false AND id IN (${(ids)})
    ORDER BY fullName ASC
    LIMIT ${limit} OFFSET ${offset}
  `;
}

  async getEducationsByExpertId(expertId: number): Promise<EducationResult[]> {
    return await this.prisma.$queryRaw<EducationResult[]>`
      SELECT * FROM Education 
      WHERE expertId = ${expertId} AND deleted = false
      ORDER BY year DESC
    `;
  }

  async getWorkHistoriesByExpertId(expertId: number): Promise<WorkHistoryResult[]> {
    return await this.prisma.$queryRaw<WorkHistoryResult[]>`
      SELECT * FROM WorkHistory 
      WHERE expertId = ${expertId} AND deleted = false
      ORDER BY startYear DESC
    `;
  }

  async getPublicationsByExpertId(expertId: number): Promise<PublicationResult[]> {
    return await this.prisma.$queryRaw<PublicationResult[]>`
      SELECT * FROM Publication 
      WHERE expertId = ${expertId} AND deleted = false
      ORDER BY year DESC, title ASC
    `;
  }

  async getProjectsByExpertId(expertId: number): Promise<ProjectResult[]> {
    return await this.prisma.$queryRaw<ProjectResult[]>`
      SELECT * FROM Project 
      WHERE expertId = ${expertId} AND deleted = false
      ORDER BY startYear DESC, title ASC
    `;
  }

  async getLanguagesByExpertId(expertId: number): Promise<LanguageResult[]> {
    return await this.prisma.$queryRaw<LanguageResult[]>`
      SELECT * FROM Language 
      WHERE expertId = ${expertId} AND deleted = false
      ORDER BY language ASC
    `;
  }

  // ============ RASA-SPECIFIC QUERIES ============

  async findExpertByExactName(name: string): Promise<ExpertResult | null> {
    const results = await this.prisma.$queryRaw<ExpertResult[]>`
      SELECT 
        e.id, e.fullName, e.birthYear, e.gender, e.academicTitle, 
        e.academicTitleYear, e.degree, e.degreeYear, e.position, 
        e.currentWork, e.organization, e.email, e.phone, e.deleted
      FROM Expert e
      WHERE e.deleted = false 
        AND (
          LOWER(e.fullName) = LOWER(${name}) OR
          LOWER(e.fullName) LIKE LOWER(${`%${name}%`})
        )
      ORDER BY 
        CASE WHEN LOWER(e.fullName) = LOWER(${name}) THEN 1 ELSE 2 END,
        e.fullName ASC
      LIMIT 1
    `;

    return results.length > 0 ? results[0] : null;
  }

  async getWorkHistoriesByExpertIds(expertIds: number[]): Promise<WorkHistoryResult[]> {
  if (!expertIds || expertIds.length === 0) return [];
  return await this.prisma.$queryRaw<WorkHistoryResult[]>`
    SELECT * FROM WorkHistory 
    WHERE expertId IN (${expertIds}) AND deleted = false
    ORDER BY expertId ASC, startYear DESC
  `;
}

  async getExpertEducation(expertId: number): Promise<EducationResult[]> {
    return await this.prisma.$queryRaw<EducationResult[]>`
      SELECT 
        ed.id, ed.expertId, ed.year, ed.school, ed.major, ed.deleted
      FROM Education ed
      WHERE ed.expertId = ${expertId} 
        AND ed.deleted = false
      ORDER BY ed.year DESC
    `;
  }

  async getExpertWorkHistory(expertId: number): Promise<WorkHistoryResult[]> {
    return await this.prisma.$queryRaw<WorkHistoryResult[]>`
      SELECT 
        wh.id, wh.expertId, wh.startYear, wh.endYear, wh.workplace, 
        wh.position, wh.field, wh.deleted
      FROM WorkHistory wh
      WHERE wh.expertId = ${expertId} 
        AND wh.deleted = false
      ORDER BY wh.startYear DESC
    `;
  }

  async getExpertPublications(expertId: number): Promise<PublicationResult[]> {
    return await this.prisma.$queryRaw<PublicationResult[]>`
      SELECT 
        p.id, p.expertId, p.title, p.year, p.type, p.author, p.place, p.deleted
      FROM Publication p
      WHERE p.expertId = ${expertId} 
        AND p.deleted = false
      ORDER BY p.year DESC
    `;
  }

  async getExpertProjects(expertId: number): Promise<ProjectResult[]> {
    return await this.prisma.$queryRaw<ProjectResult[]>`
      SELECT 
        pr.id, pr.expertId, pr.title, pr.startYear, pr.endYear, 
        pr.role, pr.status, pr.deleted
      FROM Project pr
      WHERE pr.expertId = ${expertId} 
        AND pr.deleted = false
      ORDER BY pr.startYear DESC
    `;
  }

  async getExpertLanguages(expertId: number): Promise<LanguageResult[]> {
    return await this.prisma.$queryRaw<LanguageResult[]>`
      SELECT 
        l.id, l.expertId, l.language, l.listening, l.speaking, 
        l.reading, l.writing, l.deleted
      FROM Language l
      WHERE l.expertId = ${expertId} 
        AND l.deleted = false
      ORDER BY l.language ASC
    `;
  }

  async getAllExpertRelations(expertId: number): Promise<ExpertRelationsBundle> {
    const [educations, workHistories, publications, projects, languages] = await Promise.all([
      this.getEducationsByExpertId(expertId),
      this.getWorkHistoriesByExpertId(expertId),
      this.getPublicationsByExpertId(expertId),
      this.getProjectsByExpertId(expertId),
      this.getLanguagesByExpertId(expertId)
    ]);

    return {
      educations,
      workHistories,
      publications,
      projects,
      languages
    };
  }


  async getPublicationsPaginated(expertId: number, limit: number = 5, offset: number = 0): Promise<{
    publications: PublicationResult[];
    hasMore: boolean;
    total: number;
  }> {
    const publications = await this.prisma.$queryRaw<PublicationResult[]>`
      SELECT * FROM Publication 
      WHERE expertId = ${expertId} AND deleted = false
      ORDER BY year DESC, title ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalResult = await this.prisma.$queryRaw<CountResult[]>`
      SELECT COUNT(*) as count FROM Publication 
      WHERE expertId = ${expertId} AND deleted = false
    `;

    const total = Number(totalResult[0].count);
    const hasMore = (offset + limit) < total;

    return { publications, hasMore, total };
  }

  async getProjectsPaginated(expertId: number, limit: number = 5, offset: number = 0): Promise<{
    projects: ProjectResult[];
    hasMore: boolean;
    total: number;
  }> {
    const projects = await this.prisma.$queryRaw<ProjectResult[]>`
      SELECT * FROM Project 
      WHERE expertId = ${expertId} AND deleted = false
      ORDER BY startYear DESC, title ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalResult = await this.prisma.$queryRaw<CountResult[]>`
      SELECT COUNT(*) as count FROM Project 
      WHERE expertId = ${expertId} AND deleted = false
    `;

    const total = Number(totalResult[0].count);
    const hasMore = (offset + limit) < total;

    return { projects, hasMore, total };
  }

  async searchWithVariations(entityValues: string[], searchField: 'organization' | 'school' | 'workplace'): Promise<ExpertResult[]> {
    if (entityValues.length === 0) return [];

    const likeClauses = entityValues.map((_, index) => `LOWER(e.${searchField === 'organization' ? 'organization' : searchField === 'school' ? 'ed.school' : 'wh.workplace'}) LIKE LOWER($${index + 1})`).join(' OR ');
    const likeValues = entityValues.map(value => `%${value}%`);

    if (searchField === 'organization') {
      return await this.prisma.$queryRaw<ExpertResult[]>`
        SELECT DISTINCT
          e.id, e.fullName, e.birthYear, e.gender, e.academicTitle, e.academicTitleYear,
          e.degree, e.degreeYear, e.position, e.currentWork, e.organization, 
          e.email, e.phone, e.deleted
        WHERE e.deleted = false AND (${likeClauses})
        ORDER BY e.fullName ASC
      `;
    } else if (searchField === 'school') {
      return await this.prisma.$queryRaw<ExpertResult[]>`
        SELECT DISTINCT
          e.id, e.fullName, e.birthYear, e.gender, e.academicTitle, e.academicTitleYear,
          e.degree, e.degreeYear, e.position, e.currentWork, e.organization, 
          e.email, e.phone, e.deleted, e.createdAt, e.updatedAt
        FROM Expert e
        INNER JOIN Education ed ON e.id = ed.expertId
        WHERE e.deleted = false AND ed.deleted = false AND (${likeClauses})
        ORDER BY e.fullName ASC
      `;
    } else if (searchField === 'workplace') {
      return await this.prisma.$queryRaw<ExpertResult[]>`
        SELECT DISTINCT
          e.id, e.fullName, e.birthYear, e.gender, e.academicTitle, e.academicTitleYear,
          e.degree, e.degreeYear, e.position, e.currentWork, e.organization, 
          e.email, e.phone, e.deleted
        FROM Expert e
        INNER JOIN WorkHistory wh ON e.id = wh.expertId
        WHERE e.deleted = false AND wh.deleted = false AND (${likeClauses})
        ORDER BY e.fullName ASC
      `;
    }

    return [];
  }

  /**
 * Tìm chuyên gia thỏa mãn đồng thời filter education và workhistory (giao tại DB)
 */
async searchExpertByEducationAndWork(
  educationFilter: { school?: string; major?: string },
  workFilter: { workplace?: string; position?: string },
  options?: { limit?: number; offset?: number }
): Promise<ExpertResult[]> {
  const { school, major } = educationFilter;
  const { workplace, position } = workFilter;
  const { limit = 10, offset = 0 } = options || {};

  let educationExists = '';
  let workExists = '';
  const params: any[] = [];

  if (school || major) {
    let eduConds: string[] = [];
    if (school) {
      eduConds.push('LOWER(ed.school) LIKE ?');
      params.push(`%${school.toLowerCase()}%`);
    }
    if (major) {
      eduConds.push('LOWER(ed.major) LIKE ?');
      params.push(`%${major.toLowerCase()}%`);
    }
    educationExists = `EXISTS (
      SELECT 1 FROM Education ed
      WHERE ed.expertId = e.id AND ed.deleted = false AND (${eduConds.join(' OR ')})
    )`;
  }

  if (workplace || position) {
    let workConds: string[] = [];
    if (workplace) {
      workConds.push('LOWER(wh.workplace) LIKE ?');
      params.push(`%${workplace.toLowerCase()}%`);
    }
    if (position) {
      workConds.push('LOWER(wh.position) LIKE ?');
      params.push(`%${position.toLowerCase()}%`);
    }
    workExists = `EXISTS (
      SELECT 1 FROM WorkHistory wh
      WHERE wh.expertId = e.id AND wh.deleted = false AND (${workConds.join(' OR ')})
    )`;
  }

  let where = 'e.deleted = false';
  if (educationExists) where += ` AND ${educationExists}`;
  if (workExists) where += ` AND ${workExists}`;

  const sql = `
    SELECT 
      e.id, e.fullName, e.birthYear, e.gender, e.academicTitle, e.academicTitleYear,
      e.degree, e.degreeYear, e.position, e.currentWork, e.organization, 
      e.email, e.phone, e.deleted
    FROM Expert e
    WHERE ${where}
    ORDER BY e.fullName ASC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return await this.prisma.$queryRawUnsafe<ExpertResult[]>(sql, ...params);
  }
}