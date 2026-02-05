import type { ApiError, ApiResponse } from './types';

export const normalizeApiResponse = <T>(res: ApiResponse<T>): ApiResponse<T> => {
  const hasData = (res as any)?.data !== undefined;
  const hasError = (res as any)?.error !== undefined;

  if (__DEV__ && res.success && hasError) {
    console.log('[API WARN] success=true but error present:', (res as any)?.error as ApiError);
  }

  if (!res.success && hasData) {
    if (__DEV__) {
      console.log('[API WARN] success=false but data present. using data.');
    }
    return {
      success: true,
      data: (res as any).data as T,
      timestamp: (res as any).timestamp ?? new Date().toISOString(),
    };
  }

  return res;
};
