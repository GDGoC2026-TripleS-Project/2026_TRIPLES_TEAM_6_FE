import { api } from '../../lib/api/client';
import type { ApiResponse } from '../../lib/api/types';
import { normalizeApiResponse } from '../../lib/api/response';
import { storage } from '../../utils/storage';
import { storageKeys } from '../../constants/storageKeys';

export type MenuTemperature = 'HOT' | 'ICED';

export type MenuDetail = {
  id: number;
  brandId: number;
  brandName: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  availableTemperatures: MenuTemperature[];
};

export type MenuSizeNutrition = {
  caffeineMg: number;
  sugarG: number;
  calories: number;
  sodiumMg: number;
  proteinG: number;
  fatG: number;
};

export type MenuSize = {
  menuSizeId: number;
  sizeName: string;
  volumeMl: number;
  nutrition: MenuSizeNutrition;
};

export type MenuSizeDetail = {
  menuSizeId: number;
  menuId: number;
  menuName: string;
  brandName: string;
  temperature: MenuTemperature;
  sizeName: string;
  volumeMl: number;
  nutrition: MenuSizeNutrition;
};

export type MenuSearchItem = {
  id: number;
  brandName: string;
  name: string;
  imageUrl: string;
};

export type MenuSearchResponse = {
  content: MenuSearchItem[];
  page: number;
  hasNext: boolean;
};

export type BrandMenuItem = {
  id: number;
  name: string;
  category: string;
  imageUrl: string;
};

export type BrandMenuResponse = {
  content: BrandMenuItem[];
  page: number;
  hasNext: boolean;
};

export const fetchMenuDetail = async (menuId: number | string) => {
  const res = await api.get<ApiResponse<MenuDetail>>(`/menus/${menuId}`);
  return normalizeApiResponse(res.data);
};

export const fetchMenuSizes = async (menuId: number | string, temperature: MenuTemperature) => {
  const loginId = await storage.get(storageKeys.loginId);
  const res = await api.get<ApiResponse<MenuSize[]>>(`/menus/${menuId}/sizes`, {
    params: loginId ? { temperature, loginId } : { temperature },
  });
  return normalizeApiResponse(res.data);
};

export const fetchMenuSizeDetail = async (menuSizeId: number | string) => {
  const loginId = await storage.get(storageKeys.loginId);
  const res = await api.get<ApiResponse<MenuSizeDetail>>(`/menus/sizes/${menuSizeId}`, {
    params: loginId ? { loginId } : undefined,
  });
  return normalizeApiResponse(res.data);
};

export const searchMenus = async (params: {
  keyword: string;
  page?: number;
  size?: number;
}) => {
  const res = await api.get<ApiResponse<MenuSearchResponse>>('/menus/search', { params });
  return normalizeApiResponse(res.data);
};

export const fetchBrandMenus = async (
  brandId: number | string,
  params?: {
    category?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }
) => {
  const res = await api.get<ApiResponse<BrandMenuResponse>>(`/brands/${brandId}/menus`, {
    params,
  });
  return normalizeApiResponse(res.data);
};
