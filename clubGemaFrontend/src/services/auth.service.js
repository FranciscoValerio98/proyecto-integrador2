import Cookies from 'js-cookie';
import { API_ROUTES } from '../constants/apiRoutes';
import {
  saveAuthTokens,
  getRefreshToken,
  clearAuthTokens,
  isSafariBrowser,
  enableTokenFallback,
  disableTokenFallback,
  isTokenFallbackEnabled,
} from '../utils/authTokens';

const API_URL = import.meta.env.VITE_API_URL;

const cookieConfig = {
  expires: 1,
  secure: globalThis.location.protocol === 'https:',
  sameSite: 'strict',
};

const clearVisibleAuthCookies = () => {
  Cookies.remove('user_role');
  Cookies.remove('user_name');
  Cookies.remove('user_lastname');
  Cookies.remove('user_id');
};

export const loginService = async (identifier, password) => {
  const payload = { username: identifier, password };

  const response = await fetch(`${API_URL}${API_ROUTES.AUTH.LOGIN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Error en el servidor');

  if (result.data) {
    const { accessToken, refreshToken, user } = result.data;

    if (user) {
      Cookies.set('user_role', user.rol, cookieConfig);
      Cookies.set('user_name', user.nombres, cookieConfig);
      Cookies.set('user_lastname', user.apellidos || '', cookieConfig);
      Cookies.set('user_id', user.id, cookieConfig);
    }

    // Default policy: keep fallback disabled and rely on HttpOnly cookies.
    disableTokenFallback();

    if (isSafariBrowser()) {
      try {
        const profileProbeResponse = await fetch(`${API_URL}/auth/profile`, {
          method: 'GET',
          credentials: 'include',
        });

        // Cookie path works in Safari; no storage fallback needed.
        if (!profileProbeResponse.ok) {
          throw new Error('Cookie probe failed');
        }
      } catch {
        // Safari fallback: activate storage + bearer only when cookie auth fails.
        if (!accessToken || !refreshToken) {
          clearVisibleAuthCookies();
          clearAuthTokens();
          throw new Error('No se pudo activar la sesión segura en Safari. Intenta nuevamente.');
        }

        enableTokenFallback();
        saveAuthTokens({ accessToken, refreshToken });
      }
    }
  }

  return result.data;
};

export const logoutService = async () => {
  const fallbackEnabled = isTokenFallbackEnabled();
  const refreshToken = getRefreshToken();
  const requestOptions = {
    method: 'POST',
    credentials: 'include',
  };

  if (fallbackEnabled && refreshToken) {
    requestOptions.headers = { 'Content-Type': 'application/json' };
    requestOptions.body = JSON.stringify({ refreshToken });
  }

  try {
    await fetch(`${API_URL}${API_ROUTES.AUTH.LOGOUT}`, requestOptions);
  } catch (error) {
    console.error('Error en la peticion de logout:', error);
  } finally {
    clearVisibleAuthCookies();

    // Limpieza de datos antiguos cacheados para evitar confusiones
    localStorage.removeItem('auth_sync');
    localStorage.removeItem('logout_sync');
    localStorage.removeItem('last_viewed_news');
    clearAuthTokens();

    globalThis.location.href = '/login';
  }
};

export const registerService = async (userData) => {
  const response = await fetch(`${API_URL}${API_ROUTES.USUARIOS.BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Error al registrar el usuario');
  }

  return result;
};

export const completarEmailService = async (nuevoEmail) => {
  const response = await fetch(`${API_URL}${API_ROUTES.AUTH.COMPLETAR_EMAIL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: nuevoEmail }),
    credentials: 'include',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Error al actualizar el correo');
  }

  return result.data;
};
