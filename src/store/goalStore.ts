import { create } from 'zustand';
import { storage } from '../utils/storage';
import { storageKeys } from '../constants/storageKeys';
import { userApiLayer } from '../app/features/user/user.api';
import { useAuthStore } from '../app/features/auth/auth.store';

type GoalState = {
  caffeine: number;
  sugar: number;

  setGoals: (goals: { caffeine: number; sugar: number }) => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useGoalStore = create<GoalState>((set) => ({
  caffeine: 400,
  sugar: 25,

  setGoals: async ({ caffeine, sugar }) => {
    set({
      caffeine,
      sugar,
    });
    await Promise.all([
      storage.set(storageKeys.goalCaffeine, String(caffeine)),
      storage.set(storageKeys.goalSugar, String(sugar)),
    ]);

    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) return;

    try {
      await userApiLayer.updateGoals({ caffeine, sugar });
      if (__DEV__) console.log('[GOALS SYNC]', { caffeine, sugar });
    } catch (e) {
      if (__DEV__) console.log('[GOALS SYNC ERROR]', e);
    }
  },

  hydrate: async () => {
    const [cRaw, sRaw] = await Promise.all([
      storage.get(storageKeys.goalCaffeine),
      storage.get(storageKeys.goalSugar),
    ]);
    const caffeine = cRaw !== null ? Number(cRaw) : undefined;
    const sugar = sRaw !== null ? Number(sRaw) : undefined;
    set((state) => ({
      caffeine: Number.isFinite(caffeine) ? (caffeine as number) : state.caffeine,
      sugar: Number.isFinite(sugar) ? (sugar as number) : state.sugar,
    }));
  },
}));
