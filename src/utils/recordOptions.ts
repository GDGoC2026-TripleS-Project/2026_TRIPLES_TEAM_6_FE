export type OptionSelections = {
  coffee?: Record<string, number>;
  syrup?: Record<string, number>;
  milk?: string[];
};

export type OptionNamesMap = Record<string, string>;
export type OptionNutritionMap = Record<string, { caffeineMg?: number; sugarG?: number }>;

type GroupLike = {
  stepperCounts?: Record<string, number>;
  chipSelected?: Set<string>;
  optionNames?: OptionNamesMap;
  temperature?: string;
  size?: string;
};

const resolveOptionName = (id: string, optionNames?: OptionNamesMap) =>
  optionNames?.[id] || id;

export const buildOptionBase = (temperature?: string, size?: string) => {
  if (!temperature) return size ?? '';
  const temp = temperature === 'hot' ? 'Hot' : 'Ice';
  return size ? `${temp} | ${size}` : temp;
};

export const buildOptionPartsFromSelections = (
  options: OptionSelections,
  optionNames?: OptionNamesMap
) => {
  const parts: string[] = [];

  if (options.coffee) {
    Object.entries(options.coffee).forEach(([key, count]) => {
      if (count > 0) parts.push(`${resolveOptionName(key, optionNames)} ${count}`);
    });
  }

  if (options.syrup) {
    Object.entries(options.syrup).forEach(([key, count]) => {
      if (count > 0) parts.push(`${resolveOptionName(key, optionNames)} ${count}`);
    });
  }

  if (options.milk && options.milk.length > 0) {
    options.milk.forEach((id) => parts.push(resolveOptionName(id, optionNames)));
  }

  return parts;
};

export const buildOptionInfoFromSelections = (
  options: OptionSelections,
  optionNames?: OptionNamesMap,
  temperature?: string,
  size?: string
) => ({
  base: buildOptionBase(temperature, size),
  extra: buildOptionPartsFromSelections(options, optionNames),
});

export const buildOptionInfoFromGroup = (group: GroupLike) => {
  const parts: string[] = [];
  const optionNames = group.optionNames;

  if (group.stepperCounts) {
    Object.entries(group.stepperCounts).forEach(([key, count]) => {
      if (count > 0) parts.push(`${resolveOptionName(key, optionNames)} ${count}`);
    });
  }

  if (group.chipSelected && group.chipSelected.size > 0) {
    group.chipSelected.forEach((id) => parts.push(resolveOptionName(id, optionNames)));
  }

  return {
    base: buildOptionBase(group.temperature, group.size),
    extra: parts,
  };
};

export const calculateTotals = (params: {
  baseCaffeine: number;
  baseSugar: number;
  options: OptionSelections;
  optionNutrition?: OptionNutritionMap;
}) => {
  const { baseCaffeine, baseSugar, options, optionNutrition } = params;
  let totalCaffeine = baseCaffeine;
  let totalSugar = baseSugar;

  const applyNutrition = (id: string, count = 1) => {
    const nutrition = optionNutrition?.[id];
    if (nutrition) {
      totalCaffeine += (nutrition.caffeineMg ?? 0) * count;
      totalSugar += (nutrition.sugarG ?? 0) * count;
      return true;
    }
    return false;
  };

  if (options.coffee) {
    Object.entries(options.coffee).forEach(([key, count]) => {
      if (count <= 0) return;
      const used = applyNutrition(key, count);
      if (!used && (key === 'shot' || key === 'decafaine')) {
        totalCaffeine += count * (key === 'decafaine' ? 5 : 75);
      }
    });
  }

  if (options.syrup) {
    Object.entries(options.syrup).forEach(([key, count]) => {
      if (count <= 0) return;
      const used = applyNutrition(key, count);
      if (!used) totalSugar += count * 5;
    });
  }

  if (options.milk && options.milk.length > 0) {
    options.milk.forEach((id) => {
      applyNutrition(id, 1);
    });
  }

  return { caffeine: totalCaffeine, sugar: totalSugar };
};
