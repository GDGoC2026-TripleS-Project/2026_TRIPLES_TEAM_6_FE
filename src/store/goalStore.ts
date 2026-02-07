import { create } from 'zustand';

type GoalState = {
  caffeine: number;
  sugar: number;

  setGoals: (goals: { caffeine: number; sugar: number }) => void;
};

export const useGoalStore = create<GoalState>((set) => ({
  caffeine: 400,
  sugar: 25,

  setGoals: ({ caffeine, sugar }) =>
    set({
      caffeine,
      sugar,
    }),
}));