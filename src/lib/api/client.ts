// src/lib/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../../utils/storage';
import { storageKeys } from '../../constants/storageKeys';

const BASE_URL = 'https://YOUR_DOMAIN.com/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

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

    if (status !== 401 || original?._retry) {
      return Promise.reject(error);
    }

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

      const newAccess = refreshRes.data?.data?.accessToken;
      const newRefresh = refreshRes.data?.data?.refreshToken;

      if (!newAccess || !newRefresh) throw new Error('Invalid refresh response');

      await Promise.all([
        storage.set(storageKeys.accessToken, newAccess),
        storage.set(storageKeys.refreshToken, newRefresh),
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