const ACCESS_TOKEN_KEY = 'club_gema_access_token';
const REFRESH_TOKEN_KEY = 'club_gema_refresh_token';
const TOKEN_FALLBACK_ENABLED_KEY = 'club_gema_token_fallback_enabled';

const canUseSessionStorage = () => typeof globalThis !== 'undefined' && !!globalThis.sessionStorage;

export const isSafariBrowser = () => {
  const userAgent = globalThis?.navigator?.userAgent || '';
  return /Safari/i.test(userAgent) && !/Chrome|Chromium|Edg|OPR|CriOS|FxiOS/i.test(userAgent);
};

export const isTokenFallbackEnabled = () => {
  if (!canUseSessionStorage()) return false;
  return (
    isSafariBrowser() && globalThis.sessionStorage.getItem(TOKEN_FALLBACK_ENABLED_KEY) === 'true'
  );
};

export const enableTokenFallback = () => {
  if (!canUseSessionStorage() || !isSafariBrowser()) return false;
  globalThis.sessionStorage.setItem(TOKEN_FALLBACK_ENABLED_KEY, 'true');
  return true;
};

export const disableTokenFallback = () => {
  if (!canUseSessionStorage()) return;
  globalThis.sessionStorage.removeItem(TOKEN_FALLBACK_ENABLED_KEY);
  globalThis.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  globalThis.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const saveAuthTokens = ({ accessToken, refreshToken }) => {
  if (!canUseSessionStorage() || !isTokenFallbackEnabled()) return;
  if (typeof accessToken === 'string' && accessToken.trim().length > 0) {
    globalThis.sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }
  if (typeof refreshToken === 'string' && refreshToken.trim().length > 0) {
    globalThis.sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const getAccessToken = () => {
  if (!canUseSessionStorage() || !isTokenFallbackEnabled()) return null;
  return globalThis.sessionStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = () => {
  if (!canUseSessionStorage() || !isTokenFallbackEnabled()) return null;
  return globalThis.sessionStorage.getItem(REFRESH_TOKEN_KEY);
};

export const clearAuthTokens = () => {
  if (!canUseSessionStorage()) return;
  globalThis.sessionStorage.removeItem(TOKEN_FALLBACK_ENABLED_KEY);
  globalThis.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  globalThis.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const enforceTokenStoragePolicy = () => {
  if (!canUseSessionStorage() || isSafariBrowser()) return;
  clearAuthTokens();
};

enforceTokenStoragePolicy();

export const hasAuthTokens = () => Boolean(getAccessToken() && getRefreshToken());
