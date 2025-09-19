export interface UpdateProfileRequest {
  full_name?: string;
  department?: string;
  phone?: string;
}

export interface Enable2FARequest {
  method: '2fa_app' | '2fa_sms';
}

export interface Enable2FASetupRequest {
  corporate_email: string;
  full_name: string;
  role: string;
  department: string;
  password?: string;
  password_confirm?: string;
  verification_code?: string;
  qr_secret?: string;
}

export interface Verify2FASetupRequest {
  token: string;
  qr_secret: string;
}

export interface Setup2FAVerificationRequest {
  email: string;
  verification_code: string;
  qr_secret: string;
}

export interface SessionData {
  id: string;
  device_name: string;
  browser: string;
  ip_address: string;
  location: string;
  last_activity: string;
  is_current: boolean;
}

export interface SecurityFeature {
  name: string;
  display_name: string;
  enabled: boolean;
  severity: 'high' | 'medium' | 'low';
  recommendation?: string;
  action_url?: string;
}

export interface SecurityScoreDetails {
  score: number;
  max_score: number;
  last_updated: string;
  features: SecurityFeature[];
  recommendations: string[];
}

export interface TwoFactorSetup {
  qr_code: string;
  secret: string;
  backup_codes: string[];
}

export interface BackupCodesResponse {
  backup_codes: string[];
  generated_at: string;
  count: number;
}

export interface SecurityImprovementStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action_type: 'enable_2fa' | 'verify_email' | 'generate_backup_codes' | 'update_password' | 'setup_recovery' | 'other';
  severity: 'critical' | 'recommended' | 'optional';
  score_impact: number;
}

export interface SecurityWizardState {
  steps: SecurityImprovementStep[];
  currentStepId: string;
  completed: boolean;
  skippedSteps: string[];
}
