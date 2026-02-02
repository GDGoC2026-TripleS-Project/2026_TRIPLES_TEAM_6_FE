import { create } from 'zustand';

interface OptionGroup {
  chipSelected: Set<string>;
  stepperCounts: Record<string, number>;
}

interface OptionState {
  groups: Record<string, OptionGroup>;
  toggleChip: (groupId: string, chipId: string) => void;
  setStepper: (groupId: string, stepperId: string, value: number) => void;
  resetGroup: (groupId: string) => void;
  getGroupData: (groupId: string) => OptionGroup | undefined;
  getAllGroupsData: () => Record<string, OptionGroup>;
}

export const useOptionStore = create<OptionState>((set, get) => ({
  groups: {},

  toggleChip: (groupId, chipId) => {
    set((state) => {
      const group = state.groups[groupId] || {
        chipSelected: new Set<string>(),
        stepperCounts: {},
      };

      const newSelected = new Set(group.chipSelected);
      if (newSelected.has(chipId)) {
        newSelected.delete(chipId);
      } else {
        newSelected.add(chipId);
      }

      return {
        groups: {
          ...state.groups,
          [groupId]: {
            ...group,
            chipSelected: newSelected,
          },
        },
      };
    });
  },

  setStepper: (groupId, stepperId, value) => {
    set((state) => {
      const group = state.groups[groupId] || {
        chipSelected: new Set<string>(),
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
    });
  },

  resetGroup: (groupId) => {
    set((state) => {
      const newGroups = { ...state.groups };
      delete newGroups[groupId];
      return { groups: newGroups };
    });
  },

  getGroupData: (groupId) => {
    return get().groups[groupId];
  },

  getAllGroupsData: () => {
    return get().groups;
  },
}));