import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../../utils/storage';
import { storageKeys } from '../../constants/storageKeys';

const BASE_URL = 'https://lastcup.site/api/v1';

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

  const token = await storage.get(storageKeys.accessToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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

    const refreshToken = await storage.get(storageKeys.refreshToken);
    if (!refreshToken) return Promise.reject(error);

    // ✅ 이미 refresh 중이면 queue에 쌓았다가 토큰 갱신되면 재시도
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((newToken) => {
          if (!newToken) return reject(error);
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;

    try {
      // ✅ refreshToken은 "Refresh Token"을 Bearer로 보냄 (문서 정책 반영)
      const refreshRes = await authApi.post('/auth/refresh', null, {
        headers: { Authorization: `Bearer ${refreshToken}` },
      });

      const newAccess = refreshRes.data?.data?.accessToken as string | undefined;
      const newRefresh = refreshRes.data?.data?.refreshToken as string | undefined;

      if (!newAccess) throw new Error('Invalid refresh response: accessToken missing');

      // ✅ 서버가 refreshToken을 항상 주지 않는 정책일 수도 있어 대비
      const finalRefresh = newRefresh ?? refreshToken;

      await Promise.all([
        storage.set(storageKeys.accessToken, newAccess),
        storage.set(storageKeys.refreshToken, finalRefresh),
      ]);

      // ✅ 대기 중이던 요청들 처리
      runQueue(newAccess);

      // ✅ 원래 요청도 새 토큰으로 재시도
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (e) {
      // refresh 실패 → 대기 요청들 모두 실패 처리 + 토큰 삭제
      runQueue(null);
      await storage.multiRemove([storageKeys.accessToken, storageKeys.refreshToken]);
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);
