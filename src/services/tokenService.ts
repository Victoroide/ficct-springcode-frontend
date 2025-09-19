import { env } from '@/config/environment';
import type { TokensData } from '@/types/auth';

const ACCESS_TOKEN_KEY = env.authConfig.tokenKey;
const REFRESH_TOKEN_KEY = env.authConfig.refreshTokenKey;
const TOKEN_EXPIRY_KEY = 'springcode_token_expiry';
const TOKEN_TYPE_KEY = 'springcode_token_type';

export const saveTokens = (tokens: any): void => {
  let access_token, refresh_token, expires_in, token_type;
  
  if (tokens.tokens && tokens.tokens.access) {
    access_token = tokens.tokens.access;
    refresh_token = tokens.tokens.refresh;
    expires_in = tokens.tokens.expires_in || 900;
    token_type = 'Bearer';
  }
  else if (tokens.tokens && tokens.tokens.access_token) {
    access_token = tokens.tokens.access_token;
    refresh_token = tokens.tokens.refresh_token;
    expires_in = tokens.tokens.expires_in || 900;
    token_type = tokens.tokens.token_type || 'Bearer';
  }
  else {
    access_token = tokens.access_token;
    refresh_token = tokens.refresh_token;
    expires_in = tokens.expires_in || 900;
    token_type = tokens.token_type || 'Bearer';
  }
  
  if (!access_token || !refresh_token) {
    return;
  }
  
  const expiresAt = Date.now() + (expires_in * 1000);
  
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
    localStorage.setItem(TOKEN_TYPE_KEY, token_type);
    
  } catch (error) {
  }
};

export const getTokens = (): {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  tokenType: string | null;
} => {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
    const tokenType = localStorage.getItem(TOKEN_TYPE_KEY);
    
    const expiresAt = expiryStr ? parseInt(expiryStr, 10) : null;
    
    return {
      accessToken,
      refreshToken,
      expiresAt,
      tokenType
    };
  } catch (error) {
    return {
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      tokenType: null
    };
  }
};

export const removeTokens = (): void => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);
  } catch (error) {
  }
};

export const isTokenExpired = (): boolean => {
  try {
    const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryStr) return true;
    
    const expiresAt = parseInt(expiryStr, 10);
    return Date.now() >= expiresAt - 30000;
  } catch (error) {
    return true;
  }
};

export const getTimeUntilExpiry = (): number => {
  try {
    const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryStr) return 0;
    
    const expiresAt = parseInt(expiryStr, 10);
    const timeLeft = Math.max(0, expiresAt - Date.now()) / 1000;
    
    return Math.floor(timeLeft);
  } catch (error) {
    return 0;
  }
};

export const getAuthHeader = (): string | null => {
  const { accessToken, tokenType } = getTokens();
  if (!accessToken || !tokenType) return null;
  
  return `${tokenType} ${accessToken}`;
};
