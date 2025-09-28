/**
 * TypeScript definitions for Real-time Collaboration Features
 * Based on SpringBoot Generator API v1 specification
 */

import type { UUID } from './uml';

// Collaboration Session
export interface CollaborationSession {
  id: UUID;
  project: UUID;
  diagram: UUID;
  sessionType: string;
  maxParticipants: number;
  activeParticipants: number;
  status: 'ACTIVE' | 'PAUSED' | 'ENDED';
  host: number;
  startTime: string;
  endTime?: string;
  sessionConfig: Record<string, any>;
  statistics: {
    totalMessages: number;
    totalChanges: number;
    peakParticipants: number;
    duration: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Session Participant
export interface SessionParticipant {
  id: number;
  session: UUID;
  user: number;
  role: 'HOST' | 'EDITOR' | 'VIEWER' | 'COMMENTER';
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONNECTED';
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
  cursorPosition?: {
    x: number;
    y: number;
    elementId?: UUID;
  };
  permissions: {
    canEdit: boolean;
    canComment: boolean;
    canInvite: boolean;
    canKick: boolean;
  };
  userInfo: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

// Change Event Types
export enum ChangeEventType {
  ELEMENT_CREATED = 'ELEMENT_CREATED',
  ELEMENT_UPDATED = 'ELEMENT_UPDATED',
  ELEMENT_DELETED = 'ELEMENT_DELETED',
  ELEMENT_MOVED = 'ELEMENT_MOVED',
  ELEMENT_RESIZED = 'ELEMENT_RESIZED',
  ATTRIBUTE_ADDED = 'ATTRIBUTE_ADDED',
  ATTRIBUTE_UPDATED = 'ATTRIBUTE_UPDATED',
  ATTRIBUTE_DELETED = 'ATTRIBUTE_DELETED',
  METHOD_ADDED = 'METHOD_ADDED',
  METHOD_UPDATED = 'METHOD_UPDATED',
  METHOD_DELETED = 'METHOD_DELETED',
  RELATIONSHIP_CREATED = 'RELATIONSHIP_CREATED',
  RELATIONSHIP_UPDATED = 'RELATIONSHIP_UPDATED',
  RELATIONSHIP_DELETED = 'RELATIONSHIP_DELETED',
  DIAGRAM_UPDATED = 'DIAGRAM_UPDATED',
  CANVAS_UPDATED = 'CANVAS_UPDATED',
  PARTICIPANT_JOINED = 'PARTICIPANT_JOINED',
  PARTICIPANT_LEFT = 'PARTICIPANT_LEFT',
  CURSOR_MOVED = 'CURSOR_MOVED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  COMMENT_UPDATED = 'COMMENT_UPDATED',
  COMMENT_DELETED = 'COMMENT_DELETED'
}

// Change Event
export interface ChangeEvent {
  id: UUID;
  session: UUID;
  user: number;
  eventType: ChangeEventType;
  targetId?: UUID;
  changeData: Record<string, any>;
  metadata: Record<string, any>;
  timestamp: string;
  synchronized: boolean;
}

// WebSocket Message Types
export enum WebSocketMessageType {
  JOIN_SESSION = 'join_session',
  LEAVE_SESSION = 'leave_session',
  CHANGE_EVENT = 'change_event',
  CURSOR_UPDATE = 'cursor_update',
  PARTICIPANT_UPDATE = 'participant_update',
  SESSION_UPDATE = 'session_update',
  ERROR = 'error',
  HEARTBEAT = 'heartbeat',
  SYNC_REQUEST = 'sync_request',
  SYNC_RESPONSE = 'sync_response'
}

// WebSocket Message Base
export interface WebSocketMessage {
  type: WebSocketMessageType;
  sessionId: UUID;
  userId: number;
  timestamp: string;
  messageId: UUID;
}

// WebSocket Messages
export interface JoinSessionMessage extends WebSocketMessage {
  type: WebSocketMessageType.JOIN_SESSION;
  role: 'HOST' | 'EDITOR' | 'VIEWER' | 'COMMENTER';
}

export interface LeaveSessionMessage extends WebSocketMessage {
  type: WebSocketMessageType.LEAVE_SESSION;
}

export interface ChangeEventMessage extends WebSocketMessage {
  type: WebSocketMessageType.CHANGE_EVENT;
  event: ChangeEvent;
}

export interface CursorUpdateMessage extends WebSocketMessage {
  type: WebSocketMessageType.CURSOR_UPDATE;
  position: {
    x: number;
    y: number;
    elementId?: UUID;
  };
}

export interface ParticipantUpdateMessage extends WebSocketMessage {
  type: WebSocketMessageType.PARTICIPANT_UPDATE;
  participant: SessionParticipant;
  action: 'joined' | 'left' | 'role_changed' | 'cursor_moved';
}

export interface SessionUpdateMessage extends WebSocketMessage {
  type: WebSocketMessageType.SESSION_UPDATE;
  session: CollaborationSession;
}

export interface ErrorMessage extends WebSocketMessage {
  type: WebSocketMessageType.ERROR;
  error: string;
  code: number;
}

export interface HeartbeatMessage extends WebSocketMessage {
  type: WebSocketMessageType.HEARTBEAT;
}

export interface SyncRequestMessage extends WebSocketMessage {
  type: WebSocketMessageType.SYNC_REQUEST;
  lastEventId?: UUID;
}

export interface SyncResponseMessage extends WebSocketMessage {
  type: WebSocketMessageType.SYNC_RESPONSE;
  events: ChangeEvent[];
  participants: SessionParticipant[];
}

// Union type for all WebSocket messages
export type WebSocketMessageUnion = 
  | JoinSessionMessage
  | LeaveSessionMessage
  | ChangeEventMessage
  | CursorUpdateMessage
  | ParticipantUpdateMessage
  | SessionUpdateMessage
  | ErrorMessage
  | HeartbeatMessage
  | SyncRequestMessage
  | SyncResponseMessage;

// Request/Response Types

// Create Session Request
export interface CreateSessionRequest {
  project: UUID;
  diagram: UUID;
  sessionType: string;
  maxParticipants: number;
  sessionConfig?: Record<string, any>;
}

// Join Session Request
export interface JoinSessionRequest {
  role: 'HOST' | 'EDITOR' | 'VIEWER' | 'COMMENTER';
}

// Update Participant Request
export interface UpdateParticipantRequest {
  role?: 'HOST' | 'EDITOR' | 'VIEWER' | 'COMMENTER';
  cursorPosition?: {
    x: number;
    y: number;
    elementId?: UUID;
  };
}

// Create Change Event Request
export interface CreateChangeEventRequest {
  session: UUID;
  eventType: ChangeEventType;
  changeData: Record<string, any>;
  targetId?: UUID;
}

// Session Statistics
export interface SessionStatistics {
  id: UUID;
  totalDuration: number;
  participantCount: number;
  peakParticipants: number;
  totalChanges: number;
  changesByType: Record<ChangeEventType, number>;
  participantActivity: Array<{
    userId: number;
    joinTime: string;
    leaveTime?: string;
    totalChanges: number;
    role: string;
  }>;
  timeline: Array<{
    timestamp: string;
    eventType: ChangeEventType;
    userId: number;
    description: string;
  }>;
}

// Event Statistics
export interface EventStatistics {
  totalEvents: number;
  eventsByType: Record<ChangeEventType, number>;
  eventsByUser: Record<number, number>;
  eventsByHour: Array<{
    hour: string;
    count: number;
  }>;
  mostActiveUsers: Array<{
    userId: number;
    eventCount: number;
    userInfo: {
      email: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

// Collaboration State (for Redux)
export interface CollaborationState {
  currentSession: CollaborationSession | null;
  participants: SessionParticipant[];
  events: ChangeEvent[];
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastError: string | null;
  pendingChanges: ChangeEvent[];
  syncInProgress: boolean;
  cursorPositions: Record<number, {
    x: number;
    y: number;
    elementId?: UUID;
    timestamp: string;
  }>;
}

// Real-time Cursor
export interface RealtimeCursor {
  userId: number;
  position: {
    x: number;
    y: number;
  };
  elementId?: UUID;
  userInfo: {
    firstName: string;
    lastName: string;
    avatar?: string;
    color: string;
  };
  lastUpdate: string;
}

// Collaboration Settings
export interface CollaborationSettings {
  showCursors: boolean;
  showParticipants: boolean;
  autoSync: boolean;
  syncInterval: number; // milliseconds
  maxRetries: number;
  retryDelay: number; // milliseconds
  heartbeatInterval: number; // milliseconds
  conflictResolution: 'last_writer_wins' | 'merge' | 'ask_user';
}

// Conflict Resolution
export interface ConflictResolution {
  conflictId: UUID;
  eventId: UUID;
  conflictType: 'element_modified' | 'element_deleted' | 'relationship_modified';
  localChange: ChangeEvent;
  remoteChange: ChangeEvent;
  resolution: 'accept_local' | 'accept_remote' | 'merge' | 'cancel';
  mergedData?: Record<string, any>;
}

// Filter Options for Events
export interface EventFilterOptions {
  eventType?: ChangeEventType[];
  userId?: number[];
  dateFrom?: string;
  dateTo?: string;
  elementType?: string[];
  session?: UUID;
}

// Filter Options for Sessions
export interface SessionFilterOptions {
  status?: ('ACTIVE' | 'PAUSED' | 'ENDED')[];
  project?: UUID;
  diagram?: UUID;
  dateFrom?: string;
  dateTo?: string;
  participantCount?: {
    min?: number;
    max?: number;
  };
}

// Filter Options for Participants
export interface ParticipantFilterOptions {
  session?: UUID;
  role?: ('HOST' | 'EDITOR' | 'VIEWER' | 'COMMENTER')[];
  status?: ('ACTIVE' | 'INACTIVE' | 'DISCONNECTED')[];
  user?: number[];
  isActive?: boolean;
}
