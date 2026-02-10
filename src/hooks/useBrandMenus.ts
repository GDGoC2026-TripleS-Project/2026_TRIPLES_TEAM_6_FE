import { useEffect, useRef, useState } from 'react';
import { fetchBrandMenus, type BrandMenuItem } from '../api/record/menu.api';

type UseBrandMenusOptions = {
  brandId: number | string;
  category?: string;
  keyword?: string;
  debounceMs?: number;
  enabled?: boolean;
};

type UseBrandMenusResult = {
  menus: BrandMenuItem[];
  isLoading: boolean;
  error: string | null;
};

export const useBrandMenus = ({
  brandId,
  category,
  keyword,
  debounceMs = 250,
  enabled = true,
}: UseBrandMenusOptions): UseBrandMenusResult => {
  const [menus, setMenus] = useState<BrandMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || !brandId) {
      setMenus([]);
      return;
    }

    const t = setTimeout(() => {
      if (!mountedRef.current) return;
      setIsLoading(true);
      setError(null);
      fetchBrandMenus(brandId, {
        category,
        keyword: keyword?.trim() || undefined,
      })
        .then((res) => {
          if (!mountedRef.current) return;
          if (res.success && res.data) {
            setMenus(res.data);
          } else {
            setError(res.error?.message ?? '메뉴를 불러오지 못했어요.');
          }
        })
        .catch(() => {
          if (!mountedRef.current) return;
          setError('메뉴를 불러오지 못했어요.');
        })
        .finally(() => {
          if (mountedRef.current) setIsLoading(false);
        });
    }, debounceMs);

    return () => {
      clearTimeout(t);
    };
  }, [brandId, category, keyword, debounceMs, enabled]);

  return { menus, isLoading, error };
};
