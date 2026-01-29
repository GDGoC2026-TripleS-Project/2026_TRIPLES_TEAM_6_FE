import { create } from 'zustand';

type OptionGroup = {
  chipSelected: Set<string>;
  stepperCounts: Record<string, number>;
};

type OptionState = {
  groups: Record<string, OptionGroup>;

  toggleChip: (groupId: string, chipId: string) => void;
  setStepper: (groupId: string, stepperId: string, value: number) => void;
  resetGroup: (groupId: string) => void;
};

export const useOptionStore = create<OptionState>((set) => ({
  groups: {},

  toggleChip: (groupId, chipId) =>
    set(state => {
      const group = state.groups[groupId] ?? {
        chipSelected: new Set(),
        stepperCounts: {},
      };

      const nextSet = new Set(group.chipSelected);
      nextSet.has(chipId) ? nextSet.delete(chipId) : nextSet.add(chipId);

      return {
        groups: {
          ...state.groups,
          [groupId]: {
            ...group,
            chipSelected: nextSet,
          },
        },
      };
    }),

  setStepper: (groupId, stepperId, value) =>
    set(state => {
      const group = state.groups[groupId] ?? {
        chipSelected: new Set(),
        stepperCounts: {},
      };

      return {
        groups: {
          ...state.groups,
          [groupId]: {
            ...group,
            stepperCounts: {
              ...group.stepperCounts,
              [stepperId]: value,
            },
          },
        },
      };
    }),

  resetGroup: (groupId) =>
    set(state => {
      const next = { ...state.groups };
      delete next[groupId];
      return { groups: next };
    }),
}));