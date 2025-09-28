/**
 * Utilidades para manejar URLs en la aplicación
 */

/**
 * 🔧 CRITICAL FIX: Normaliza URLs para usar /api/ de forma consistente
 * @param endpoint URL a normalizar
 */
export const normalizeApiUrl = (endpoint: string): string => {
  // Limpiar cualquier /api/v1/ legacy
  if (endpoint.startsWith('/api/v1/')) {
    endpoint = endpoint.replace('/api/v1/', '/');
  }
  
  // Si ya empieza con /api/, no hacer nada
  if (endpoint.startsWith('/api/')) {
    return endpoint;
  }
  
  // Si empieza con api/ (sin barra inicial), añadirla
  if (endpoint.startsWith('api/')) {
    return `/${endpoint}`;
  }
  
  // Si empieza con barra pero no tiene api/, añadirlo
  if (endpoint.startsWith('/') && !endpoint.startsWith('/api/')) {
    return `/api${endpoint}`;
  }
  
  // En cualquier otro caso, añadir /api/ al principio
  return `/api/${endpoint}`;
};

/**
 * Construye una URL completa con parámetros de consulta
 * @param baseUrl URL base
 * @param endpoint Endpoint de la API
 * @param params Parámetros de consulta opcionales
 */
export const buildApiUrl = (
  baseUrl: string,
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): string => {
  const normalizedEndpoint = normalizeApiUrl(endpoint);
  let url = `${baseUrl}${normalizedEndpoint}`;
  
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
    
    const queryString = queryParams.toString();
    if (queryString) {
      url = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
    }
  }
  
  return url;
};

export default {
  normalizeApiUrl,
  buildApiUrl,
};
