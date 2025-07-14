// ===== EXISTING TYPES (Keep unchanged) =====
export interface Expert {
  id: number;
  fullName: string;
  organization?: string | null;
  academicTitle?: string | null;
  degree?: string | null;
  position?: string | null;
  birthYear?: number | null;
  phone?: string | null;
  email?: string | null;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Education {
  id: number;
  expertId: number;
  year?: number | null;
  school?: string | null;
  major?: string | null;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkHistory {
  id: number;
  expertId: number;
  startYear?: number | null;
  endYear?: number | null;
  workplace?: string | null;
  position?: string | null;
  field?: string | null;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Publication {
  id: number;
  expertId: number;
  year?: number | null;
  title?: string | null;
  type?: string | null;
  author?: string | null;
  place?: string | null;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: number;
  expertId: number;
  title?: string | null;
  status?: string | null;
  role?: string | null;
  startYear?: number | null;
  endYear?: number | null;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Language {
  id: number;
  expertId: number;
  language?: string | null;
  listening?: string | null;
  speaking?: string | null;
  reading?: string | null;
  writing?: string | null;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============ BASE RESULT TYPES FROM DATABASE ============

export interface ExpertResult {
  id: number;
  fullName: string;
  birthYear: number | null;
  gender: string | null;
  academicTitle: string | null;
  academicTitleYear: number | null;
  degree: string | null;
  degreeYear: number | null;
  position: string | null;
  currentWork: string | null;
  organization: string | null;
  email: string | null;
  phone: string | null;
  deleted: boolean;
}

export interface EducationResult {
  id: number;
  expertId: number;
  year: number | null;
  school: string | null;
  major: string | null;
  deleted: boolean;
}

export interface WorkHistoryResult {
  id: number;
  expertId: number;
  startYear: number | null;
  endYear: number | null;
  workplace: string | null;
  position: string | null;
  field: string | null;
  deleted: boolean;
}

export interface PublicationResult {
  id: number;
  expertId: number;
  title: string | null;
  year: number | null;
  type: string | null;
  author: string | null;
  place: string | null;
  deleted: boolean;
}

export interface ProjectResult {
  id: number;
  expertId: number;
  title: string | null;
  startYear: number | null;
  endYear: number | null;
  role: string | null;
  status: string | null;
  deleted: boolean;
}

export interface LanguageResult {
  id: number;
  expertId: number;
  language: string | null;
  listening: string | null;
  speaking: string | null;
  reading: string | null;
  writing: string | null;
  deleted: boolean;
}

// ============ JOINED QUERY RESULT TYPES ============

export interface ExpertEducationJoin extends ExpertResult {
  educationId: number;
  year: number | null;
  school: string | null;
  major: string | null;
}

export interface ExpertWorkHistoryJoin extends ExpertResult {
  workHistoryId: number;
  startYear: number | null;
  endYear: number | null;
  workplace: string | null;
  workPosition: string | null; // Renamed to avoid conflict with expert.position
  field: string | null;
  expertId: number;
}

export interface ExpertPublicationJoin extends ExpertResult {
  publicationId: number;
  publicationTitle: string | null;
  publicationYear: number | null;
  publicationType: string | null;
  publicationAuthor: string | null;
  publicationPlace: string | null;
}

export interface ExpertProjectJoin extends ExpertResult {
  projectId: number;
  projectTitle: string | null;
  projectStartYear: number | null;
  projectEndYear: number | null;
  projectRole: string | null;
  projectStatus: string | null;
}

export interface ExpertLanguageJoin extends ExpertResult {
  languageId: number;
  languageName: string | null;
  listening: string | null;
  speaking: string | null;
  reading: string | null;
  writing: string | null;
}

// ============ AGGREGATION RESULT TYPES ============

export interface PublicationStatsResult {
  type: string;
  year: number;
  count: bigint;
}

export interface ProjectStatsResult {
  status: string;
  role: string;
  count: bigint;
}

export interface CountResult {
  count: bigint;
}

// ============ COMPOSITE TYPES ============

export interface ExpertWithRelations {
  expert: ExpertResult;
  educations: EducationResult[];
  workHistories: WorkHistoryResult[];
  publications: PublicationResult[];
  projects: ProjectResult[];
  languages: LanguageResult[];
}

export interface ExpertRelationsBundle {
  educations: EducationResult[];
  workHistories: WorkHistoryResult[];
  publications: PublicationResult[];
  projects: ProjectResult[];
  languages: LanguageResult[];
}

// ============ RASA REQUEST/RESPONSE TYPES ============

export interface RasaBaseRequest {
  entity_value: string;
  context?: string;
  limit?: number;
  offset?: number;
}

export interface RasaExpertRequest extends RasaBaseRequest {
  expert_name?: string;
  current_workplace?: string;
  graduated_school?: string;
  previous_workplace?: string;
  degree?: string;
  academic_title?: string;
  major?: string;
  position?: string;
  language?: string;
  enrich?: boolean;
}

export interface RasaResponse<T> {
  success: boolean;
  data: T;
  total: number;
  context: string;
  message?: string;
  pagination?: {
    offset: number;
    limit: number;
    hasMore: boolean;
    nextOffset?: number;
  };
}

export interface RasaErrorResponse {
  success: false;
  data: [];
  total: 0;
  context: string;
  message: string;
}

export interface RasaPublicationStats {
  expert_name: string;
  total_publications: number;
  by_type: Record<string, number>;
  by_year: Record<string, number>;
  recent_publications: PublicationResult[];
}

export interface RasaProjectStats {
  expert_name: string;
  total_projects: number;
  by_status: Record<string, number>;
  by_role: Record<string, number>;
  recent_projects: ProjectResult[];
}

export interface RasaPaginatedList<T> {
  items: T[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface RasaLanguageSummary {
  expert_name: string;
  languages: Array<{
    language: string;
    proficiency: {
      listening: string;
      speaking: string;
      reading: string;
      writing: string;
    };
  }>;
}

// ============ SEARCH FILTER TYPES ============

export interface SearchFilters {
  name?: string;
  organization?: string;
  school?: string;
  workplace?: string;
  degree?: string;
  academicTitle?: string;
  major?: string;
  position?: string;
  language?: string;
  limit?: number;
  offset?: number;
}

export interface SearchContext {
  type: 'current_workplace' | 'graduated_school' | 'previous_workplace' | 'language' | 'general';
  field: string;
  table: 'expert' | 'education' | 'workhistory' | 'language';
}