// @ts-nocheck
/**
 * Collaboration API Service - RTK Query endpoints for real-time collaboration
 * Based on SpringBoot Generator API v1 specification
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { anonymousBaseQuery } from '@/services/apiService';
import type {
  CollaborationSession,
  SessionParticipant,
  ChangeEvent,
  CreateSessionRequest,
  JoinSessionRequest,
  UpdateParticipantRequest,
  CreateChangeEventRequest,
  SessionStatistics,
  EventStatistics,
  SessionFilterOptions,
  ParticipantFilterOptions,
  EventFilterOptions,
} from '@/types/collaboration';
import type {
  PaginatedResponse,
  UUID
} from '@/types/uml';

// Query parameters for filtering and pagination
interface SessionListParams extends SessionFilterOptions {
  ordering?: string;
  page?: number;
  pagesize?: number;
  search?: string;
}

interface ParticipantListParams extends ParticipantFilterOptions {
  ordering?: string;
  page?: number;
  pagesize?: number;
}

interface EventListParams extends EventFilterOptions {
  ordering?: string;
  page?: number;
  pagesize?: number;
  limit?: number;
}

interface TimelineParams {
  session?: UUID;
  eventType?: string;
  limit?: number;
  user?: number;
}

interface StatisticsParams {
  dateFrom?: string;
  dateTo?: string;
  session?: UUID;
}

interface UserActivityParams {
  period?: 'day' | 'week' | 'month';
  userId?: number;
}

interface ActionStatisticsParams {
  dateFrom?: string;
  dateTo?: string;
  actionType?: string;
}

// Create Collaboration API slice
export const collaborationApi = createApi({
  reducerPath: 'collaborationApi',
  baseQuery: anonymousBaseQuery,
  tagTypes: [
    'Session', 
    'SessionDetail', 
    'Participant', 
    'Event', 
    'Statistics',
    'Timeline',
    'UserActivity'
  ] as const,
  keepUnusedDataFor: 60, // 1 minute for real-time data
  endpoints: (builder) => ({
    // Collaboration Sessions Management
    listSessions: builder.query<PaginatedResponse<CollaborationSession>, SessionListParams>({
      query: (params = {}) => ({
        url: '/api/v1/sessions/',
        params,
      }),
      providesTags: (result) => 
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'Session' as const, id })),
              { type: 'Session' as const, id: 'LIST' },
            ]
          : [{ type: 'Session' as const, id: 'LIST' }],
      // Poll for updates every 30 seconds
      pollingInterval: 30000,
    }),

    createSession: builder.mutation<CollaborationSession, CreateSessionRequest>({
      query: (data) => ({
        url: '/api/v1/sessions/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Session' as const, id: 'LIST' }],
    }),

    getSession: builder.query<CollaborationSession, UUID>({
      query: (id) => `/api/v1/sessions/${id}/`,
      providesTags: (result, error, id) => [
        { type: 'SessionDetail' as const, id },
        { type: 'Session' as const, id },
      ],
      // Poll active sessions more frequently
      pollingInterval: 10000,
    }),

    updateSession: builder.mutation<CollaborationSession, { id: UUID; data: Partial<CreateSessionRequest> }>({
      query: ({ id, data }) => ({
        url: `/api/v1/sessions/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'SessionDetail' as const, id },
        { type: 'Session' as const, id },
      ],
    }),

    deleteSession: builder.mutation<void, UUID>({
      query: (id) => ({
        url: `/api/v1/sessions/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Session' as const, id: 'LIST' }],
    }),

    joinSession: builder.mutation<SessionParticipant, { id: UUID; data: JoinSessionRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/sessions/${id}/join_session/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'SessionDetail' as const, id },
        { type: 'Session' as const, id },
        { type: 'Participant' as const, id: 'LIST' },
      ],
    }),

    endSession: builder.mutation<CollaborationSession, UUID>({
      query: (id) => ({
        url: `/api/v1/sessions/${id}/end_session/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'SessionDetail' as const, id },
        { type: 'Session' as const, id },
        { type: 'Participant' as const, id: 'LIST' },
      ],
    }),

    getSessionStatistics: builder.query<SessionStatistics, UUID>({
      query: (id) => `/api/v1/sessions/${id}/statistics/`,
      providesTags: (result, error, id) => [{ type: 'Statistics' as const, id }],
    }),

    // Session Participants Management
    listParticipants: builder.query<PaginatedResponse<SessionParticipant>, ParticipantListParams>({
      query: (params = {}) => ({
        url: '/api/v1/participants/',
        params,
      }),
      providesTags: (result) => 
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'Participant' as const, id })),
              { type: 'Participant' as const, id: 'LIST' },
            ]
          : [{ type: 'Participant' as const, id: 'LIST' }],
      // Poll for participant updates frequently
      pollingInterval: 5000,
    }),

    addParticipant: builder.mutation<SessionParticipant, Omit<SessionParticipant, 'id' | 'joinedAt' | 'userInfo'>>({
      query: (data) => ({
        url: '/api/v1/participants/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Participant' as const, id: 'LIST' },
        { type: 'Session' as const, id: 'LIST' }
      ],
    }),

    getParticipant: builder.query<SessionParticipant, number>({
      query: (id) => `/api/v1/participants/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Participant' as const, id }],
    }),

    updateParticipant: builder.mutation<SessionParticipant, { id: number; data: UpdateParticipantRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/participants/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Participant' as const, id },
        { type: 'Session' as const, id: 'LIST' },
      ],
    }),

    removeParticipant: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/v1/participants/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Participant' as const, id: 'LIST' },
        { type: 'Session' as const, id: 'LIST' }
      ],
    }),

    updateParticipantCursor: builder.mutation<SessionParticipant, { 
      id: number; 
      cursorPosition: { x: number; y: number; elementId?: UUID } 
    }>({
      query: ({ id, cursorPosition }) => ({
        url: `/api/v1/participants/${id}/update_cursor/`,
        method: 'POST',
        params: { 
          cursorPosition: JSON.stringify(cursorPosition) 
        },
      }),
      // Don't invalidate cache for frequent cursor updates
      invalidatesTags: [] as const,
    }),

    updateParticipantRole: builder.mutation<SessionParticipant, { 
      id: number; 
      role: 'HOST' | 'EDITOR' | 'VIEWER' | 'COMMENTER' 
    }>({
      query: ({ id, role }) => ({
        url: `/api/v1/participants/${id}/update_role/`,
        method: 'POST',
        params: { role },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Participant' as const, id },
        { type: 'Session' as const, id: 'LIST' },
      ],
    }),

    leaveSession: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/v1/participants/${id}/leave_session/`,
        method: 'POST',
      }),
      invalidatesTags: [
        { type: 'Participant' as const, id: 'LIST' },
        { type: 'Session' as const, id: 'LIST' }
      ],
    }),

    // Change Events Tracking
    listEvents: builder.query<PaginatedResponse<ChangeEvent>, EventListParams>({
      query: (params = {}) => ({
        url: '/api/v1/events/',
        params,
      }),
      providesTags: (result) => 
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'Event' as const, id })),
              { type: 'Event' as const, id: 'LIST' },
            ]
          : [{ type: 'Event' as const, id: 'LIST' }],
      // Poll for new events frequently during active collaboration
      pollingInterval: 2000,
    }),

    createEvent: builder.mutation<ChangeEvent, CreateChangeEventRequest>({
      query: (data) => ({
        url: '/api/v1/events/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Event' as const, id: 'LIST' }],
    }),

    getEvent: builder.query<ChangeEvent, UUID>({
      query: (id) => `/api/v1/events/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Event' as const, id }],
    }),

    getEventStatistics: builder.query<EventStatistics, StatisticsParams>({
      query: (params = {}) => ({
        url: '/api/v1/events/statistics/',
        params,
      }),
      providesTags: [{ type: 'Statistics' as const, id: 'LIST' }],
    }),

    getEventTimeline: builder.query<Array<{
      timestamp: string;
      eventType: string;
      userId: number;
      description: string;
      metadata: Record<string, any>;
    }>, TimelineParams>({
      query: (params = {}) => ({
        url: '/api/v1/events/timeline/',
        params,
      }),
      providesTags: [{ type: 'Timeline' as const, id: 'LIST' }],
      // Poll timeline for real-time updates
      pollingInterval: 5000,
    }),

    getUserActivity: builder.query<{
      totalEvents: number;
      eventsByType: Record<string, number>;
      recentActivity: Array<{
        date: string;
        eventCount: number;
      }>;
    }, UserActivityParams>({
      query: (params = {}) => ({
        url: '/api/v1/history/user-activity/',
        params,
      }),
      providesTags: [{ type: 'UserActivity' as const, id: 'LIST' }],
    }),

    getActionStatistics: builder.query<{
      actionsByType: Record<string, number>;
      actionsByHour: Array<{
        hour: string;
        count: number;
      }>;
      totalActions: number;
    }, ActionStatisticsParams>({
      query: (params = {}) => ({
        url: '/api/v1/history/action-statistics/',
        params,
      }),
      providesTags: [{ type: 'Statistics' as const, id: 'LIST' }],
    }),

    // Real-time sync endpoints
    syncEvents: builder.query<{
      events: ChangeEvent[];
      lastEventId: UUID;
      participants: SessionParticipant[];
    }, { sessionId: UUID; lastEventId?: UUID }>({
      query: ({ sessionId, lastEventId }) => ({
        url: `/api/v1/sessions/${sessionId}/sync/`,
        params: lastEventId ? { lastEventId } : {},
      }),
      // No tags since this is frequently polled
      providesTags: [] as const,
      // Aggressive polling for sync
      pollingInterval: 1000,
    }),

    // Batch operations for performance
    createMultipleEvents: builder.mutation<ChangeEvent[], CreateChangeEventRequest[]>({
      query: (events) => ({
        url: '/api/v1/events/batch/',
        method: 'POST',
        body: { events },
      }),
      invalidatesTags: [{ type: 'Event' as const, id: 'LIST' }],
    }),

    updateMultipleParticipants: builder.mutation<SessionParticipant[], Array<{
      id: number;
      data: UpdateParticipantRequest;
    }>>({
      query: (updates) => ({
        url: '/api/v1/participants/batch/',
        method: 'PATCH',
        body: { updates },
      }),
      invalidatesTags: [{ type: 'Participant' as const, id: 'LIST' }],
    }),
  }),
});

// Export hooks for use in components
export const {
  // Session hooks
  useListSessionsQuery,
  useLazyListSessionsQuery,
  useCreateSessionMutation,
  useGetSessionQuery,
  useLazyGetSessionQuery,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
  useJoinSessionMutation,
  useEndSessionMutation,
  useGetSessionStatisticsQuery,
  useLazyGetSessionStatisticsQuery,

  // Participant hooks
  useListParticipantsQuery,
  useLazyListParticipantsQuery,
  useAddParticipantMutation,
  useGetParticipantQuery,
  useLazyGetParticipantQuery,
  useUpdateParticipantMutation,
  useRemoveParticipantMutation,
  useUpdateParticipantCursorMutation,
  useUpdateParticipantRoleMutation,
  useLeaveSessionMutation,

  // Event hooks
  useListEventsQuery,
  useLazyListEventsQuery,
  useCreateEventMutation,
  useGetEventQuery,
  useLazyGetEventQuery,
  useGetEventStatisticsQuery,
  useLazyGetEventStatisticsQuery,
  useGetEventTimelineQuery,
  useLazyGetEventTimelineQuery,
  useGetUserActivityQuery,
  useLazyGetUserActivityQuery,
  useGetActionStatisticsQuery,
  useLazyGetActionStatisticsQuery,

  // Real-time sync hooks
  useSyncEventsQuery,
  useLazySyncEventsQuery,
  
  // Batch operation hooks
  useCreateMultipleEventsMutation,
  useUpdateMultipleParticipantsMutation,
} = collaborationApi;
