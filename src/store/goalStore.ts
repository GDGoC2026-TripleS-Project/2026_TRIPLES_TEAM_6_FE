import { create } from 'zustand';
import { storage } from '../utils/storage';
import { storageKeys } from '../constants/storageKeys';
import { userApiLayer, type GoalsPeriod, type GoalsRaw } from '../app/features/user/user.api';

type GoalState = {
  caffeine: number;
  sugar: number;
  goalByDate: Record<string, { caffeine: number; sugar: number }>;

  setGoals: (goals: { caffeine: number; sugar: number; effectiveDate?: string }) => void;
  hydrate: () => Promise<void>;
  getGoalsForDate: (date: string) => Promise<void>;
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
      await userApiLayer.updateGoals({ caffeine, sugar, startDate: targetDate });
    } catch {
      // keep local goals even if API update fails
    }
  },
  

  hydrate: async () => {
    const [cRaw, sRaw] = await Promise.all([
      storage.get(storageKeys.goalCaffeine),
      storage.get(storageKeys.goalSugar),
    ]);
    const caffeine = cRaw !== null ? Number(cRaw) : undefined;
    const sugar = sRaw !== null ? Number(sRaw) : undefined;
    set((state) => {
      const nextCaffeine = Number.isFinite(caffeine) ? (caffeine as number) : state.caffeine;
      const nextSugar = Number.isFinite(sugar) ? (sugar as number) : state.sugar;
      const today = todayString();
      return {
        caffeine: nextCaffeine,
        sugar: nextSugar,
        goalByDate: {
          ...state.goalByDate,
          [today]: { caffeine: nextCaffeine, sugar: nextSugar },
        },
      };
    });
  },

  getGoalsForDate: async (date: string) => {
    const { goalByDate } = useGoalStore.getState();
    if (goalByDate[date]) return;

    try {
      const res = await userApiLayer.getGoals({ date });
      const record = pickGoalRecord(res.data?.data, date);
      if (!record) return;

      const caffeineTarget =
        record.dailyCaffeineTarget ??
        (record as GoalsRaw).caffeine ??
        (record as GoalsRaw).caffeineLimit;
      const sugarTarget =
        record.dailySugarTarget ??
        (record as GoalsRaw).sugar ??
        (record as GoalsRaw).sugarLimit;

      if (typeof caffeineTarget === 'number' && typeof sugarTarget === 'number') {
        set((state) => ({
          goalByDate: {
            ...state.goalByDate,
            [date]: { caffeine: caffeineTarget, sugar: sugarTarget },
          },
        }));
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
