/**
 * Authentication Types
 * Comprehensive type definitions for the authentication system
 */

export interface LoginRequest {
  corporate_email: string;
  password: string;
}

export interface TokensData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user_id: number;
  corporate_email: string;
}

export interface UserPermissions {
  can_manage_users: boolean;
  can_view_audit_logs: boolean;
  can_modify_security_settings: boolean;
  can_access_admin_panel: boolean;
  requires_2fa: boolean;
  can_generate_reports: boolean;
}

export interface SecurityStatus {
  "2fa_enabled": boolean;
  email_verified: boolean;
  account_locked: boolean;
  password_expired: boolean;
  failed_login_attempts: number;
  backup_codes_available: number;
  last_password_change: string;
  security_score: number;
  security_status?: SecurityStatus;
}

export interface User {
  id: number;
  corporate_email: string;
  full_name: string;
  role: string;
  role_display: string;
  department: string;
  company_domain: string;
  employee_id: string | null;
  is_2fa_enabled: boolean;
  email_verified: boolean;
  last_login: string;
  last_login_formatted: string;
  last_login_ip: string;
  created_at: string;
  account_age_days: number;
  password_changed_at: string;
  password_expires_in_days: number;
  last_activity: string | null;
  permissions: UserPermissions;
  security_status: SecurityStatus;
  is_active: boolean;
  is_staff: boolean;
  full_profile_complete: boolean;
  security_recommendations: string[];
}

export interface LoginResponse {
  success: boolean;
  requires_2fa: boolean;
  message: string;
  tokens: TokensData;
  user: User;
  user_id?: number;
  corporate_email?: string;
  access_token?: string;
}

export interface Verify2FARequest {
  token?: string;
  backup_token?: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface RevokeSessionsRequest {
  password: string;
  keep_current: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // User data
  user: User | null;
  
  // Token management
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
    tokenType: string | null;
  };
  
  // 2FA state
  requires2FA: boolean;
  
  // Session info
  lastAuthenticated: string | null;
}
