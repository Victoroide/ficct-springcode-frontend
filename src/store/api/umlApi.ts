// @ts-nocheck
/**
 * UML API Service - RTK Query endpoints for UML diagrams, elements, and relationships
 * Based on SpringBoot Generator API v1 specification
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { anonymousBaseQuery } from '@/services/apiService';
import type {
  UMLDiagram,
  UMLElement,
  UMLRelationship,
  UMLDiagramCreateRequest,
  UMLDiagramUpdateRequest,
  UMLElementCreateRequest,
  UMLElementUpdateRequest,
  UMLElementMoveRequest,
  UMLElementResizeRequest,
  UMLRelationshipCreateRequest,
  AddAttributeRequest,
  AddMethodRequest,
  CloneDiagramRequest,
  CreateVersionRequest,
  DiagramStatistics,
  ValidationResult,
  ExportDataResponse,
  PaginatedResponse,
  UUID
} from '@/types/uml';

// Query parameters for filtering and pagination
interface DiagramListParams {
  ordering?: string;
  page?: number;
  pagesize?: number;
  search?: string;
  project?: UUID;
  status?: string;
}

interface ElementListParams {
  ordering?: string;
  page?: number;
  pagesize?: number;
  search?: string;
  diagram?: UUID;
  classType?: string;
}

interface RelationshipListParams {
  ordering?: string;
  page?: number;
  pagesize?: number;
  diagram?: UUID;
  relationshipType?: string;
  sourceClass?: UUID;
  targetClass?: UUID;
  status?: string;
}

// Create UML API slice
export const umlApi = createApi({
  reducerPath: 'umlApi',
  baseQuery: anonymousBaseQuery,
  tagTypes: ['Diagram', 'Element', 'Relationship', 'DiagramDetail', 'ElementDetail'] as const,
  keepUnusedDataFor: 300, // 5 minutes
  endpoints: (builder) => ({
    // UML Diagrams Management
    listDiagrams: builder.query<PaginatedResponse<UMLDiagram>, DiagramListParams>({
      query: (params = {}) => ({
        url: '/api/v1/diagrams/',
        params,
      }),
      providesTags: ['Diagram'],
    }),

    createDiagram: builder.mutation<UMLDiagram, UMLDiagramCreateRequest>({
      query: (data) => ({
        url: '/api/v1/diagrams/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Diagram'],
    }),

    getDiagram: builder.query<UMLDiagram, UUID>({
      query: (id) => `/api/v1/diagrams/${id}/`,
      providesTags: (result, error, id) => [
        { type: 'DiagramDetail', id },
        { type: 'Diagram', id },
      ],
    }),

    updateDiagram: builder.mutation<UMLDiagram, { id: UUID; data: UMLDiagramUpdateRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/diagrams/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'DiagramDetail', id },
        { type: 'Diagram', id },
      ],
    }),

    deleteDiagram: builder.mutation<void, UUID>({
      query: (id) => ({
        url: `/api/v1/diagrams/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Diagram'],
    }),

    cloneDiagram: builder.mutation<UMLDiagram, { id: UUID; data: CloneDiagramRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/diagrams/${id}/clone/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Diagram'],
    }),

    createDiagramVersion: builder.mutation<UMLDiagram, { id: UUID; data: CreateVersionRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/diagrams/${id}/create_version/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'DiagramDetail', id },
        { type: 'Diagram', id },
      ],
    }),

    exportDiagramData: builder.query<ExportDataResponse, { id: UUID; format?: string }>({
      query: ({ id, format = 'plantuml' }) => ({
        url: `/api/v1/diagrams/${id}/export_data/`,
        params: { format },
      }),
    }),

    getDiagramStatistics: builder.query<DiagramStatistics, UUID>({
      query: (id) => `/api/v1/diagrams/${id}/statistics/`,
      providesTags: (result, error, id) => [{ type: 'DiagramDetail', id }],
    }),

    validateDiagram: builder.mutation<ValidationResult, UUID>({
      query: (id) => ({
        url: `/api/v1/diagrams/${id}/validate_diagram/`,
        method: 'POST',
      }),
    }),

    // UML Elements Management
    listElements: builder.query<PaginatedResponse<UMLElement>, ElementListParams>({
      query: (params = {}) => ({
        url: '/api/v1/elements/',
        params,
      }),
      providesTags: ['Element'],
    }),

    createElement: builder.mutation<UMLElement, UMLElementCreateRequest>({
      query: (data) => ({
        url: '/api/v1/elements/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Element', 'Diagram'],
    }),

    getElement: builder.query<UMLElement, UUID>({
      query: (id) => `/api/v1/elements/${id}/`,
      providesTags: (result, error, id) => [
        { type: 'ElementDetail', id },
        { type: 'Element', id },
      ],
    }),

    updateElement: builder.mutation<UMLElement, { id: UUID; data: UMLElementUpdateRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/elements/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ElementDetail', id },
        { type: 'Element', id },
        'Diagram',
      ],
    }),

    deleteElement: builder.mutation<void, UUID>({
      query: (id) => ({
        url: `/api/v1/elements/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Element', 'Diagram'],
    }),

    moveElement: builder.mutation<UMLElement, { id: UUID; data: UMLElementMoveRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/elements/${id}/move_to/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ElementDetail', id },
        { type: 'Element', id },
        'Diagram',
      ],
    }),

    resizeElement: builder.mutation<UMLElement, { id: UUID; data: UMLElementResizeRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/elements/${id}/resize/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ElementDetail', id },
        { type: 'Element', id },
        'Diagram',
      ],
    }),

    addElementAttribute: builder.mutation<UMLElement, { id: UUID; data: AddAttributeRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/elements/${id}/add_attribute/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ElementDetail', id },
        { type: 'Element', id },
        'Diagram',
      ],
    }),

    addElementMethod: builder.mutation<UMLElement, { id: UUID; data: AddMethodRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/elements/${id}/add_method/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ElementDetail', id },
        { type: 'Element', id },
        'Diagram',
      ],
    }),

    // UML Relationships Management
    listRelationships: builder.query<PaginatedResponse<UMLRelationship>, RelationshipListParams>({
      query: (params = {}) => ({
        url: '/api/v1/relationships/',
        params,
      }),
      providesTags: ['Relationship'],
    }),

    createRelationship: builder.mutation<UMLRelationship, UMLRelationshipCreateRequest>({
      query: (data) => ({
        url: '/api/v1/relationships/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Relationship', 'Diagram'],
    }),

    getRelationship: builder.query<UMLRelationship, UUID>({
      query: (id) => `/api/v1/relationships/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Relationship', id }],
    }),

    updateRelationship: builder.mutation<UMLRelationship, { id: UUID; data: Partial<UMLRelationshipCreateRequest> }>({
      query: ({ id, data }) => ({
        url: `/api/v1/relationships/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Relationship', id },
        'Diagram',
      ],
    }),

    deleteRelationship: builder.mutation<void, UUID>({
      query: (id) => ({
        url: `/api/v1/relationships/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Relationship', 'Diagram'],
    }),

    getRelationshipConnectionPath: builder.query<{ path: Array<{ x: number; y: number }> }, UUID>({
      query: (id) => `/api/v1/relationships/${id}/connection_path/`,
    }),

    validateRelationship: builder.mutation<ValidationResult, UUID>({
      query: (id) => ({
        url: `/api/v1/relationships/${id}/validate_relationship/`,
        method: 'POST',
      }),
    }),
  }),
});

// Export hooks for use in components
export const {
  // Diagram hooks
  useListDiagramsQuery,
  useLazyListDiagramsQuery,
  useCreateDiagramMutation,
  useGetDiagramQuery,
  useLazyGetDiagramQuery,
  useUpdateDiagramMutation,
  useDeleteDiagramMutation,
  useCloneDiagramMutation,
  useCreateDiagramVersionMutation,
  useExportDiagramDataQuery,
  useLazyExportDiagramDataQuery,
  useGetDiagramStatisticsQuery,
  useLazyGetDiagramStatisticsQuery,
  useValidateDiagramMutation,

  // Element hooks
  useListElementsQuery,
  useLazyListElementsQuery,
  useCreateElementMutation,
  useGetElementQuery,
  useLazyGetElementQuery,
  useUpdateElementMutation,
  useDeleteElementMutation,
  useMoveElementMutation,
  useResizeElementMutation,
  useAddElementAttributeMutation,
  useAddElementMethodMutation,

  // Relationship hooks
  useListRelationshipsQuery,
  useLazyListRelationshipsQuery,
  useCreateRelationshipMutation,
  useGetRelationshipQuery,
  useLazyGetRelationshipQuery,
  useUpdateRelationshipMutation,
  useDeleteRelationshipMutation,
  useGetRelationshipConnectionPathQuery,
  useLazyGetRelationshipConnectionPathQuery,
  useValidateRelationshipMutation,
} = umlApi;
