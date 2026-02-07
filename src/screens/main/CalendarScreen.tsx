import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { colors } from '../../constants/colors';
import Coffee from '../../../assets/ComponentsImage/coffeeImg.svg';

import PeriodSelectBottomSheet from '../../components/common/PeriodSelectBottomSheet';
import Calendar from '../../components/common/Calendar';
import DrinkList from '../../components/common/MenuItem';
import NutritionSummary from '../../components/calendar/NutritionSummary';
import SkipDrinkCheckbox from '../../components/calendar/SkipDrinkCheckbox';
import AddRecordButton from '../../components/common/AddRecordButton';
import DrinkDetailSheet, { type DrinkLike } from '../../components/common/DrinkDetailSheet';
import { Ionicons } from '@expo/vector-icons';

import { useGoalStore } from '../../store/goalStore';
import {
  fetchDailyIntake,
  fetchPeriodIntake,
  type DailyIntake,
  type IntakeDrink,
} from '../../api/record/intake.api';

import { useNavigation } from '@react-navigation/native';
import type { MainTabNavigationProp } from '../../types/navigation';

const todayString = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const toKoreanDate = (dateString: string) => {
  const [y, m, d] = dateString.split('-');
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
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

type Nav = MainTabNavigationProp<'Calendar'>;

export default function CalendarScreen() {
  const navigation = useNavigation<Nav>();

  const [selectedDate, setSelectedDate] = useState<string>(todayString());
  const [skippedByDate, setSkippedByDate] = useState<Record<string, boolean>>({});

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<DrinkLike | null>(null);
  const [periodSheetOpen, setPeriodSheetOpen] = useState(false);

  const [daily, setDaily] = useState<DailyIntake | null>(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyError, setDailyError] = useState<string | null>(null);
  const [eventDates, setEventDates] = useState<string[]>([]);

  const caffeineGoal = useGoalStore((s) => s.caffeine);
  const sugarGoal = useGoalStore((s) => s.sugar);

  const calendarEvents = useMemo(() => {
    const skippedDates = Object.entries(skippedByDate)
      .filter(([, skipped]) => skipped)
      .map(([date]) => date);

    return Array.from(new Set([...eventDates, ...skippedDates]));
  }, [eventDates, skippedByDate]);

  const isSkipped = !!skippedByDate[selectedDate];
  const drinks: IntakeDrink[] = daily?.drinks ?? [];
  const summaryDrinks = isSkipped ? [] : drinks;

  const today = todayString();
  const isToday = selectedDate === today;
  const isFuture = selectedDate > today;
  const hasRecord = drinks.length > 0;

  const status = useMemo(() => {
    if (isFuture) return 'future';
    if (isToday && hasRecord) return 'today_has';
    if (isToday && !hasRecord) return 'today_empty';
    if (!isToday && hasRecord) return 'past_has';
    return 'past_empty';
  }, [isFuture, isToday, hasRecord]);

  useEffect(() => {
    let isMounted = true;
    const loadDaily = async () => {
      setDailyLoading(true);
      setDailyError(null);
      try {
        const res = await fetchDailyIntake(selectedDate);
        if (!isMounted) return;
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
        if (!isMounted) return;
        setDaily({
          date: selectedDate,
          totalCaffeineMg: 0,
          totalSugarG: 0,
          drinkCount: 0,
          drinks: [],
        });
        setDailyError('일별 기록을 불러오지 못했습니다.');
      } finally {
        if (isMounted) setDailyLoading(false);
      }
    };
    loadDaily();
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

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
    navigation.navigate('Record', { selectedDate });
  };

  const onGoPeriodSearch = () => {
    setPeriodSheetOpen(true);
  };

  const handlePeriodConfirm = (startDate: string, endDate: string) => {
    navigation.navigate('PeriodSearchScreen', {
      startDate,
      endDate
    });
  };

  const openDetail = (drink: IntakeDrink) => {
    setSelectedDrink(drink);
    setDetailOpen(true);
  };

  const closeDetail = () => setDetailOpen(false);

  const onEditDrink = (drink: DrinkLike) => {
    closeDetail();
    // TODO: 수정 화면으로 이동
    // navigation.navigate('EditDrinkScreen', { id: drink.id })
    console.log('edit', drink.id);
  };

  const onDeleteDrink = (drink: DrinkLike) => {
    closeDetail();
    // TODO: 삭제 로직 연결 (confirm modal 추천)
    console.log('delete', drink.id);
  };

  return (
    <ScrollView style={styles.container}>
      <Calendar
        events={calendarEvents}
        startDate={selectedDate}
        endDate={selectedDate}
        onDayPress={setSelectedDate}
      />

      <View style={styles.periodBtnWrap}>
        <Pressable
          onPress={onGoPeriodSearch}
          style={({ pressed }) => [
            styles.periodButton,
            pressed && styles.periodButtonPressed,
          ]}
          hitSlop={8}
        >
          <Text style={styles.periodText}>기간별 조회하기</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.grayscale[300]}
            style={styles.periodIcon}
          />
        </Pressable>
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.dataText}>{toKoreanDate(selectedDate)}</Text>

        <AddRecordButton title="기록 추가하기" onPress={onAddRecord} disabled={isFuture} />
      </View>

      {status !== 'future' && (
        <>
          {(hasRecord || isSkipped) && (
            <NutritionSummary
              drinks={summaryDrinks}
              caffeineMax={caffeineGoal}
              sugarMax={sugarGoal}
            />
          )}

          {!hasRecord && !isSkipped && (
            <View style={styles.centerBox}>
              <Coffee style={{ marginTop: -10 }} />
              <Text style={styles.centerText}>
                마신 음료가 있다면 기록을 추가해보세요.
              </Text>
            </View>
          )}

          {!hasRecord && (
            <View style={[styles.skipCheckboxWrap, isSkipped && styles.skipCheckboxWrapActive]}>
              <SkipDrinkCheckbox value={isSkipped} onChange={onToggleSkip} disabled={false} />
            </View>
          )}

          <View style={styles.list}>
            {hasRecord &&
              !isSkipped &&
              drinks.map((d) => (
                <DrinkList
                  key={d.id}
                  brandName={d.brandName}
                  menuName={d.menuName}
                  optionText={d.optionText}
                  pills={[
                    { label: '카페인', value: d.caffeineMg, unit: 'mg' },
                    { label: '당류', value: d.sugarG, unit: 'g' },
                  ]}
                  onPress={() => openDetail(d)}
                />
              ))}
              
          </View>
        </>
      )}

      <DrinkDetailSheet
        visible={detailOpen}
        drink={selectedDrink}
        onClose={closeDetail}
        onEdit={onEditDrink}
        onDelete={onDeleteDrink}
      />

      <PeriodSelectBottomSheet
      visible={periodSheetOpen}
      onClose={() => setPeriodSheetOpen(false)}
      onConfirm={handlePeriodConfirm}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
    paddingHorizontal: 16,
    paddingTop: 4,
  },

  headerRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  dataText: {
    color: colors.grayscale[100],
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    lineHeight: 24,
    flexShrink: 1,
  },

  list: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: colors.grayscale[1000],
    borderColor: colors.grayscale[800],
    overflow: 'hidden',
    marginBottom: 30,
  },

  centerBox: {
    marginTop: 24,
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  centerText: {
    color: colors.grayscale[100],
    fontSize: 18,
    fontFamily: 'Pretendard-Medium',
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 12,
  },

  subText: {
    marginTop: 10,
    color: colors.grayscale[600],
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },

  periodBtnWrap: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  periodButtonPressed: {
    backgroundColor: colors.grayscale[900],
  },
  periodText: {
    color: colors.grayscale[300],
    fontSize: 13,
    fontFamily: 'Pretendard-SemiBold',
    marginTop: -5,
  },
  periodIcon: {
    marginLeft: 4,
    marginTop: -5,
  },

  skipCheckboxWrap: {
    marginTop: 0,
  },
  skipCheckboxWrapActive: {
    marginTop: 16,
  },
});
