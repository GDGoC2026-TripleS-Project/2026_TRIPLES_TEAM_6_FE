import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { MainTabNavigationProp } from '../types/navigation';
import { useGoalStore } from '../store/goalStore';
import {
  fetchDailyIntake,
  fetchIntakeDetail,
  deleteIntakeRecord,
  type DailyIntake,
  type IntakeDrink,
} from '../api/record/intake.api';
import { buildOptionBase } from '../utils/recordOptions';
import { fetchMenuSizeDetail } from '../api/record/menu.api';
import type { DrinkLike } from '../components/common/DrinkDetailSheet';
import type { OptionTextParts } from '../types/optionText';

export const useHomeScreen = () => {
  const navigation = useNavigation<MainTabNavigationProp<'Home'>>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [skippedByDate, setSkippedByDate] = useState<Record<string, boolean>>({});
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<DrinkLike | null>(null);
  const [selectedIntakeId, setSelectedIntakeId] = useState<string | number | null>(null);
  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  const [daily, setDaily] = useState<DailyIntake | null>(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyError, setDailyError] = useState<string | null>(null);
  const dailyCacheRef = useRef<Record<string, DailyIntake>>({});

  const fallbackCaffeine = useGoalStore((s) => s.caffeine);
  const fallbackSugar = useGoalStore((s) => s.sugar);
  const goalByDate = useGoalStore((s) => s.goalByDate);
  const getGoalsForDate = useGoalStore((s) => s.getGoalsForDate);

  const dateKey = useMemo(() => {
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, [selectedDate]);

  useEffect(() => {
    void getGoalsForDate(dateKey);
  }, [dateKey, getGoalsForDate]);

  const dateGoals = goalByDate[dateKey];
  const caffeineGoal = dateGoals?.caffeine ?? fallbackCaffeine;
  const sugarGoal = dateGoals?.sugar ?? fallbackSugar;

  const isFutureDate = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfSelected = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );
    return startOfSelected > startOfToday;
  }, [selectedDate]);

  const isSkipped = !!skippedByDate[dateKey];
  const drinks: IntakeDrink[] = daily?.drinks ?? [];
  const stats = {
    caffeine: daily?.totalCaffeineMg ?? 0,
    sugar: daily?.totalSugarG ?? 0,
    count: daily?.drinkCount ?? drinks.length,
  };
  const hasRecord = drinks.length > 0;

  const loadDaily = useCallback(async () => {
    const cached = dailyCacheRef.current[dateKey];
    if (cached) {
      setDaily(cached);
    }
    setDailyLoading(true);
    setDailyError(null);
    try {
      const res = await fetchDailyIntake(dateKey);
      if (res.success && res.data) {
        dailyCacheRef.current[dateKey] = res.data;
        setDaily(res.data);
      } else {
        if (!dailyCacheRef.current[dateKey]) {
          setDaily({
            date: dateKey,
            totalCaffeineMg: 0,
            totalSugarG: 0,
            drinkCount: 0,
            drinks: [],
          });
        }
        setDailyError(res.error?.message ?? '일별 섭취 기록을 불러오지 못했습니다.');
      }
    } catch {
      if (!dailyCacheRef.current[dateKey]) {
        setDaily({
          date: dateKey,
          totalCaffeineMg: 0,
          totalSugarG: 0,
          drinkCount: 0,
          drinks: [],
        });
      }
      setDailyError('일별 섭취 기록을 불러오지 못했습니다.');
    } finally {
      setDailyLoading(false);
    }
  }, [dateKey]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) loadDaily();
    return () => {
      isMounted = false;
    };
  }, [loadDaily]);

  const formatDateHeader = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const onToggleSkip = (next: boolean) => {
    setSkippedByDate((prev) => ({
      ...prev,
      [dateKey]: next,
    }));
  };

  const openDetail = async (drink: IntakeDrink) => {
    setSelectedIntakeId(drink.id ?? null);
    const base: DrinkLike = {
      id: drink.id ?? '',
      brandName: drink.brandName,
      menuName: drink.menuName,
      caffeineMg: drink.caffeineMg ?? 0,
      sugarG: drink.sugarG ?? 0,
      espressoShotCount: undefined,
      sugarCubeCount: undefined,
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
          caffeineMg: res.data.caffeineSnapshot ?? res.data.caffeineMg ?? 0,
          sugarG: res.data.sugarSnapshot ?? res.data.sugarG ?? 0,
          espressoShotCount: res.data.espressoShotCount,
          sugarCubeCount: res.data.sugarCubeCount,
          calorieKcal: res.data.calorieKcal,
          sodiumMg: res.data.sodiumMg,
          proteinG: res.data.proteinG,
          fatG: res.data.fatG,
        });
      }
    } catch {
      // fallback to list data
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
            if (__DEV__) console.log('[INTAKE DELETE RES]', res);
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

      const targetDate = detailRes.data.intakeDate || dateKey;
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
    dateKey,
    isSkipped,
    onToggleSkip,
    detailOpen,
    selectedDrink,
    dateSheetOpen,
    setDateSheetOpen,
    caffeineGoal,
    sugarGoal,
    stats,
    drinks,
    hasRecord,
    isFutureDate,
    dailyLoading,
    dailyError,
    formatDateHeader,
    handlePrevDay,
    handleNextDay,
    openDetail,
    closeDetail,
    handleDelete,
    handleEdit,
    renderOptionText,
  };
};
