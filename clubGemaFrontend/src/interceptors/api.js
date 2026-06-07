import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import {
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
  clearAuthTokens,
  isTokenFallbackEnabled,
} from '../utils/authTokens';

const API_URL = import.meta.env.VITE_API_URL;

let isRefreshing = false;
let failedQueue = [];

const clearUiSession = () => {
  Cookies.remove('user_role');
  Cookies.remove('user_name');
  Cookies.remove('user_lastname');
  Cookies.remove('user_id');
  Cookies.remove('last_viewed_news');
  clearAuthTokens();
};

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const apiFetch = async (endpoint, options = {}) => {
  const isFormData = options.body instanceof FormData;
  const accessToken = getAccessToken();
  const fallbackEnabled = isTokenFallbackEnabled();
  const requestHeaders = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  if (!requestHeaders.Authorization && accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const defaultOptions = {
    ...options,
    credentials: 'include',
    headers: requestHeaders,
  };

  let response = await fetch(`${API_URL}${endpoint}`, defaultOptions);

  // Excluimos las rutas de auth y refresh para prevenir loops infinitos.
  if (response.status === 401 && !endpoint.includes('/auth/')) {
    if (options._retry) {
      return response;
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => apiFetch(endpoint, { ...options, _retry: true }))
        .catch((err) => {
          throw err;
        });
    }

    isRefreshing = true;

    try {
      const refreshRequestOptions = {
        method: 'POST',
        credentials: 'include',
      };

      if (fallbackEnabled) {
        refreshRequestOptions.headers = { 'Content-Type': 'application/json' };
        refreshRequestOptions.body = JSON.stringify({ refreshToken: getRefreshToken() });
      }

      const refreshRes = await fetch(`${API_URL}/auth/refresh`, refreshRequestOptions);

      if (!refreshRes.ok) {
        processQueue(new Error('Refresh auth failed'), null);
        throw new Error('No se pudo refrescar credenciales automaticas');
      }

      const refreshPayload = await refreshRes.json();
      if (
        fallbackEnabled &&
        (!refreshPayload?.data?.accessToken || !refreshPayload?.data?.refreshToken)
      ) {
        processQueue(new Error('Refresh fallback tokens missing'), null);
        throw new Error('No se pudo renovar credenciales de Safari');
      }

      saveAuthTokens({
        accessToken: refreshPayload?.data?.accessToken,
        refreshToken: refreshPayload?.data?.refreshToken,
      });

      processQueue(null, true);
      return await apiFetch(endpoint, { ...options, _retry: true });
    } catch {
      clearUiSession();
      toast.error('Tu sesion ha expirado', { id: 'session-expired' });
      globalThis.location.href = '/login';
      return response;
    } finally {
      isRefreshing = false;
    }
  }

  return response;
};

// --- SOPORTE PARA METODOS HTTP ---
apiFetch.get = (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: 'GET' });

apiFetch.post = (endpoint, body, options = {}) =>
  apiFetch(endpoint, {
    ...options,
    method: 'POST',
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  });

apiFetch.put = (endpoint, body, options = {}) =>
  apiFetch(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  });

apiFetch.delete = (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: 'DELETE' });

apiFetch.patch = (endpoint, body, options = {}) =>
  apiFetch(endpoint, {
    ...options,
    method: 'PATCH',
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  });

export default apiFetch;
