// src/screens/main/CalendarScreen.tsx
import React, { useMemo, useState } from 'react';
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

import { findDrinksByDate, getEventDates, type Drink } from '../../data/drinksData';

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

type Nav = MainTabNavigationProp<'Calendar'>;

export default function CalendarScreen() {
  const navigation = useNavigation<Nav>();

  const [selectedDate, setSelectedDate] = useState<string>(todayString());
  const [skippedByDate, setSkippedByDate] = useState<Record<string, boolean>>({});

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<DrinkLike | null>(null);
  const [periodSheetOpen, setPeriodSheetOpen] = useState(false);

  const events = useMemo(() => getEventDates(), []);
  const baseDrinks = useMemo(() => findDrinksByDate(selectedDate), [selectedDate]);

  const isSkipped = !!skippedByDate[selectedDate];
  const drinks: Drink[] = baseDrinks;
  const summaryDrinks: Drink[] = isSkipped ? [] : drinks;

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

  const onToggleSkip = (next: boolean) => {
    setSkippedByDate((prev) => ({
      ...prev,
      [selectedDate]: next,
    }));
  };

  const onAddRecord = () => {
    console.log('기록 추가');
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

  const openDetail = (drink: Drink) => {
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
        events={events}
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
          {(hasRecord || isSkipped) && <NutritionSummary drinks={summaryDrinks} />}

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

            {!hasRecord && isSkipped && (
              <View style={styles.centerBox}>
                <Text style={styles.subText}>오늘은 음료를 마시지 않았어요.</Text>
              </View>
            )}
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
