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
  isFavorite: boolean;
};

export type BrandMenuItem = {
  id: number;
  name: string;
  category: string;
  imageUrl: string;
  isFavorite: boolean;
};

type PaginatedResponse<T> = {
  content: T[];
  page: number;
  hasNext: boolean;
};

type ListResponse<T> = T[] | PaginatedResponse<T>;

const isPaginatedResponse = <T>(data: ListResponse<T>): data is PaginatedResponse<T> => {
  return !!data && Array.isArray((data as PaginatedResponse<T>).content);
};

const extractList = <T>(data: ListResponse<T>): T[] => {
  if (Array.isArray(data)) return data;
  if (isPaginatedResponse<T>(data)) return data.content;
  return [];
};

export type MenuFavoriteResponse = {
  favorited: boolean;
};

export type MenuFavoriteDeleteResponse = {
  unfavorited: boolean;
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
  const res = await api.get<ApiResponse<ListResponse<MenuSearchItem>>>('/menus/search', {
    params: { keyword: params.keyword },
  });
  const normalized = normalizeApiResponse(res.data);
  if (!normalized.success || !normalized.data) {
    return normalized as ApiResponse<MenuSearchItem[]>;
  }

  if (!isPaginatedResponse<MenuSearchItem>(normalized.data)) {
    return { ...normalized, data: extractList(normalized.data) };
  }

  let items = extractList(normalized.data);
  let page = normalized.data.page;
  let hasNext = normalized.data.hasNext;

  while (hasNext) {
    page += 1;
    const size = params.size;
    const nextRes = await api.get<ApiResponse<ListResponse<MenuSearchItem>>>('/menus/search', {
      params: {
        keyword: params.keyword,
        page,
        ...(size ? { size } : {}),
      },
    });
    const nextNormalized = normalizeApiResponse(nextRes.data);
    if (!nextNormalized.success || !nextNormalized.data) break;
    if (isPaginatedResponse<MenuSearchItem>(nextNormalized.data)) {
      items = items.concat(nextNormalized.data.content);
      hasNext = nextNormalized.data.hasNext;
    } else {
      items = items.concat(extractList(nextNormalized.data));
      break;
    }
  }

  return { ...normalized, data: items };
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
  const res = await api.get<ApiResponse<ListResponse<BrandMenuItem>>>(
    `/brands/${brandId}/menus`,
    { params: { category: params?.category, keyword: params?.keyword } }
  );
  const normalized = normalizeApiResponse(res.data);
  if (!normalized.success || !normalized.data) {
    return normalized as ApiResponse<BrandMenuItem[]>;
  }

  if (!isPaginatedResponse<BrandMenuItem>(normalized.data)) {
    return { ...normalized, data: extractList(normalized.data) };
  }

  let items = extractList(normalized.data);
  let page = normalized.data.page;
  let hasNext = normalized.data.hasNext;

  while (hasNext) {
    page += 1;
    const size = params?.size;
    const nextRes = await api.get<ApiResponse<ListResponse<BrandMenuItem>>>(
      `/brands/${brandId}/menus`,
      {
        params: {
          category: params?.category,
          keyword: params?.keyword,
          page,
          ...(size ? { size } : {}),
        },
      }
    );
    const nextNormalized = normalizeApiResponse(nextRes.data);
    if (!nextNormalized.success || !nextNormalized.data) break;
    if (isPaginatedResponse<BrandMenuItem>(nextNormalized.data)) {
      items = items.concat(nextNormalized.data.content);
      hasNext = nextNormalized.data.hasNext;
    } else {
      items = items.concat(extractList(nextNormalized.data));
      break;
    }
  }

  return { ...normalized, data: items };
};

export const addMenuFavorite = async (menuId: number | string) => {
  const res = await api.post<ApiResponse<MenuFavoriteResponse>>(
    `/menus/${menuId}/favorites`
  );
  return normalizeApiResponse(res.data);
};

export const deleteMenuFavorite = async (menuId: number | string) => {
  const res = await api.delete<ApiResponse<MenuFavoriteDeleteResponse>>(
    `/menus/${menuId}/favorites`
  );
  return normalizeApiResponse(res.data);
};
