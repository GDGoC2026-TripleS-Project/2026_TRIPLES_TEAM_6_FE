import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { MainTabNavigationProp } from '../types/navigation';
import {
  fetchDailyIntake,
  deleteIntakeRecord,
  fetchIntakeDetail,
  fetchPeriodIntake,
  type DailyIntake,
  type IntakeDrink,
} from '../api/record/intake.api';
import { buildOptionBase } from '../utils/recordOptions';
import type { DrinkLike } from '../components/common/DrinkDetailSheet';
import type { OptionTextParts } from '../types/optionText';
import type { ApiResponse } from '../lib/api/types';
import { useGoalStore } from '../store/goalStore';

const toKoreanDate = (dateString: string) => {
  if (!dateString) return 'YYYY.MM.DD';
  const [y, m, d] = dateString.split('-');
  return `${y}.${String(Number(m)).padStart(2, '0')}.${String(Number(d)).padStart(2, '0')}`;
};

const toSectionTitle = (dateString: string) => {
  return toKoreanDate(dateString);
};

const parseDate = (dateString: string) => {
  const [y, m, d] = dateString.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const toDateList = (start: string, end: string) => {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  if (!startDate || !endDate) return [];

  const dates: string[] = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    const yyyy = cursor.getFullYear();
    const mm = String(cursor.getMonth() + 1).padStart(2, '0');
    const dd = String(cursor.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

export type PeriodRow =
  | { type: 'header'; id: string; title: string; date: string; goalCaffeine?: number; goalSugar?: number }
  | { type: 'drink'; id: string; date: string; drink: IntakeDrink };

export const usePeriodSearchScreen = (initialStart: string, initialEnd: string) => {
  const navigation = useNavigation<MainTabNavigationProp<'Calendar'>>();

  const [sheetVisible, setSheetVisible] = useState(false);
  const [startDate, setStartDate] = useState<string>(initialStart);
  const [endDate, setEndDate] = useState<string>(initialEnd);
  const [days, setDays] = useState<DailyIntake[]>([]);
  const [periodDrinks, setPeriodDrinks] = useState<IntakeDrink[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<DrinkLike | null>(null);
  const [selectedIntakeId, setSelectedIntakeId] = useState<string | number | null>(null);
  const [detailDate, setDetailDate] = useState<string>('');
  const [summary, setSummary] = useState({
    caffeineTotal: 0,
    sugarTotal: 0,
    espressoShotCount: undefined as number | undefined,
    sugarCubeCount: undefined as number | undefined,
    drinkCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const fallbackCaffeine = useGoalStore((s) => s.caffeine);
  const fallbackSugar = useGoalStore((s) => s.sugar);
  const goalByDate = useGoalStore((s) => s.goalByDate);
  const getGoalsForDate = useGoalStore((s) => s.getGoalsForDate);

  const normalized = useMemo(() => {
    if (!startDate || !endDate) return { start: startDate, end: endDate };
    return startDate <= endDate ? { start: startDate, end: endDate } : { start: endDate, end: startDate };
  }, [startDate, endDate]);

  const loadPeriod = useCallback(async () => {
    if (!normalized.start || !normalized.end) {
      setDays([]);
      setPeriodDrinks([]);
      setSummary({ caffeineTotal: 0, sugarTotal: 0, espressoShotCount: undefined, sugarCubeCount: undefined, drinkCount: 0 });
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const periodRes = await fetchPeriodIntake(normalized.start, normalized.end);
      if (periodRes.success && periodRes.data) {
        const totalCaffeine = periodRes.data.totalCaffeineMg ?? 0;
        const totalSugar = periodRes.data.totalSugarG ?? 0;
        setSummary({
          caffeineTotal: totalCaffeine,
          sugarTotal: totalSugar,
          espressoShotCount: periodRes.data.totalEspressoShotCount,
          sugarCubeCount: periodRes.data.totalSugarCubeCount,
          drinkCount: periodRes.data.drinkCount ?? 0,
        });
        if (Array.isArray(periodRes.data.intakes)) {
          setPeriodDrinks(periodRes.data.intakes);
          setDays([]);
          return;
        }
      } else {
        setSummary({ caffeineTotal: 0, sugarTotal: 0, espressoShotCount: undefined, sugarCubeCount: undefined, drinkCount: 0 });
      }

      const dates = toDateList(normalized.start, normalized.end);
      setPeriodDrinks([]);
      await Promise.all(dates.map((date) => getGoalsForDate(date)));
      const dailyResults = await Promise.all(
        dates.map(async (date) => {
          try {
            return await fetchDailyIntake(date);
          } catch {
            return null;
          }
        })
      );

      const nextDays = dailyResults
        .filter((res): res is ApiResponse<DailyIntake> =>
          Boolean(res && (res as any).success && (res as any).data)
        )
        .map((res) => res.data as DailyIntake)
        .filter((day) => day.drinks.length > 0)
        .sort((a, b) => (a.date < b.date ? 1 : -1));

      setDays(nextDays);
    } catch {
      setDays([]);
      setPeriodDrinks([]);
      setSummary({ caffeineTotal: 0, sugarTotal: 0, espressoShotCount: undefined, sugarCubeCount: undefined, drinkCount: 0 });
      setLoadError('기간 기록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [normalized.start, normalized.end]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) loadPeriod();
    return () => {
      isMounted = false;
    };
  }, [loadPeriod]);

  const rows: PeriodRow[] = useMemo(() => {
    if (periodDrinks.length > 0) {
      return periodDrinks.map((drink) => ({
        type: 'drink',
        id: `p_${drink.id}`,
        date: '',
        drink,
      }));
    }

    const out: PeriodRow[] = [];

    for (const day of days) {
      out.push({
        type: 'header',
        id: `h_${day.date}`,
        title: toSectionTitle(day.date),
        date: day.date,
        goalCaffeine: day.goalCaffeine,
        goalSugar: day.goalSugar,
      });

      for (const drink of day.drinks) {
        out.push({
          type: 'drink',
          id: `d_${day.date}_${drink.id}`,
          date: day.date,
          drink,
        });
      }
    }

    return out;
  }, [days, periodDrinks]);

  const handleConfirmPeriod = (s: string, e: string) => {
    setStartDate(s);
    setEndDate(e);
  };

  const openDetail = async (drink: IntakeDrink, date: string) => {
    setDetailDate(date);
    setSelectedIntakeId(drink.id ?? null);
    const base: DrinkLike = {
      id: drink.id ?? '',
      brandName: drink.brandName,
      menuName: drink.menuName,
      caffeineMg: drink.caffeineMg ?? 0,
      sugarG: drink.sugarG ?? 0,
      calorieKcal: drink.calorieKcal,
      sodiumMg: drink.sodiumMg,
      proteinG: drink.proteinG,
      fatG: drink.fatG,
    };

    setSelectedDrink(base);
    setDetailOpen(true);

    try {
      const res = await fetchIntakeDetail(drink.id);
      if (res.success && res.data) {
        setSelectedIntakeId(res.data.id ?? drink.id);
        setSelectedDrink({
          id: String(res.data.id ?? drink.id),
          brandName: res.data.brandName ?? drink.brandName,
          menuName: res.data.menuName ?? drink.menuName,
          caffeineMg: res.data.caffeineMg ?? 0,
          sugarG: res.data.sugarG ?? 0,
          calorieKcal: res.data.calorieKcal,
          sodiumMg: res.data.sodiumMg,
          proteinG: res.data.proteinG,
          fatG: res.data.fatG,
        });
      }
    } catch {
      // fallback
    }
  };

  const closeDetail = () => setDetailOpen(false);

  const handleGoBrand = (drinkId?: string | number) => {
    const targetId = selectedIntakeId ?? drinkId ?? selectedDrink?.id;
    if (!targetId) return;
    (async () => {
      try {
        const detailRes = await fetchIntakeDetail(targetId);
        if (!detailRes.success || !detailRes.data?.brandId) {
          throw new Error('상세 정보가 없습니다.');
        }
        const targetDate = detailRes.data.intakeDate || detailDate;
        closeDetail();
        navigation.navigate('RecordDetail', {
          brandId: String(detailRes.data.brandId),
          brandName: detailRes.data.brandName ?? '',
          selectedDate: targetDate,
          isFavorite: undefined,
          edit: {
            intakeId: detailRes.data.id,
            menuSizeId: detailRes.data.menuSizeId,
            intakeDate: detailRes.data.intakeDate,
            temperature: detailRes.data.temperature,
            sizeName: detailRes.data.sizeName,
            options: detailRes.data.options?.map((opt) => ({
              optionId: opt.optionId,
              quantity: opt.count ?? 1,
            })),
          },
        });
      } catch {
        Alert.alert('이동 실패', '브랜드 정보를 불러오지 못했습니다.');
      }
    })();
  };

  const handleDelete = (drinkId?: string) => {
    const targetId = selectedIntakeId ?? drinkId;
    if (!targetId) return;
    Alert.alert('섭취 기록 삭제', '이 기록을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            if (__DEV__) console.log('[INTAKE DELETE] id:', targetId);
            const res = await deleteIntakeRecord(targetId);
            if (!res.success) {
              Alert.alert('삭제 실패', res.error?.message ?? '섭취 기록 삭제에 실패했습니다.');
              return;
            }
            closeDetail();
            await loadPeriod();
          } catch (e: any) {
            if (__DEV__) {
              console.log('[INTAKE DELETE FAIL] id:', targetId);
              console.log('[INTAKE DELETE FAIL] status:', e?.response?.status);
              console.log('[INTAKE DELETE FAIL] data:', e?.response?.data);
              console.log('[INTAKE DELETE FAIL] message:', e?.message);
            }
            Alert.alert('삭제 실패', '섭취 기록 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const handleEdit = (drinkId?: string | number) => {
    const targetId = selectedIntakeId ?? drinkId ?? selectedDrink?.id;
    if (!targetId) return;
    (async () => {
      try {
        const detailRes = await fetchIntakeDetail(targetId);
        if (!detailRes.success || !detailRes.data?.menuId) {
          throw new Error('상세 정보가 없습니다.');
        }
        const targetDate = detailRes.data.intakeDate || detailDate;
        const edit = {
          intakeId: detailRes.data.id,
          menuSizeId: detailRes.data.menuSizeId,
          intakeDate: detailRes.data.intakeDate,
          temperature: detailRes.data.temperature,
          sizeName: detailRes.data.sizeName,
          options: detailRes.data.options?.map((opt) => ({
            optionId: opt.optionId,
            quantity: opt.count ?? 1,
          })),
        };
        closeDetail();
        navigation.navigate('RecordDrinkDetail', {
          drinkId: String(detailRes.data.menuId),
          drinkName: detailRes.data.menuName ?? selectedDrink?.menuName ?? '',
          selectedDate: targetDate,
          edit,
        });
      } catch {
        Alert.alert('수정 실패', '기록 정보를 불러오지 못했습니다.');
      }
    })();
  };

  const renderOptionText = (drink: IntakeDrink): OptionTextParts => {
    const temp = drink.temperature === 'HOT' ? 'hot' : drink.temperature === 'ICED' ? 'ice' : undefined;
    const base = buildOptionBase(temp, drink.sizeName);
    const extraText = drink.optionText?.trim();
    const extras =
      extraText && extraText !== '옵션 없음'
        ? extraText.split(' | ').map((s) => s.trim()).filter(Boolean)
        : [];

    return base
      ? { base, extras }
      : { base: '', extras: extraText ? [extraText] : [] };
  };

  return {
    sheetVisible,
    setSheetVisible,
    normalized,
    summary,
    rows,
    loading,
    loadError,
    detailOpen,
    selectedDrink,
    handleConfirmPeriod,
    openDetail,
    closeDetail,
    handleDelete,
    handleEdit,
    handleGoBrand,
    renderOptionText,
    goalByDate,
    fallbackCaffeine,
    fallbackSugar,
  };
};
