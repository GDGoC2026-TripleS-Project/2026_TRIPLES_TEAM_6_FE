import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import Coffee from '../../../assets/ComponentsImage/coffeeImg.svg';

import Calendar from '../../components/common/Calendar';
import MenuItemRow from '../../components/common/DrinkList';
import NutritionSummary from '../../components/calendar/NutritionSummary';
import SkipDrinkToggle from '../../components/calendar/SkipDrink';
import AddRecordButton from '../../components/common/AddRecordButton';

import { findDrinksByDate, getEventDates, type Drink } from '../../data/drinksData';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';

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

type Nav = NativeStackNavigationProp<RootStackParamList, 'Calendar'>;

export default function CalendarScreen() {
  const navigation = useNavigation<Nav>();

  const [selectedDate, setSelectedDate] = useState<string>(todayString());
  const [skippedByDate, setSkippedByDate] = useState<Record<string, boolean>>({});

  const events = useMemo(() => getEventDates(), []);
  const baseDrinks = useMemo(() => findDrinksByDate(selectedDate), [selectedDate]);

  const isSkipped = !!skippedByDate[selectedDate];
  const drinks: Drink[] = baseDrinks;
  const summaryDrinks: Drink[] = isSkipped
  ? []
  : drinks;

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
    navigation.navigate('PeriodSearchScreen');
  };

  return (
    <View style={styles.container}>
      <Calendar events={events} onSelectDate={setSelectedDate} />

      {/* ✅ 캘린더 바로 밑: 기간별 조회하기 */}
      <View style={styles.periodBtnWrap}>
        <AddRecordButton
          title="기간별 조회하기"
          onPress={onGoPeriodSearch}
          disabled={false}
        />
      </View>

      {/* ✅ 날짜 + 기록추가 */}
      <View style={styles.headerRow}>
        <Text style={styles.dataText}>{toKoreanDate(selectedDate)}</Text>

        <AddRecordButton title="기록 추가하기" onPress={onAddRecord} disabled={isFuture} />
      </View>

      {status === 'future' && (
        <View style={styles.centerBox}>
          <Text style={styles.centerText}>미래 날짜에는 기록할 수 없어요.</Text>
          <Text style={styles.subText}>오늘 또는 과거 날짜를 선택해 주세요.</Text>
        </View>
      )}

      {status !== 'future' && (
  <>
    {/* ✅ 카드: 기록이 있거나, '마시지 않았어요'를 눌렀을 때만 */}
{(hasRecord || isSkipped) && (
  <NutritionSummary drinks={summaryDrinks} />
)}

    {/* ✅ 1. 기록 없고 + 안마셨어요도 안 눌렀을 때 안내 문구 (버튼 위) */}
    {!hasRecord && !isSkipped && (
      <View style={styles.centerBox}>
        <Coffee style={{ marginBottom: 14, marginTop: -10 }} />
        <Text style={styles.centerText}>마신 음료가 있다면 기록을 추가해보세요.</Text>
      </View>
    )}

    {/* ✅ 2. 기록 없을 때만 "마시지 않았어요" 버튼 */}
    {!hasRecord && (
      <SkipDrinkToggle value={isSkipped} onChange={onToggleSkip} disabled={false} />
    )}

    {/* ✅ 3. 리스트 영역: 기록 있으면 리스트 / 안마셨어요면 안내 */}
    <View style={styles.list}>
      {/* 기록 있을 때만 리스트 */}
      {hasRecord &&
        !isSkipped &&
        drinks.map((d) => (
          <MenuItemRow
            key={d.id}
            brandName={d.brandName}
            menuName={d.menuName}
            optionText={d.optionText}
            pills={[
              { label: '카페인', value: d.caffeineMg, unit: 'mg' },
              { label: '당류', value: d.sugarG, unit: 'g' },
            ]}
          />
        ))}

      {/* 안마셨어요 상태 안내 (기록 없을 때 주로) */}
      {!hasRecord && isSkipped && (
        <View style={styles.centerBox}>
          <Text style={styles.subText}>오늘은 음료를 마시지 않았어요.</Text>
        </View>
      )}
    </View>
  </>
)}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
    paddingHorizontal: 16,
    paddingTop: 60,
  },

  headerRow: {
    marginTop: 32,
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
  },

  centerBox: {
    marginTop: 24,
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  centerText: {
    color: colors.grayscale[100],
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    textAlign: 'center',
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
  color: colors.grayscale[400],
},

});
