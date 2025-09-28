// @ts-nocheck
/**
 * Code Generation API Service - RTK Query endpoints for SpringBoot code generation
 * Based on SpringBoot Generator API v1 specification
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { anonymousBaseQuery } from '@/services/apiService';
import type {
  GenerationRequest,
  GeneratedProject,
  GenerationTemplate,
  GenerationHistoryEntry,
  GenerationProgress,
  GenerationStatistics,
  UserGenerationActivity,
  ProjectFileStructure,
  ProjectMetadata,
  TemplateValidationResult,
  CreateGenerationRequestRequest,
  UpdateGenerationRequestRequest,
  CloneGenerationRequestRequest,
  ExtendProjectExpirationRequest,
  TemplateTestRenderRequest,
  TemplateSearchRequest,
  GenerationRequestFilterOptions,
  GeneratedProjectFilterOptions,
  TemplateFilterOptions,
  HistoryFilterOptions,
  TimelineOptions,
  ExportOptions,
  PaginatedResponse,
  UUID
} from '@/types/generation';

// Query parameters for filtering and pagination
interface RequestListParams extends GenerationRequestFilterOptions {
  ordering?: string;
  page?: number;
  pagesize?: number;
}

interface ProjectListParams extends GeneratedProjectFilterOptions {
  ordering?: string;
  page?: number;
  pagesize?: number;
}

interface TemplateListParams extends TemplateFilterOptions {
  ordering?: string;
  page?: number;
  pagesize?: number;
  limit?: number;
}

interface HistoryListParams extends HistoryFilterOptions {
  ordering?: string;
  page?: number;
  pagesize?: number;
}

interface FeaturedTemplatesParams {
  limit?: number;
}

interface PopularTemplatesParams {
  limit?: number;
  period?: 'day' | 'week' | 'month' | 'year';
}

interface HistoryExportParams extends ExportOptions {
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

interface TimelineParams extends TimelineOptions {
  days?: number;
  generationRequest?: UUID;
  granularity?: 'hour' | 'day' | 'week' | 'month';
}

// Create Generation API slice
export const generationApi = createApi({
  reducerPath: 'generationApi',
  baseQuery: anonymousBaseQuery,
  tagTypes: [
    'Request',
    'RequestDetail', 
    'Project', 
    'ProjectDetail',
    'Template',
    'TemplateDetail',
    'History',
    'Statistics',
    'Progress'
  ] as const,
  keepUnusedDataFor: 300, // 5 minutes
  endpoints: (builder) => ({
    // Generation Requests Management
    listRequests: builder.query<PaginatedResponse<GenerationRequest>, RequestListParams>({
      query: (params = {}) => ({
        url: '/api/v1/requests/',
        params,
      }),
      providesTags: ['Request'],
    }),

    createRequest: builder.mutation<GenerationRequest, CreateGenerationRequestRequest>({
      query: (data) => ({
        url: '/api/v1/requests/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Request'],
    }),

    getRequest: builder.query<GenerationRequest, UUID>({
      query: (id) => `/api/v1/requests/${id}/`,
      providesTags: (result, error, id) => [
        { type: 'RequestDetail', id },
        { type: 'Request', id },
      ],
    }),

    updateRequest: builder.mutation<GenerationRequest, { id: UUID; data: UpdateGenerationRequestRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/requests/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'RequestDetail', id },
        { type: 'Request', id },
      ],
    }),

    deleteRequest: builder.mutation<void, UUID>({
      query: (id) => ({
        url: `/api/v1/requests/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Request'],
    }),

    startGeneration: builder.mutation<GenerationRequest, UUID>({
      query: (id) => ({
        url: `/api/v1/requests/${id}/start_generation/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'RequestDetail', id },
        { type: 'Request', id },
        'Progress',
      ],
    }),

    cancelGeneration: builder.mutation<GenerationRequest, UUID>({
      query: (id) => ({
        url: `/api/v1/requests/${id}/cancel_generation/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'RequestDetail', id },
        { type: 'Request', id },
        'Progress',
      ],
    }),

    getProgress: builder.query<GenerationProgress, UUID>({
      query: (id) => `/api/v1/requests/${id}/progress/`,
      providesTags: (result, error, id) => [{ type: 'Progress', id }],
      // Poll for progress updates every 2 seconds during generation
      pollingInterval: 2000,
    }),

    downloadRequest: builder.query<{ downloadUrl: string; fileName: string }, UUID>({
      query: (id) => `/api/v1/requests/${id}/download/`,
    }),

    retryRequest: builder.mutation<GenerationRequest, UUID>({
      query: (id) => ({
        url: `/api/v1/requests/${id}/retry/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'RequestDetail', id },
        { type: 'Request', id },
        'Progress',
      ],
    }),

    cloneRequest: builder.mutation<GenerationRequest, { id: UUID; data: CloneGenerationRequestRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/requests/${id}/clone/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Request'],
    }),

    getRequestStatistics: builder.query<GenerationStatistics, void>({
      query: () => '/api/v1/requests/statistics/',
      providesTags: ['Statistics'],
    }),

    // Generated Projects Management
    listProjects: builder.query<PaginatedResponse<GeneratedProject>, ProjectListParams>({
      query: (params = {}) => ({
        url: '/api/v1/projects/',
        params,
      }),
      providesTags: ['Project'],
    }),

    getProject: builder.query<GeneratedProject, UUID>({
      query: (id) => `/api/v1/projects/${id}/`,
      providesTags: (result, error, id) => [
        { type: 'ProjectDetail', id },
        { type: 'Project', id },
      ],
    }),

    updateProject: builder.mutation<GeneratedProject, { id: UUID; data: Partial<GeneratedProject> }>({
      query: ({ id, data }) => ({
        url: `/api/v1/projects/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ProjectDetail', id },
        { type: 'Project', id },
      ],
    }),

    deleteProject: builder.mutation<void, UUID>({
      query: (id) => ({
        url: `/api/v1/projects/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),

    downloadProject: builder.query<{ downloadUrl: string; fileName: string }, UUID>({
      query: (id) => `/api/v1/projects/${id}/download/`,
    }),

    getProjectFileStructure: builder.query<ProjectFileStructure, UUID>({
      query: (id) => `/api/v1/projects/${id}/file_structure/`,
      providesTags: (result, error, id) => [{ type: 'ProjectDetail', id }],
    }),

    getProjectMetadata: builder.query<ProjectMetadata, UUID>({
      query: (id) => `/api/v1/projects/${id}/metadata/`,
      providesTags: (result, error, id) => [{ type: 'ProjectDetail', id }],
    }),

    archiveProject: builder.mutation<GeneratedProject, UUID>({
      query: (id) => ({
        url: `/api/v1/projects/${id}/archive/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'ProjectDetail', id },
        { type: 'Project', id },
      ],
    }),

    restoreProject: builder.mutation<GeneratedProject, UUID>({
      query: (id) => ({
        url: `/api/v1/projects/${id}/restore/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'ProjectDetail', id },
        { type: 'Project', id },
      ],
    }),

    extendProjectExpiration: builder.mutation<GeneratedProject, { id: UUID; data: ExtendProjectExpirationRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/projects/${id}/extend_expiration/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ProjectDetail', id },
        { type: 'Project', id },
      ],
    }),

    // Generation Templates Management
    listTemplates: builder.query<PaginatedResponse<GenerationTemplate>, TemplateListParams>({
      query: (params = {}) => ({
        url: '/api/v1/templates/',
        params,
      }),
      providesTags: ['Template'],
    }),

    getTemplate: builder.query<GenerationTemplate, UUID>({
      query: (id) => `/api/v1/templates/${id}/`,
      providesTags: (result, error, id) => [
        { type: 'TemplateDetail', id },
        { type: 'Template', id },
      ],
    }),

    testTemplateRender: builder.mutation<{ renderedContent: Record<string, string>; errors: string[] }, { id: UUID; data: TemplateTestRenderRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/templates/${id}/test_render/`,
        method: 'POST',
        body: data,
      }),
    }),

    useTemplate: builder.mutation<GenerationTemplate, UUID>({
      query: (id) => ({
        url: `/api/v1/templates/${id}/use_template/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'TemplateDetail', id },
        { type: 'Template', id },
      ],
    }),

    validateTemplate: builder.query<TemplateValidationResult, UUID>({
      query: (id) => `/api/v1/templates/${id}/validate/`,
    }),

    getFeaturedTemplates: builder.query<GenerationTemplate[], FeaturedTemplatesParams>({
      query: (params = {}) => ({
        url: '/api/v1/templates/featured/',
        params,
      }),
      providesTags: ['Template'],
    }),

    getPopularTemplates: builder.query<GenerationTemplate[], PopularTemplatesParams>({
      query: (params = {}) => ({
        url: '/api/v1/templates/popular/',
        params,
      }),
      providesTags: ['Template'],
    }),

    searchTemplates: builder.mutation<PaginatedResponse<GenerationTemplate>, TemplateSearchRequest>({
      query: (data) => ({
        url: '/api/v1/templates/search/',
        method: 'POST',
        body: data,
      }),
    }),

    // Generation History Management
    listHistory: builder.query<PaginatedResponse<GenerationHistoryEntry>, HistoryListParams>({
      query: (params = {}) => ({
        url: '/api/v1/history/',
        params,
      }),
      providesTags: ['History'],
    }),

    getHistoryEntry: builder.query<GenerationHistoryEntry, UUID>({
      query: (id) => `/api/v1/history/${id}/`,
      providesTags: (result, error, id) => [{ type: 'History', id }],
    }),

    exportHistory: builder.query<{ downloadUrl: string; fileName: string }, HistoryExportParams>({
      query: (params = {}) => ({
        url: '/api/v1/history/export/',
        params,
      }),
    }),

    getHistoryTimeline: builder.query<Array<{
      date: string;
      events: Array<{
        id: UUID;
        actionType: string;
        timestamp: string;
        performedBy: number;
        metadata: Record<string, any>;
      }>;
    }>, TimelineParams>({
      query: (params = {}) => ({
        url: '/api/v1/history/timeline/',
        params,
      }),
      providesTags: ['History'],
    }),

    getUserActivity: builder.query<UserGenerationActivity, { period?: string; userId?: number }>({
      query: (params = {}) => ({
        url: '/api/v1/history/user_activity/',
        params,
      }),
      providesTags: ['Statistics'],
    }),

    getActionStatistics: builder.query<{
      actionsByType: Record<string, number>;
      actionsByMonth: Array<{
        month: string;
        count: number;
      }>;
      totalActions: number;
    }, { dateFrom?: string; dateTo?: string }>({
      query: (params = {}) => ({
        url: '/api/v1/history/action_statistics/',
        params,
      }),
      providesTags: ['Statistics'],
    }),

    // Batch operations
    createMultipleRequests: builder.mutation<GenerationRequest[], CreateGenerationRequestRequest[]>({
      query: (requests) => ({
        url: '/api/v1/requests/batch/',
        method: 'POST',
        body: { requests },
      }),
      invalidatesTags: ['Request'],
    }),

    bulkArchiveProjects: builder.mutation<{ archived: number; errors: string[] }, UUID[]>({
      query: (projectIds) => ({
        url: '/api/v1/projects/bulk_archive/',
        method: 'POST',
        body: { projectIds },
      }),
      invalidatesTags: ['Project'],
    }),

    bulkDeleteProjects: builder.mutation<{ deleted: number; errors: string[] }, UUID[]>({
      query: (projectIds) => ({
        url: '/api/v1/projects/bulk_delete/',
        method: 'POST',
        body: { projectIds },
      }),
      invalidatesTags: ['Project'],
    }),

    // Analytics and reporting
    getGenerationAnalytics: builder.query<{
      successRate: number;
      averageGenerationTime: number;
      popularFeatures: Array<{ feature: string; usage: number }>;
      errorPatterns: Array<{ error: string; count: number }>;
      performanceMetrics: {
        p50: number;
        p95: number;
        p99: number;
      };
    }, { dateFrom?: string; dateTo?: string }>({
      query: (params = {}) => ({
        url: '/api/v1/analytics/generation/',
        params,
      }),
      providesTags: ['Statistics'],
    }),
  }),
});

// Export hooks for use in components
export const {
  // Request hooks
  useListRequestsQuery,
  useLazyListRequestsQuery,
  useCreateRequestMutation,
  useGetRequestQuery,
  useLazyGetRequestQuery,
  useUpdateRequestMutation,
  useDeleteRequestMutation,
  useStartGenerationMutation,
  useCancelGenerationMutation,
  useGetProgressQuery,
  useLazyGetProgressQuery,
  useDownloadRequestQuery,
  useLazyDownloadRequestQuery,
  useRetryRequestMutation,
  useCloneRequestMutation,
  useGetRequestStatisticsQuery,

  // Project hooks
  useListProjectsQuery,
  useLazyListProjectsQuery,
  useGetProjectQuery,
  useLazyGetProjectQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useDownloadProjectQuery,
  useLazyDownloadProjectQuery,
  useGetProjectFileStructureQuery,
  useLazyGetProjectFileStructureQuery,
  useGetProjectMetadataQuery,
  useLazyGetProjectMetadataQuery,
  useArchiveProjectMutation,
  useRestoreProjectMutation,
  useExtendProjectExpirationMutation,

  // Template hooks
  useListTemplatesQuery,
  useLazyListTemplatesQuery,
  useGetTemplateQuery,
  useLazyGetTemplateQuery,
  useTestTemplateRenderMutation,
  useUseTemplateMutation,
  useValidateTemplateQuery,
  useLazyValidateTemplateQuery,
  useGetFeaturedTemplatesQuery,
  useGetPopularTemplatesQuery,
  useSearchTemplatesMutation,

  // History hooks
  useListHistoryQuery,
  useLazyListHistoryQuery,
  useGetHistoryEntryQuery,
  useLazyGetHistoryEntryQuery,
  useExportHistoryQuery,
  useLazyExportHistoryQuery,
  useGetHistoryTimelineQuery,
  useLazyGetHistoryTimelineQuery,
  useGetUserActivityQuery,
  useLazyGetUserActivityQuery,
  useGetActionStatisticsQuery,
  useLazyGetActionStatisticsQuery,

  // Batch operation hooks
  useCreateMultipleRequestsMutation,
  useBulkArchiveProjectsMutation,
  useBulkDeleteProjectsMutation,

  // Analytics hooks
  useGetGenerationAnalyticsQuery,
  useLazyGetGenerationAnalyticsQuery,
} = generationApi;
