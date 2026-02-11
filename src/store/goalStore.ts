import { create } from 'zustand';
import { storage } from '../utils/storage';
import { storageKeys } from '../constants/storageKeys';
import { userApiLayer, type GoalsPeriod, type GoalsRaw } from '../app/features/user/user.api';

type GoalState = {
  caffeine: number;
  sugar: number;
  goalByDate: Record<string, { caffeine: number; sugar: number }>;

  setGoals: (goals: { caffeine: number; sugar: number; effectiveDate?: string }) => void;
  setGoalsLocal: (goals: { caffeine: number; sugar: number; effectiveDate?: string }) => Promise<void>;
  hydrate: () => Promise<void>;
  getGoalsForDate: (date: string) => Promise<void>;
};

const MAX_GOAL_CACHE_DAYS = 60;

const parseGoalCache = (raw: string | null) => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, { caffeine: number; sugar: number }>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const pruneGoalCache = (cache: Record<string, { caffeine: number; sugar: number }>) => {
  const entries = Object.entries(cache).sort(([a], [b]) => (a < b ? 1 : -1));
  const trimmed = entries.slice(0, MAX_GOAL_CACHE_DAYS);
  return Object.fromEntries(trimmed);
};

export const useGoalStore = create<GoalState>((set) => ({
  caffeine: 400,
  sugar: 25,
  goalByDate: {},

  setGoals: async ({ caffeine, sugar, effectiveDate }) => {
    const targetDate = effectiveDate ?? todayString();
    set((state) => ({
      caffeine,
      sugar,
      goalByDate: {
        ...state.goalByDate,
        [targetDate]: { caffeine, sugar },
      },
    }));
    await Promise.all([
      storage.set(storageKeys.goalCaffeine, String(caffeine)),
      storage.set(storageKeys.goalSugar, String(sugar)),
    ]);
    try {
      const cachedRaw = await storage.get(storageKeys.goalByDateCache);
      const cache = pruneGoalCache({
        ...parseGoalCache(cachedRaw),
        [targetDate]: { caffeine, sugar },
      });
      await storage.set(storageKeys.goalByDateCache, JSON.stringify(cache));
    } catch {
      // ignore cache persistence errors
    }
    try {
      await userApiLayer.updateGoals({ caffeine, sugar, startDate: targetDate });
    } catch {
      // keep local goals even if API update fails
    }
  },
  setGoalsLocal: async ({ caffeine, sugar, effectiveDate }) => {
    const targetDate = effectiveDate ?? todayString();
    set((state) => ({
      caffeine,
      sugar,
      goalByDate: {
        ...state.goalByDate,
        [targetDate]: { caffeine, sugar },
      },
    }));
    await Promise.all([
      storage.set(storageKeys.goalCaffeine, String(caffeine)),
      storage.set(storageKeys.goalSugar, String(sugar)),
    ]);
    try {
      const cachedRaw = await storage.get(storageKeys.goalByDateCache);
      const cache = pruneGoalCache({
        ...parseGoalCache(cachedRaw),
        [targetDate]: { caffeine, sugar },
      });
      await storage.set(storageKeys.goalByDateCache, JSON.stringify(cache));
    } catch {
      // ignore cache persistence errors
    }
  },
  

  hydrate: async () => {
    const [cRaw, sRaw, cacheRaw] = await Promise.all([
      storage.get(storageKeys.goalCaffeine),
      storage.get(storageKeys.goalSugar),
      storage.get(storageKeys.goalByDateCache),
    ]);
    const caffeine = cRaw !== null ? Number(cRaw) : undefined;
    const sugar = sRaw !== null ? Number(sRaw) : undefined;
    const cachedGoals = parseGoalCache(cacheRaw);
    set((state) => {
      const nextCaffeine = Number.isFinite(caffeine) ? (caffeine as number) : state.caffeine;
      const nextSugar = Number.isFinite(sugar) ? (sugar as number) : state.sugar;
      const today = todayString();
      const cachedToday = cachedGoals[today];
      return {
        caffeine: nextCaffeine,
        sugar: nextSugar,
        goalByDate: {
          ...state.goalByDate,
          ...cachedGoals,
          [today]: {
            caffeine: cachedToday?.caffeine ?? nextCaffeine,
            sugar: cachedToday?.sugar ?? nextSugar,
          },
        },
      };
    });
  },

  getGoalsForDate: async (date: string) => {
    const { goalByDate } = useGoalStore.getState();
    if (goalByDate[date]) return;

    try {
      const cachedRaw = await storage.get(storageKeys.goalByDateCache);
      const cache = parseGoalCache(cachedRaw);
      const cached = cache[date];
      if (cached) {
        set((state) => ({
          goalByDate: {
            ...state.goalByDate,
            [date]: cached,
          },
        }));
      }
    } catch {
      // ignore cache read errors
    }

    try {
      const res = await userApiLayer.getGoals({ date });
      const record = pickGoalRecord(res.data?.data, date);
      if (!record) return;

      const caffeineTarget =
        'dailyCaffeineTarget' in record
          ? record.dailyCaffeineTarget
          : record.caffeine ?? record.caffeineLimit;
      const sugarTarget =
        'dailySugarTarget' in record
          ? record.dailySugarTarget
          : record.sugar ?? record.sugarLimit;

      if (typeof caffeineTarget === 'number' && typeof sugarTarget === 'number') {
        set((state) => {
          const next = {
            ...state.goalByDate,
            [date]: { caffeine: caffeineTarget, sugar: sugarTarget },
          };
          return { goalByDate: next };
        });
        try {
          const cachedRaw = await storage.get(storageKeys.goalByDateCache);
          const cache = pruneGoalCache({
            ...parseGoalCache(cachedRaw),
            [date]: { caffeine: caffeineTarget, sugar: sugarTarget },
          });
          await storage.set(storageKeys.goalByDateCache, JSON.stringify(cache));
        } catch {
          // ignore cache persistence errors
        }
      }
    } catch {
      // ignore goal fetch errors and keep fallback
    }
  },
}));

const todayString = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const pickGoalRecord = (
  raw: GoalsRaw | GoalsPeriod | GoalsPeriod[] | undefined,
  date: string
): GoalsRaw | GoalsPeriod | undefined => {
  if (!raw) return undefined;
  if (!Array.isArray(raw)) return raw;
  return raw.find((item) => isDateInRange(date, item.startDate, item.endDate));
};

const isDateInRange = (date: string, start?: string, end?: string) => {
  if (!start) return false;
  if (!end) return date >= start;
  return date >= start && date <= end;
};
