/**
 * Date Utilities
 * Helper functions for date formatting and calculations
 */

/**
 * Calculate session duration in minutes from a start time
 * @param startTimeISOString - ISO string of session start time
 * @returns Session duration in minutes
 */
export function calculateSessionDuration(startTimeISOString: string): number {
  try {
    const startTime = new Date(startTimeISOString);
    const now = new Date();
    const durationMs = now.getTime() - startTime.getTime();
    return Math.floor(durationMs / (1000 * 60)); // Convert ms to minutes
  } catch (e) {
    console.error('Error calculating session duration:', e);
    return 0;
  }
}

/**
 * Format a date to a human-readable string
 * @param dateString - ISO string date to format
 * @param locale - Locale for formatting (default: es-ES)
 * @returns Formatted date string
 */
export function formatDate(dateString: string, locale: string = 'es-ES'): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Fecha inválida';
  }
}

/**
 * Get time ago in human-readable format
 * @param dateString - ISO string date to calculate time ago from
 * @returns Human-readable time ago string
 */
export function getTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) return 'Ahora mismo';
    
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `hace ${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`;
    
    const diffYears = Math.floor(diffMonths / 12);
    return `hace ${diffYears} ${diffYears === 1 ? 'año' : 'años'}`;
  } catch (e) {
    console.error('Error calculating time ago:', e);
    return 'Fecha desconocida';
  }
}
