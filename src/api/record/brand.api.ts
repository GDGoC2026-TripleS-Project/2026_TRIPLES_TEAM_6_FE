import { api, authApi } from '../../lib/api/client';
import type { AxiosError } from 'axios';
import { storage } from '../../utils/storage';
import { storageKeys } from '../../constants/storageKeys';

export type Brand = {
  id: number;
  name: string;
  logoUrl: string;
  isFavorite: boolean;
};

export type ApiFieldError = {
  field: string;
  reason: string;
  rejectedValue: unknown;
};

export type ApiError = {
  code: string;
  message: string;
  fieldErrors?: ApiFieldError[];
};

export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      error?: never;
      timestamp: string;
    }
  | {
      success: false;
      data?: never;
      error: ApiError;
      timestamp: string;
    };

const normalizeBrands = (brands: Brand[], hasAuth: boolean): Brand[] => {
  const normalized = hasAuth
    ? brands
    : brands.map((b) => ({ ...b, isFavorite: false }));

  return [...normalized].sort((a, b) => {
    if (hasAuth && a.isFavorite !== b.isFavorite) {
      return Number(b.isFavorite) - Number(a.isFavorite);
    }
    return a.name.localeCompare(b.name);
  });
};

export const fetchBrands = async (): Promise<ApiResponse<Brand[]>> => {
  try {
    const token = await storage.get(storageKeys.accessToken);
    const hasAuth = Boolean(token);
    
    const res = await api.get<ApiResponse<Brand[]>>('/brands');
    
    if (!res.data) {
      throw new Error('응답 데이터가 없습니다');
    }

    if (res.data.success && res.data.data) {
      return {
        ...res.data,
        data: normalizeBrands(res.data.data, hasAuth),
      };
    }
    
    return res.data;
  } catch (err) {
    const status = (err as AxiosError)?.response?.status;
    const axiosErr = err as AxiosError;
    const cfg = axiosErr?.config;
    
    if (__DEV__) {
      console.log('[API ERR] /brands status:', status);
      console.log('[API ERR] /brands data:', (err as AxiosError)?.response?.data);
      console.log('[API ERR] /brands message:', axiosErr?.message);
      console.log('[API ERR] /brands code:', axiosErr?.code);
      console.log('[API ERR] /brands request:', {
        method: cfg?.method,
        baseURL: cfg?.baseURL,
        url: cfg?.url,
        params: cfg?.params,
        data: cfg?.data,
        timeout: cfg?.timeout,
        hasAuthHeader: Boolean(cfg?.headers && 'Authorization' in cfg.headers),
      });
      console.log('[API ERR] /brands response headers:', axiosErr?.response?.headers);
    }
    
    if (status === 401 || status === 403) {
      if (__DEV__) console.log('[API RETRY] /brands with authApi');
      
      const res = await authApi.get<ApiResponse<Brand[]>>('/brands');
      
      if (!res.data) {
        throw new Error('authApi 응답 데이터가 없습니다');
      }

      if (res.data.success && res.data.data) {
        return {
          ...res.data,
          data: normalizeBrands(res.data.data, false),
        };
      }
      
      return res.data;
    }
    
    throw err;
  }
};
