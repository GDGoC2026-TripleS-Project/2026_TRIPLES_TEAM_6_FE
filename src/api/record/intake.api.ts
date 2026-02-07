import { api } from '../../lib/api/client';
import type { ApiResponse } from '../../lib/api/types';
import { normalizeApiResponse } from '../../lib/api/response';

export type IntakeDrink = {
  id: string;
  brandName: string;
  menuName: string;
  optionText: string;
  caffeineMg: number;
  sugarG: number;
  calorieKcal?: number;
  sodiumMg?: number;
  proteinG?: number;
  fatG?: number;
  count?: number;
  recordedAt?: string;
};

export type DailyIntake = {
  date: string;
  totalCaffeineMg: number;
  totalSugarG: number;
  drinkCount: number;
  drinks: IntakeDrink[];
};

export type PeriodIntake = {
  startDate: string;
  endDate: string;
  totalCaffeineMg: number;
  totalSugarG: number;
  drinkCount: number;
  dates: string[];
};

export type IntakeDetail = IntakeDrink & {
  menuId?: number | string;
  brandId?: number | string;
  sizeName?: string;
  temperature?: 'HOT' | 'ICED';
  options?: Array<{ optionId: number | string; count?: number }>;
};

export type CreateIntakePayload = {
  menuSizeId?: number;
  menuId?: number | string;
  brandId?: number | string;
  recordedAt: string; // YYYY-MM-DD
  temperature?: 'HOT' | 'ICED';
  sizeName?: string;
  options?: Array<{ optionId: number | string; count?: number }>;
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
};

const toString = (value: unknown, fallback = '') => {
  if (typeof value === 'string') return value;
  if (value === undefined || value === null) return fallback;
  return String(value);
};

const normalizeOptionText = (raw: any) =>
  toString(
    raw?.optionText ??
      raw?.optionsText ??
      raw?.optionSummary ??
      raw?.optionDescription ??
      ''
  );

const normalizeDrink = (raw: any, index: number, fallbackDate?: string): IntakeDrink => {
  const nutrition = raw?.nutrition ?? {};
  return {
    id: toString(raw?.id ?? raw?.recordId ?? raw?.intakeId ?? `${index}`),
    brandName: toString(raw?.brandName ?? raw?.brand?.name ?? ''),
    menuName: toString(raw?.menuName ?? raw?.menu?.name ?? raw?.name ?? ''),
    optionText: normalizeOptionText(raw),
    caffeineMg: toNumber(
      raw?.caffeineMg ?? raw?.caffeine ?? nutrition?.caffeineMg ?? nutrition?.caffeine
    ),
    sugarG: toNumber(raw?.sugarG ?? raw?.sugar ?? nutrition?.sugarG ?? nutrition?.sugar),
    calorieKcal: toNumber(raw?.calorieKcal ?? raw?.calories ?? nutrition?.calorieKcal ?? nutrition?.calories),
    sodiumMg: toNumber(raw?.sodiumMg ?? nutrition?.sodiumMg),
    proteinG: toNumber(raw?.proteinG ?? nutrition?.proteinG),
    fatG: toNumber(raw?.fatG ?? nutrition?.fatG),
    count:
      raw?.count === undefined && raw?.quantity === undefined
        ? undefined
        : toNumber(raw?.count ?? raw?.quantity),
    recordedAt: toString(raw?.recordedAt ?? raw?.date ?? fallbackDate ?? ''),
  };
};

const normalizeDailyIntake = (raw: any, fallbackDate?: string): DailyIntake => {
  const drinksRaw = raw?.drinks ?? raw?.records ?? raw?.items ?? raw?.content ?? [];
  const drinks = Array.isArray(drinksRaw)
    ? drinksRaw.map((d, idx) => normalizeDrink(d, idx, fallbackDate))
    : [];

  const totalCaffeine = toNumber(
    raw?.totalCaffeineMg ?? raw?.caffeineTotal ?? raw?.totalCaffeine
  );
  const totalSugar = toNumber(raw?.totalSugarG ?? raw?.sugarTotal ?? raw?.totalSugar);
  const drinkCount = toNumber(raw?.drinkCount ?? raw?.count ?? drinks.length);

  return {
    date: toString(raw?.date ?? raw?.recordDate ?? fallbackDate ?? ''),
    totalCaffeineMg: totalCaffeine || drinks.reduce((acc, d) => acc + (d.caffeineMg ?? 0), 0),
    totalSugarG: totalSugar || drinks.reduce((acc, d) => acc + (d.sugarG ?? 0), 0),
    drinkCount: drinkCount || drinks.length,
    drinks,
  };
};

const normalizePeriodIntake = (raw: any, fallbackStart?: string, fallbackEnd?: string): PeriodIntake => {
  const dates =
    (Array.isArray(raw?.dates) && raw.dates) ||
    (Array.isArray(raw?.days) && raw.days) ||
    (Array.isArray(raw?.dailyDates) && raw.dailyDates) ||
    (Array.isArray(raw?.dailyIntakes) && raw.dailyIntakes.map((d: any) => d?.date).filter(Boolean)) ||
    (Array.isArray(raw?.recordsByDate) && raw.recordsByDate.map((d: any) => d?.date).filter(Boolean)) ||
    [];

  return {
    startDate: toString(raw?.startDate ?? raw?.from ?? fallbackStart ?? ''),
    endDate: toString(raw?.endDate ?? raw?.to ?? fallbackEnd ?? ''),
    totalCaffeineMg: toNumber(raw?.totalCaffeineMg ?? raw?.caffeineTotal ?? raw?.totalCaffeine),
    totalSugarG: toNumber(raw?.totalSugarG ?? raw?.sugarTotal ?? raw?.totalSugar),
    drinkCount: toNumber(raw?.drinkCount ?? raw?.count ?? raw?.totalCount),
    dates,
  };
};

export const fetchDailyIntake = async (date: string): Promise<ApiResponse<DailyIntake>> => {
  const res = await api.get<ApiResponse<any>>('/records/daily', { params: { date } });
  const normalized = normalizeApiResponse(res.data);
  if (normalized.success && normalized.data) {
    return { ...normalized, data: normalizeDailyIntake(normalized.data, date) };
  }
  return normalized as ApiResponse<DailyIntake>;
};

export const fetchPeriodIntake = async (
  startDate: string,
  endDate: string
): Promise<ApiResponse<PeriodIntake>> => {
  const res = await api.get<ApiResponse<any>>('/records/period', {
    params: { startDate, endDate },
  });
  const normalized = normalizeApiResponse(res.data);
  if (normalized.success && normalized.data) {
    return { ...normalized, data: normalizePeriodIntake(normalized.data, startDate, endDate) };
  }
  return normalized as ApiResponse<PeriodIntake>;
};

export const fetchIntakeDetail = async (
  recordId: number | string
): Promise<ApiResponse<IntakeDetail>> => {
  const res = await api.get<ApiResponse<any>>(`/records/${recordId}`);
  const normalized = normalizeApiResponse(res.data);
  if (normalized.success && normalized.data) {
    return { ...normalized, data: normalizeDrink(normalized.data, 0) as IntakeDetail };
  }
  return normalized as ApiResponse<IntakeDetail>;
};

export const createIntakeRecord = async (
  payload: CreateIntakePayload
): Promise<ApiResponse<{ recordId?: number | string }>> => {
  const res = await api.post<ApiResponse<{ recordId?: number | string }>>('/records', payload);
  return normalizeApiResponse(res.data);
};
