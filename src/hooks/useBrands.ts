import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { fetchBrands, type Brand } from '../api/record/brand.api';

type UseBrandsOptions = {
  favoritesOnly?: boolean;
  focusRefresh?: boolean;
};

type UseBrandsResult = {
  brands: Brand[];
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useBrands = (options?: UseBrandsOptions): UseBrandsResult => {
  const favoritesOnly = options?.favoritesOnly ?? false;
  const focusRefresh = options?.focusRefresh ?? false;

  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    if (!mountedRef.current) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchBrands();
      if (!mountedRef.current) return;
      if (res.success && res.data) {
        const data = favoritesOnly
          ? res.data.filter((brand) => brand.isFavorite)
          : res.data;
        setBrands(data);
      } else {
        setError(res.error?.message ?? '브랜드를 불러오지 못했어요.');
      }
    } catch {
      if (!mountedRef.current) return;
      setError('브랜드를 불러오지 못했어요.');
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [favoritesOnly]);

  useEffect(() => {
    if (!focusRefresh) refetch();
  }, [focusRefresh, refetch]);

  useFocusEffect(
    useCallback(() => {
      if (!focusRefresh) return;
      refetch();
      return undefined;
    }, [focusRefresh, refetch])
  );

  return { brands, setBrands, isLoading, error, refetch };
};
