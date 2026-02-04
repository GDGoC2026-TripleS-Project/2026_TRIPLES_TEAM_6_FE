import { create } from 'zustand';

interface OptionGroup {
  chipSelected: Set<string>;
  stepperCounts: Record<string, number>;
  brandName: string;
  menuName: string;
  temperature?: string;
  size?: string;
  date?: Date;
  caffeine?: number;  
  sugar?: number;   
}

interface OptionState {
  groups: Record<string, OptionGroup>;
  toggleChip: (groupId: string, chipId: string) => void;
  setStepper: (groupId: string, stepperId: string, value: number) => void;
  resetGroup: (groupId: string) => void;
  getGroupData: (groupId: string) => OptionGroup | undefined;
  getAllGroupsData: () => Record<string, OptionGroup>;
  setGroupInfo: (groupId: string, info: Partial<OptionGroup>) => void;
  getGroupsByDate: (date: Date) => OptionGroup[];
  getDailyStats: (date: Date) => { caffeine: number; sugar: number; count: number };
}

// 날짜를 YYYY-MM-DD 형식으로 변환
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useOptionStore = create<OptionState>((set, get) => ({
  groups: {},

  toggleChip: (groupId, chipId) => {
    set((state) => {
      const group = state.groups[groupId] || {
        chipSelected: new Set<string>(),
        stepperCounts: {},
        brandName: '',
        menuName: '',
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
        brandName: '',
        menuName: '',
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

  setGroupInfo: (groupId, info) => {
    set((state) => {
      const group = state.groups[groupId] || {
        chipSelected: new Set<string>(),
        stepperCounts: {},
        brandName: '',
        menuName: '',
      };

      return {
        groups: {
          ...state.groups,
          [groupId]: {
            ...group,
            ...info,
          },
        },
      };
    });
  },

  getGroupsByDate: (date) => {
    const targetDate = formatDate(date);
    const groups = get().groups;
    
    return Object.values(groups).filter(group => {
      if (!group.date) return false;
      return formatDate(group.date) === targetDate;
    });
  },

  getDailyStats: (date) => {
    const groups = get().getGroupsByDate(date);
    
    const stats = groups.reduce(
      (acc, group) => ({
        caffeine: acc.caffeine + (group.caffeine || 0),
        sugar: acc.sugar + (group.sugar || 0),
        count: acc.count + 1,
      }),
      { caffeine: 0, sugar: 0, count: 0 }
    );

    return stats;
  },
}));