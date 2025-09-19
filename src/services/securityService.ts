/**
 * Security Service
 * Utils to work with security data from user profile
 */
import type { User } from '@/types/auth';
import type { SecurityFeature } from '@/types/user';

/**
 * Extract security features from user profile with defensive coding
 * @param user User profile
 * @returns Array of security features with defaults for missing data
 */
export const extractSecurityFeatures = (user?: User | null): SecurityFeature[] => {
  // Handle missing user or security status with defaults
  if (!user) return getDefaultSecurityFeatures();
  
  // Create default security status if missing
  const secStatus = user.security_status || {
    "2fa_enabled": false,
    security_score: 0,
    backup_codes_available: 0,
    email_verified: false,
    last_password_change: null
  };
  
  return [
    {
      name: '2fa_enabled',
      display_name: 'Autenticación de Dos Factores',
      enabled: Boolean(secStatus["2fa_enabled"]),
      severity: 'high',
      recommendation: 'Activa la autenticación de dos factores para proteger tu cuenta',
    },
    {
      name: 'backup_codes_available',
      display_name: 'Códigos de Respaldo',
      enabled: (secStatus.backup_codes_available || 0) > 0,
      severity: 'medium',
      recommendation: 'Genera códigos de respaldo para recuperar tu cuenta si pierdes el acceso a tu dispositivo',
    },
    {
      name: 'email_verified',
      display_name: 'Email Verificado',
      enabled: Boolean(user.email_verified || secStatus.email_verified),
      severity: 'high',
      recommendation: 'Verifica tu dirección de email para confirmar tu identidad',
    },
    {
      name: 'recent_password_change',
      display_name: 'Contraseña Reciente',
      enabled: Boolean(secStatus.last_password_change && 
                new Date(secStatus.last_password_change).getTime() > 
                Date.now() - 90 * 24 * 60 * 60 * 1000),
      severity: 'medium',
      recommendation: 'Actualiza tu contraseña regularmente para mantener tu cuenta segura',
    }
  ];
};

/**
 * Get default security features when user data is missing
 * @returns Default security features array
 */
export const getDefaultSecurityFeatures = (): SecurityFeature[] => [
  {
    name: '2fa_enabled',
    display_name: 'Autenticación de Dos Factores',
    enabled: false,
    severity: 'high',
    recommendation: 'Activa la autenticación de dos factores para proteger tu cuenta',
  },
  {
    name: 'backup_codes_available',
    display_name: 'Códigos de Respaldo',
    enabled: false,
    severity: 'medium',
    recommendation: 'Genera códigos de respaldo para recuperar tu cuenta si pierdes el acceso a tu dispositivo',
  },
  {
    name: 'email_verified',
    display_name: 'Email Verificado',
    enabled: false,
    severity: 'high',
    recommendation: 'Verifica tu dirección de email para confirmar tu identidad',
  },
  {
    name: 'recent_password_change',
    display_name: 'Contraseña Reciente',
    enabled: false,
    severity: 'medium',
    recommendation: 'Actualiza tu contraseña regularmente para mantener tu cuenta segura',
  }
];

/**
 * Security score weights for different features
 * Used to calculate an overall security score
 */
const SECURITY_FEATURE_WEIGHTS = {
  '2fa_enabled': 40,
  'backup_codes_available': 15,
  'email_verified': 25,
  'recent_password_change': 20
};

/**
 * Calculate security score based on enabled features
 * @param features Array of security features
 * @returns Calculated security score (0-100)
 */
export const calculateSecurityScore = (features: SecurityFeature[]): number => {
  if (!features || features.length === 0) return 0;
  
  let score = 0;
  const availableWeight = Object.values(SECURITY_FEATURE_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  
  // Add points for each enabled feature
  features.forEach(feature => {
    if (feature.enabled && SECURITY_FEATURE_WEIGHTS[feature.name]) {
      score += SECURITY_FEATURE_WEIGHTS[feature.name];
    }
  });
  
  // Normalize to 0-100 scale
  return Math.round((score / availableWeight) * 100);
};

/**
 * Get security score from user profile
 * This serves as the single source of truth for security scores throughout the app
 * @param user User profile
 * @returns Calculated security score or score from API
 */
export const getSecurityScore = (user?: User | null): number => {
  // If no user data, return 0
  if (!user) return 0;
  
  // Extract features to calculate score
  const features = extractSecurityFeatures(user);
  
  // Calculate score locally
  const calculatedScore = calculateSecurityScore(features);
  
  // Siempre asegurar que el puntaje sea igual en toda la aplicación
  // Guarda el puntaje calculado para que otras partes de la aplicación lo utilicen
  try {
    // Guarda el valor calculado en localStorage para usar en el SecurityWizardModal
    localStorage.setItem('security_score_percentage', calculatedScore.toString());
  } catch (e) {
    console.error('Error storing security score:', e);
  }
  
  return calculatedScore;
};

/**
 * Extract security recommendations from user profile
 * @param user User profile
 * @returns Array of security recommendations
 */
export const getSecurityRecommendations = (user?: User | null): string[] => {
  if (!user) return [];
  return user.security_recommendations || [];
};

/**
 * Check if 2FA is enabled
 * @param user User profile
 * @returns True if 2FA is enabled
 */
export const is2FAEnabled = (user?: User | null): boolean => {
  if (!user || !user.security_status) return false;
  return user.security_status["2fa_enabled"] || false;
};

/**
 * Get backup codes count
 * @param user User profile
 * @returns Number of available backup codes
 */
export const getBackupCodesCount = (user?: User | null): number => {
  if (!user || !user.security_status) return 0;
  return user.security_status.backup_codes_available || 0;
};
