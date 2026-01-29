import { useOptionStore } from '../store/useOptionStore';

export const useOptionGroup = (groupId: string) => {
  const group = useOptionStore(state => state.groups[groupId]);
  const toggleChip = useOptionStore(state => state.toggleChip);
  const setStepper = useOptionStore(state => state.setStepper);
  const resetGroup = useOptionStore(state => state.resetGroup);

  const hasChanged = group
    ? group.chipSelected.size > 0 || Object.values(group.stepperCounts).some(count => count > 0)
    : false;

  return {
    hasChanged,
    chipSelected: group?.chipSelected ?? new Set<string>(),
    stepperCounts: group?.stepperCounts ?? {},

    toggleChip: (chipId: string) => toggleChip(groupId, chipId),
    setStepper: (stepperId: string, value: number) =>
      setStepper(groupId, stepperId, value),
    reset: () => resetGroup(groupId),
  };
};