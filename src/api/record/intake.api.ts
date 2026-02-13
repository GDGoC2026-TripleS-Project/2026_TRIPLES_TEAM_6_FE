import { api } from '../../lib/api/client';
import type { ApiResponse } from '../../lib/api/types';
import { normalizeApiResponse } from '../../lib/api/response';
import { storage } from '../../utils/storage';
import { storageKeys } from '../../constants/storageKeys';

export type IntakeDrink = {
  id: string;
  brandName: string;
  menuName: string;
  optionText: string;
  temperature?: 'HOT' | 'ICED';
  sizeName?: string;
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
  totalEspressoShotCount?: number;
  totalSugarCubeCount?: number;
  goalCaffeine?: number;
  goalSugar?: number;
  drinkCount: number;
  drinks: IntakeDrink[];
};

export type PeriodIntake = {
  startDate: string;
  endDate: string;
  totalCaffeineMg: number;
  totalSugarG: number;
  totalEspressoShotCount?: number;
  totalSugarCubeCount?: number;
  drinkCount: number;
  dates: string[];
  intakes?: IntakeDrink[];
};

export type IntakeDetail = IntakeDrink & {
  id?: number | string;
  menuId?: number | string;
  brandId?: number | string;
  sizeName?: string;
  temperature?: 'HOT' | 'ICED';
  menuSizeId?: number;
  intakeDate?: string;
  quantity?: number;
  createdAt?: string;
  caffeineSnapshot?: number;
  sugarSnapshot?: number;
  caloriesSnapshot?: number;
  sodiumSnapshot?: number;
  proteinSnapshot?: number;
  fatSnapshot?: number;
  goalCaffeineTargetSnapshot?: number;
  goalSugarTargetSnapshot?: number;
  espressoShotCount?: number;
  sugarCubeCount?: number;
  options?: Array<{
    optionId: number | string;
    optionName?: string;
    count?: number;
    quantity?: number;
  }>;
};

export type CreateIntakePayload = {
  menuSizeId: number;
  intakeDate: string; // YYYY-MM-DD
  quantity?: number;
  options?: Array<{ optionId: number | string; quantity?: number }>;
};

export type IntakeRecordOption = {
  optionId: number | string;
  quantity: number;
};

export type IntakeRecordResponse = {
  id: number | string;
  userId: number | string;
  intakeDate: string;
  menuSizeId: number | string;
  quantity: number;
  caffeineSnapshot: number;
  sugarSnapshot: number;
  caloriesSnapshot: number;
  sodiumSnapshot: number;
  proteinSnapshot: number;
  fatSnapshot: number;
  goalCaffeineTargetSnapshot?: number;
  goalSugarTargetSnapshot?: number;
  options: IntakeRecordOption[];
  createdAt: string;
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
};

const toOptionalNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return undefined;
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

const buildOptionTextFromOptions = (options: any[]) => {
  if (!Array.isArray(options)) return '';
  const parts = options
    .map((opt) => {
      const name = toString(opt?.optionName ?? opt?.name ?? '');
      const qty = toNumber(opt?.quantity ?? opt?.count, 1);
      if (!name) return '';
      return qty > 1 ? `${name} ${qty}` : name;
    })
    .filter(Boolean);
  return parts.join(' | ');
};

const normalizeDrink = (raw: any, index: number, fallbackDate?: string): IntakeDrink => {
  const nutrition = raw?.nutrition ?? {};
  const intakeIds = Array.isArray(raw?.intakeIds) ? raw.intakeIds : undefined;
  const primaryIntakeId =
    intakeIds && intakeIds.length > 0 ? intakeIds[0] : undefined;
  const optionsText =
    normalizeOptionText(raw) || buildOptionTextFromOptions(raw?.options ?? raw?.optionList ?? []);
  return {
    // Prefer record-level identifiers over generic `id` to ensure detail fetches use intake record ids.
    id: toString(primaryIntakeId ?? raw?.recordId ?? raw?.intakeId ?? raw?.id ?? `${index}`),
    brandName: toString(raw?.brandName ?? raw?.brand?.name ?? ''),
    menuName: toString(raw?.menuName ?? raw?.menu?.name ?? raw?.name ?? ''),
    optionText: optionsText,
    temperature: raw?.temperature,
    sizeName: toString(raw?.sizeName ?? ''),
    caffeineMg: toNumber(
      raw?.caffeinePerUnit ??
        raw?.caffeineMg ??
        raw?.caffeine ??
        raw?.caffeineSnapshot ??
        nutrition?.caffeineMg ??
        nutrition?.caffeine
    ),
    sugarG: toNumber(
      raw?.sugarPerUnit ??
        raw?.sugarG ??
        raw?.sugar ??
        raw?.sugarSnapshot ??
        nutrition?.sugarG ??
        nutrition?.sugar
    ),
    calorieKcal: toNumber(
      raw?.calorieKcal ??
        raw?.calories ??
        raw?.caloriesSnapshot ??
        nutrition?.calorieKcal ??
        nutrition?.calories
    ),
    sodiumMg: toNumber(raw?.sodiumMg ?? raw?.sodiumSnapshot ?? nutrition?.sodiumMg),
    proteinG: toNumber(raw?.proteinG ?? raw?.proteinSnapshot ?? nutrition?.proteinG),
    fatG: toNumber(raw?.fatG ?? raw?.fatSnapshot ?? nutrition?.fatG),
    count:
      raw?.count === undefined && raw?.quantity === undefined
        ? undefined
        : toNumber(raw?.count ?? raw?.quantity),
    recordedAt: toString(
      raw?.recordedAt ??
        raw?.date ??
        raw?.intakeDate ??
        raw?.createdAt ??
        fallbackDate ??
        ''
    ),
  };
};

const normalizeDailyIntake = (raw: any, fallbackDate?: string): DailyIntake => {
  const drinksRaw =
    raw?.intakes ?? raw?.drinks ?? raw?.records ?? raw?.items ?? raw?.content ?? [];
  const drinks = Array.isArray(drinksRaw)
    ? drinksRaw.map((d, idx) => normalizeDrink(d, idx, fallbackDate))
    : [];

  const totalCaffeine = toNumber(
    raw?.totalCaffeineMg ??
      raw?.caffeineTotal ??
      raw?.totalCaffeine ??
      raw?.totalCaffeineSnapshot
  );
  const totalSugar = toNumber(
    raw?.totalSugarG ?? raw?.sugarTotal ?? raw?.totalSugar ?? raw?.totalSugarSnapshot
  );
  const totalEspressoShotCount = toOptionalNumber(
    raw?.totalEspressoShotCount ?? raw?.espressoShotCount ?? raw?.totalShotCount
  );
  const totalSugarCubeCount = toOptionalNumber(
    raw?.totalSugarCubeCount ?? raw?.sugarCubeCount ?? raw?.totalCubeCount
  );
  const goalCaffeine = toOptionalNumber(raw?.goalCaffeine ?? raw?.caffeineGoal ?? raw?.goalCaffeineTarget);
  const goalSugar = toOptionalNumber(raw?.goalSugar ?? raw?.sugarGoal ?? raw?.goalSugarTarget);
  const drinkCount = toNumber(
    raw?.drinkCount ?? raw?.intakeCount ?? raw?.count ?? drinks.length
  );

  return {
    date: toString(
      raw?.date ?? raw?.recordDate ?? raw?.intakeDate ?? fallbackDate ?? ''
    ),
    totalCaffeineMg: totalCaffeine || drinks.reduce((acc, d) => acc + (d.caffeineMg ?? 0), 0),
    totalSugarG: totalSugar || drinks.reduce((acc, d) => acc + (d.sugarG ?? 0), 0),
    totalEspressoShotCount,
    totalSugarCubeCount,
    goalCaffeine,
    goalSugar,
    drinkCount: drinkCount || drinks.length,
    drinks,
  };
};

const normalizePeriodIntake = (raw: any, fallbackStart?: string, fallbackEnd?: string): PeriodIntake => {
  const dates =
    (Array.isArray(raw?.dates) && raw.dates) ||
    (Array.isArray(raw?.days) && raw.days) ||
    (Array.isArray(raw?.dailyDates) && raw.dailyDates) ||
    (Array.isArray(raw?.dailyIntakes) &&
      raw.dailyIntakes.map((d: any) => d?.date).filter(Boolean)) ||
    (Array.isArray(raw?.recordsByDate) &&
      raw.recordsByDate.map((d: any) => d?.date).filter(Boolean)) ||
    [];

  const intakesRaw =
    raw?.intakes ?? raw?.items ?? raw?.groups ?? raw?.list ?? raw?.content ?? [];
  const intakes = Array.isArray(intakesRaw)
    ? intakesRaw.map((d: any, idx: number) => normalizeDrink(d, idx))
    : [];

  return {
    startDate: toString(raw?.startDate ?? raw?.from ?? fallbackStart ?? ''),
    endDate: toString(raw?.endDate ?? raw?.to ?? fallbackEnd ?? ''),
    totalCaffeineMg: toNumber(
      raw?.totalCaffeineMg ?? raw?.caffeineTotal ?? raw?.totalCaffeine
    ),
    totalSugarG: toNumber(raw?.totalSugarG ?? raw?.sugarTotal ?? raw?.totalSugar),
    totalEspressoShotCount: toOptionalNumber(
      raw?.totalEspressoShotCount ?? raw?.espressoShotCount ?? raw?.totalShotCount
    ),
    totalSugarCubeCount: toOptionalNumber(
      raw?.totalSugarCubeCount ?? raw?.sugarCubeCount ?? raw?.totalCubeCount
    ),
    drinkCount: toNumber(
      raw?.drinkCount ?? raw?.intakeCount ?? raw?.count ?? raw?.totalCount
    ),
    dates,
    intakes,
  };
};

const normalizePeriodDates = (raw: any): string[] => {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (!raw) return [];
  return normalizePeriodIntake(raw).dates ?? [];
};


export const fetchDailyIntake = async (date: string): Promise<ApiResponse<DailyIntake>> => {
  const loginId = await storage.get(storageKeys.loginId);
  const res = await api.get<ApiResponse<any>>('/intakes/daily', {
    params: loginId ? { date, loginId } : { date },
  });
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
  const res = await api.get<ApiResponse<any>>('/intakes/period', {
    params: { startDate, endDate },
  });
  const normalized = normalizeApiResponse(res.data);
  if (normalized.success && normalized.data) {
    return {
      ...normalized,
      data: normalizePeriodIntake(normalized.data, startDate, endDate),
    };
  }
  return normalized as ApiResponse<PeriodIntake>;
};

export const fetchPeriodIntakeDates = async (
  startDate: string,
  endDate: string
): Promise<ApiResponse<string[]>> => {
  const res = await api.get<ApiResponse<any>>('/intakes/period/dates', {
    params: { startDate, endDate },
  });
  const normalized = normalizeApiResponse(res.data);
  if (normalized.success && normalized.data) {
    return {
      ...normalized,
      data: normalizePeriodDates(normalized.data),
    };
  }
  return normalized as ApiResponse<string[]>;
};


export const fetchIntakeDetail = async (
  recordId: number | string
): Promise<ApiResponse<IntakeDetail>> => {
  const loginId = await storage.get(storageKeys.loginId);
  const res = await api.get<ApiResponse<any>>(`/intakes/${recordId}`, {
    params: loginId ? { loginId } : undefined,
  });
  const normalized = normalizeApiResponse(res.data);
  if (normalized.success && normalized.data) {
    const base = normalizeDrink(normalized.data, 0) as IntakeDetail;
    const optionsRaw = normalized.data?.options ?? [];
    const options = Array.isArray(optionsRaw)
      ? optionsRaw.map((opt: any) => ({
          optionId: opt?.optionId ?? opt?.id,
          optionName: opt?.optionName ?? opt?.name,
          count: toNumber(opt?.quantity ?? opt?.count, 1),
          quantity: toNumber(opt?.quantity ?? opt?.count, 1),
        }))
      : undefined;
    return {
      ...normalized,
      data: {
        ...base,
        options,
        id: normalized.data?.id ?? normalized.data?.recordId ?? normalized.data?.intakeId,
        menuId: normalized.data?.menuId ?? normalized.data?.menu?.id,
        brandId: normalized.data?.brandId ?? normalized.data?.brand?.id,
        menuSizeId: normalized.data?.menuSizeId ?? normalized.data?.menuSize?.id,
        intakeDate: toString(normalized.data?.intakeDate ?? normalized.data?.date ?? ''),
        quantity: toNumber(normalized.data?.quantity ?? normalized.data?.count, 1),
        createdAt: toString(normalized.data?.createdAt ?? ''),
        caffeineSnapshot: toNumber(
          normalized.data?.caffeineSnapshot ?? normalized.data?.caffeineMg ?? normalized.data?.caffeine
        ),
        sugarSnapshot: toNumber(
          normalized.data?.sugarSnapshot ?? normalized.data?.sugarG ?? normalized.data?.sugar
        ),
        caloriesSnapshot: toNumber(
          normalized.data?.caloriesSnapshot ?? normalized.data?.calorieKcal ?? normalized.data?.calories
        ),
        sodiumSnapshot: toNumber(
          normalized.data?.sodiumSnapshot ?? normalized.data?.sodiumMg
        ),
        proteinSnapshot: toNumber(
          normalized.data?.proteinSnapshot ?? normalized.data?.proteinG
        ),
        fatSnapshot: toNumber(
          normalized.data?.fatSnapshot ?? normalized.data?.fatG
        ),
        goalCaffeineTargetSnapshot: toNumber(
          normalized.data?.goalCaffeineTargetSnapshot ?? normalized.data?.goalCaffeineTarget
        ),
        goalSugarTargetSnapshot: toNumber(
          normalized.data?.goalSugarTargetSnapshot ?? normalized.data?.goalSugarTarget
        ),
        espressoShotCount: toNumber(
          normalized.data?.espressoShotCount ?? normalized.data?.shotCount
        ),
        sugarCubeCount: toNumber(
          normalized.data?.sugarCubeCount ?? normalized.data?.cubeCount
        ),
      },
    };

  }
  return normalized as ApiResponse<IntakeDetail>;
};

export const createIntakeRecord = async (
  payload: CreateIntakePayload
): Promise<ApiResponse<{ recordId?: number | string }>> => {
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  ) as CreateIntakePayload;
  const res = await api.post<ApiResponse<{ recordId?: number | string }>>(
    '/intakes',
    cleanPayload
  );
  return normalizeApiResponse(res.data);
};

export const updateIntakeRecord = async (
  intakeId: number | string,
  payload: CreateIntakePayload
): Promise<ApiResponse<IntakeRecordResponse>> => {
  const loginId = await storage.get(storageKeys.loginId);
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  ) as CreateIntakePayload;
  const res = await api.put<ApiResponse<IntakeRecordResponse>>(
    `/intakes/${intakeId}`,
    cleanPayload,
    { params: loginId ? { loginId } : undefined }
  );
  return normalizeApiResponse(res.data);
};

export const deleteIntakeRecord = async (
  intakeId: number | string
): Promise<ApiResponse<Record<string, never>>> => {
  try {
    const loginId = await storage.get(storageKeys.loginId);
    const res = await api.delete<ApiResponse<Record<string, never>>>(
      `/intakes/${intakeId}`,
      { params: loginId ? { loginId } : undefined }
    );
    const normalized = normalizeApiResponse(res.data);
    if (normalized.success) {
      return {
        success: true,
        data: normalized.data ?? {},
        timestamp: normalized.timestamp ?? new Date().toISOString(),
      };
    }
    return normalized;
  } catch (e: any) {
    if (__DEV__) {
      console.log('[API ERR] /intakes/:id DELETE status:', e?.response?.status);
      console.log('[API ERR] /intakes/:id DELETE data:', e?.response?.data);
      console.log('[API ERR] /intakes/:id DELETE message:', e?.message);
    }
    throw e;
  }
};
