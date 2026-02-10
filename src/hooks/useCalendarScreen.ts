import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { MainTabNavigationProp } from '../types/navigation';
import { useGoalStore } from '../store/goalStore';
import {
  fetchDailyIntake,
  fetchIntakeDetail,
  deleteIntakeRecord,
  fetchPeriodIntake,
  type DailyIntake,
  type IntakeDrink,
} from '../api/record/intake.api';
import { fetchMenuSizeDetail } from '../api/record/menu.api';
import { buildOptionBase } from '../utils/recordOptions';
import type { DrinkLike } from '../components/common/DrinkDetailSheet';
import type { OptionTextParts } from '../types/optionText';

const todayString = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const toMonthRange = (dateString: string) => {
  const [yRaw, mRaw] = dateString.split('-');
  const y = Number(yRaw);
  const m = Number(mRaw);
  if (!y || !m) {
    return { start: dateString, end: dateString };
  }
  const start = `${y}-${String(m).padStart(2, '0')}-01`;
  const endDate = new Date(y, m, 0);
  const end = `${y}-${String(m).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
  return { start, end };
};

export const useCalendarScreen = () => {
  const navigation = useNavigation<MainTabNavigationProp<'Calendar'>>();
  const [selectedDate, setSelectedDate] = useState<string>(todayString());
  const [skippedByDate, setSkippedByDate] = useState<Record<string, boolean>>({});
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<DrinkLike | null>(null);
  const [selectedIntakeId, setSelectedIntakeId] = useState<string | number | null>(null);
  const [periodSheetOpen, setPeriodSheetOpen] = useState(false);
  const [daily, setDaily] = useState<DailyIntake | null>(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyError, setDailyError] = useState<string | null>(null);
  const [eventDates, setEventDates] = useState<string[]>([]);

  const fallbackCaffeine = useGoalStore((s) => s.caffeine);
  const fallbackSugar = useGoalStore((s) => s.sugar);
  const goalByDate = useGoalStore((s) => s.goalByDate);
  const getGoalsForDate = useGoalStore((s) => s.getGoalsForDate);

  const calendarEvents = useMemo(() => {
    const skippedDates = Object.entries(skippedByDate)
      .filter(([, skipped]) => skipped)
      .map(([date]) => date);

    return Array.from(new Set([...eventDates, ...skippedDates]));
  }, [eventDates, skippedByDate]);

  const isFutureDate = useMemo(() => {
    const today = todayString();
    return selectedDate > today;
  }, [selectedDate]);

  useEffect(() => {
    void getGoalsForDate(selectedDate);
  }, [selectedDate, getGoalsForDate]);

  const dateGoals = goalByDate[selectedDate];
  const caffeineGoal = dateGoals?.caffeine ?? fallbackCaffeine;
  const sugarGoal = dateGoals?.sugar ?? fallbackSugar;

  const isSkipped = !!skippedByDate[selectedDate];
  const drinks: IntakeDrink[] = daily?.drinks ?? [];
  const summaryDrinks = isSkipped ? [] : drinks;
  const hasRecord = drinks.length > 0;

  const loadDaily = useCallback(async () => {
    setDailyLoading(true);
    setDailyError(null);
    try {
      const res = await fetchDailyIntake(selectedDate);
      if (res.success && res.data) {
        setDaily(res.data);
      } else {
        setDaily({
          date: selectedDate,
          totalCaffeineMg: 0,
          totalSugarG: 0,
          drinkCount: 0,
          drinks: [],
        });
        setDailyError(res.error?.message ?? '일별 기록을 불러오지 못했습니다.');
      }
    } catch {
      setDaily({
        date: selectedDate,
        totalCaffeineMg: 0,
        totalSugarG: 0,
        drinkCount: 0,
        drinks: [],
      });
      setDailyError('일별 기록을 불러오지 못했습니다.');
    } finally {
      setDailyLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) loadDaily();
    return () => {
      isMounted = false;
    };
  }, [loadDaily]);

  useEffect(() => {
    let isMounted = true;
    const { start, end } = toMonthRange(selectedDate);
    const loadEvents = async () => {
      try {
        const res = await fetchPeriodIntake(start, end);
        if (!isMounted) return;
        if (res.success && res.data) {
          setEventDates(res.data.dates ?? []);
        } else {
          setEventDates([]);
        }
      } catch {
        if (!isMounted) return;
        setEventDates([]);
      }
    };
    loadEvents();
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  const onToggleSkip = (next: boolean) => {
    setSkippedByDate((prev) => ({
      ...prev,
      [selectedDate]: next,
    }));
  };

  const onAddRecord = () => {
    if (isFutureDate) {
      Alert.alert('알림', '미래 날짜에는 음료를 등록할 수 없어요.');
      return;
    }
    navigation.navigate('Record', { selectedDate });
  };

  const onGoPeriodSearch = () => {
    setPeriodSheetOpen(true);
  };

  const handlePeriodConfirm = (startDate: string, endDate: string) => {
    navigation.navigate('PeriodSearchScreen', {
      startDate,
      endDate,
    });
  };

  const openDetail = async (drink: IntakeDrink) => {
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
            await loadDaily();
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

  const handleEdit = async (drinkId?: string | number) => {
    const targetId = selectedIntakeId ?? drinkId ?? selectedDrink?.id;
    if (!targetId) return;
    try {
      const detailRes = await fetchIntakeDetail(targetId);
      if (!detailRes.success || !detailRes.data?.menuSizeId) {
        throw new Error('상세 정보가 없습니다.');
      }
      const sizeRes = await fetchMenuSizeDetail(detailRes.data.menuSizeId);
      if (!sizeRes.success || !sizeRes.data) {
        throw new Error('메뉴 정보를 불러오지 못했습니다.');
      }

      const targetDate = detailRes.data.intakeDate || selectedDate;
      closeDetail();
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
      navigation.navigate('Record', {
        selectedDate: targetDate,
        edit,
      });
    } catch {
      Alert.alert('수정 실패', '기록 정보를 불러오지 못했습니다.');
    }
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
    selectedDate,
    setSelectedDate,
    isSkipped,
    onToggleSkip,
    detailOpen,
    selectedDrink,
    periodSheetOpen,
    setPeriodSheetOpen,
    calendarEvents,
    summaryDrinks,
    hasRecord,
    drinks,
    dailyLoading,
    dailyError,
    caffeineGoal,
    sugarGoal,
    isFutureDate,
    onAddRecord,
    onGoPeriodSearch,
    handlePeriodConfirm,
    openDetail,
    closeDetail,
    handleDelete,
    handleEdit,
    renderOptionText,
  };
};
