import type { ApiError, ApiResponse } from './types';

export const normalizeApiResponse = <T>(res: ApiResponse<T>): ApiResponse<T> => {
  const hasData = (res as any)?.data !== undefined;
  const error = (res as any)?.error as ApiError | null | undefined;
  const hasError = error != null;

  if (__DEV__ && res.success && hasError) {
    console.log('[API WARN] success=true but error present:', error);
  }

  if (res.success && hasError && (error?.code || error?.message)) {
    return {
      success: false,
      error,
      data: (res as any)?.data as T | undefined,
      timestamp: (res as any).timestamp ?? new Date().toISOString(),
    };
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
