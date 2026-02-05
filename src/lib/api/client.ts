import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../../utils/storage';
import { storageKeys } from '../../constants/storageKeys';

const BASE_URL = 'https://api.lastcup.site/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ✅ accessToken 자동으로 안 붙는 인스턴스(공개/인증/리프레시 용)
export const authApi = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

type JwtPayload = { exp?: number };

const decodeJwtPayload = (token: string): JwtPayload | null => {
  const parts = token.split('.');
  if (parts.length < 2) return null;

  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

  try {
    if (typeof globalThis.atob === 'function') {
      return JSON.parse(globalThis.atob(padded)) as JwtPayload;
    }
    if (typeof Buffer !== 'undefined') {
      return JSON.parse(Buffer.from(padded, 'base64').toString('utf-8')) as JwtPayload;
    }
  } catch (e) {
    if (__DEV__) console.log('[JWT DECODE ERROR]', e);
  }

  return null;
};

const isTokenExpired = (token: string, skewSeconds = 30): boolean => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now + skewSeconds;
};

/** =========================
 * Request Interceptors
 * ========================= */

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (__DEV__) {
    console.log(
      '[API REQ]',
      config.method?.toUpperCase(),
      String(config.baseURL) + String(config.url)
    );
    console.log('[API REQ BODY]', config.data);
  }

  let token = await storage.get(storageKeys.accessToken);
  if (token && isTokenExpired(token)) {
    if (__DEV__) console.log('[API AUTH] accessToken expired, refreshing...');
    token = await refreshAccessToken();
    if (!token && __DEV__) {
      console.log('[API AUTH] refresh failed, tokens cleared');
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    if (__DEV__) {
      const masked = `${token.slice(0, 6)}...${token.slice(-4)}`;
      console.log('[API REQ AUTH] token:', masked);
    }
  } else if (__DEV__) {
    console.log('[API REQ AUTH] token: <none>');
  }

  return config;
});

authApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (__DEV__) {
    console.log(
      '[AUTH REQ]',
      config.method?.toUpperCase(),
      String(config.baseURL) + String(config.url)
    );
    console.log('[AUTH REQ BODY]', config.data);
  }
  return config;
});

/** =========================
 * Response Interceptor (401 -> Refresh)
 * ========================= */

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const runQueue = (token: string | null) => {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
};

const tryLogout = async (): Promise<void> => {
  try {
    const { useAuthStore } = await import('../../app/features/auth/auth.store');
    await useAuthStore.getState().logout();
  } catch (e) {
    if (__DEV__) console.log('[AUTH LOGOUT ERROR]', e);
    await storage.multiRemove([
      storageKeys.accessToken,
      storageKeys.refreshToken,
      storageKeys.autoLogin,
    ]);
  }
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = await storage.get(storageKeys.refreshToken);
  if (!refreshToken) return null;

  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshQueue.push(resolve);
    });
  }

  isRefreshing = true;

  try {
    const refreshRes = await authApi.post('/auth/refresh', null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });

    const newAccess = refreshRes.data?.data?.accessToken as string | undefined;
    const newRefresh = refreshRes.data?.data?.refreshToken as string | undefined;

    if (!newAccess) throw new Error('Invalid refresh response: accessToken missing');

    const finalRefresh = newRefresh ?? refreshToken;

    await Promise.all([
      storage.set(storageKeys.accessToken, newAccess),
      storage.set(storageKeys.refreshToken, finalRefresh),
    ]);

    runQueue(newAccess);
    return newAccess;
  } catch (e) {
    runQueue(null);
    await tryLogout();
    return null;
  } finally {
    isRefreshing = false;
  }
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<any>) => {
    const original = error.config as any;
    const status = error.response?.status;

    // ✅ 401 아니면 그대로 에러
    if (status !== 401) return Promise.reject(error);

    // ✅ 이미 재시도한 요청이면 그대로 에러(무한루프 방지)
    if (original?._retry) return Promise.reject(error);

    // ✅ auth 관련 경로는 refresh 재시도 대상에서 제외(무한루프 방지)
    if (original?.url?.includes('/auth/')) return Promise.reject(error);

    original._retry = true;

    try {
      const newAccess = await refreshAccessToken();
      if (!newAccess) return Promise.reject(error);

      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (e) {
      return Promise.reject(e);
    }
  }
);
