import { create } from 'zustand';
import { storage } from '../utils/storage';
import { storageKeys } from '../constants/storageKeys';

type SkipState = {
  skippedByDate: Record<string, boolean>;
  setSkip: (date: string, value: boolean) => Promise<void>;
  hydrate: () => Promise<void>;
};

const MAX_SKIP_CACHE_DAYS = 120;

const parseSkipCache = (raw: string | null) => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const pruneSkipCache = (cache: Record<string, boolean>) => {
  const entries = Object.entries(cache)
    .filter(([, v]) => v)
    .sort(([a], [b]) => (a < b ? 1 : -1));
  const trimmed = entries.slice(0, MAX_SKIP_CACHE_DAYS);
  return Object.fromEntries(trimmed);
};

export const useSkipStore = create<SkipState>((set) => ({
  skippedByDate: {},

  setSkip: async (date: string, value: boolean) => {
    set((state) => {
      const next = { ...state.skippedByDate };
      if (value) next[date] = true;
      else delete next[date];
      return { skippedByDate: next };
    });

    try {
      const cachedRaw = await storage.get(storageKeys.skipByDateCache);
      const cache = pruneSkipCache({
        ...parseSkipCache(cachedRaw),
        ...(value ? { [date]: true } : {}),
      });
      if (!value) {
        delete cache[date];
      }
      await storage.set(storageKeys.skipByDateCache, JSON.stringify(cache));
    } catch {
      // ignore cache persistence errors
    }
  },

  hydrate: async () => {
    try {
      const cacheRaw = await storage.get(storageKeys.skipByDateCache);
      const cached = parseSkipCache(cacheRaw);
      set({ skippedByDate: cached });
    } catch {
      // ignore cache read errors
    }
  },
}));
