import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../../utils/storage';
import { storageKeys } from '../../constants/storageKeys';

const BASE_URL = 'https://lastcup.site/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// accessToken 자동으로 안 붙는 인스턴스(공개/인증/리프레시 용)
export const authApi = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await storage.get(storageKeys.accessToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

    // 401 아니거나, 이미 재시도한 요청이면 그대로 throw
    if (status !== 401 || original?._retry) return Promise.reject(error);

    original._retry = true;

    const refreshToken = await storage.get(storageKeys.refreshToken);
    if (!refreshToken) return Promise.reject(error);

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((newToken) => {
          if (!newToken) return reject(error);
          original.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(original));
        });
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

      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (e) {
      runQueue(null);
      await storage.multiRemove([storageKeys.accessToken, storageKeys.refreshToken]);
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);
