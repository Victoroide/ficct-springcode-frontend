import type { TokensData } from '@/types/auth';

export const normalizeTokensResponse = (response: any): TokensData => {
  if (response.tokens) {
    const { tokens } = response;
    
    if (tokens.access && tokens.refresh) {
      return {
        access_token: tokens.access,
        refresh_token: tokens.refresh,
        expires_in: tokens.expires_in || 900,
        token_type: 'Bearer',
        user_id: response.user?.id,
        corporate_email: response.user?.corporate_email
      };
    }
    
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in || 900,
      token_type: tokens.token_type || 'Bearer',
      user_id: response.user?.id,
      corporate_email: response.user?.corporate_email
    };
  }
  
  return {
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    expires_in: response.expires_in || 900,
    token_type: response.token_type || 'Bearer',
    user_id: response.user?.id,
    corporate_email: response.user?.corporate_email
  };
};
