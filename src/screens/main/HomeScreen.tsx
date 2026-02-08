import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Chart from '../../components/common/Chart';
import { colors } from '../../constants/colors';
import DrinkList from '../../components/common/MenuItem';
import OptionText from '../../components/common/OptionText';
import DrinkDetailSheet, { type DrinkLike } from '../../components/common/DrinkDetailSheet';
import { useGoalStore } from '../../store/goalStore';
import { Svg, Path } from 'react-native-svg';
import Coffee from '../../../assets/ComponentsImage/coffeeImg.svg';
import SkipDrinkCheckbox from '../../components/calendar/SkipDrinkCheckbox';
import DatePickerBottomSheet from '../../components/common/DatePickerBottomSheet';
import {
  fetchDailyIntake,
  fetchIntakeDetail,
  type DailyIntake,
  type IntakeDrink,
} from '../../api/record/intake.api';
import { buildOptionBase } from '../../utils/recordOptions';

const ChevronLeft = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={'#6B7277'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ChevronRight = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M9 18L15 12L9 6" stroke={'#6B7277'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [skippedByDate, setSkippedByDate] = useState<Record<string, boolean>>({});
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<DrinkLike | null>(null);
  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  const [daily, setDaily] = useState<DailyIntake | null>(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyError, setDailyError] = useState<string | null>(null);

  const caffeineGoal = useGoalStore((s) => s.caffeine);
  const sugarGoal = useGoalStore((s) => s.sugar);

  const dateKey = (() => {
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();
  const isSkipped = !!skippedByDate[dateKey];
  const drinks: IntakeDrink[] = daily?.drinks ?? [];
  const stats = {
    caffeine: daily?.totalCaffeineMg ?? 0,
    sugar: daily?.totalSugarG ?? 0,
    count: daily?.drinkCount ?? drinks.length,
  };
  const hasRecord = drinks.length > 0;

  useEffect(() => {
    let isMounted = true;
    const loadDaily = async () => {
      setDailyLoading(true);
      setDailyError(null);
      try {
        const res = await fetchDailyIntake(dateKey);
        if (!isMounted) return;
        if (res.success && res.data) {
          setDaily(res.data);
        } else {
          setDaily({
            date: dateKey,
            totalCaffeineMg: 0,
            totalSugarG: 0,
            drinkCount: 0,
            drinks: [],
          });
          setDailyError(res.error?.message ?? '일별 섭취 기록을 불러오지 못했습니다.');
        }
      } catch {
        if (!isMounted) return;
        setDaily({
          date: dateKey,
          totalCaffeineMg: 0,
          totalSugarG: 0,
          drinkCount: 0,
          drinks: [],
        });
        setDailyError('일별 섭취 기록을 불러오지 못했습니다.');
      } finally {
        if (isMounted) setDailyLoading(false);
      }
    };
    loadDaily();
    return () => {
      isMounted = false;
    };
  }, [dateKey]);

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
      // fallback to list data
    }
  };

  const closeDetail = () => setDetailOpen(false);

  const renderOptionText = (drink: IntakeDrink) => {
    const temp = drink.temperature === 'HOT' ? 'hot' : drink.temperature === 'ICED' ? 'ice' : undefined;
    const base = buildOptionBase(temp, drink.sizeName);
    const extraText = drink.optionText?.trim();
    const extras =
      extraText && extraText !== '옵션 없음'
        ? extraText.split(' | ').map((s) => s.trim()).filter(Boolean)
        : [];

    if (base) {
      return <OptionText base={base} extra={extras} />;
    }

    return <OptionText text={extraText || '옵션 없음'} />;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.dateHeader}>
        <TouchableOpacity onPress={handlePrevDay} style={styles.arrowButton}>
          <ChevronLeft />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDateSheetOpen(true)} hitSlop={8}>
          <Text style={styles.dateText}>{formatDateHeader(selectedDate)}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNextDay} style={styles.arrowButton}>
          <ChevronRight />
        </TouchableOpacity>
      </View>

      <View style={styles.chartContainer}>
        <Chart 
          title="카페인"
          currentIntake={stats.caffeine}
          dailyLimit={caffeineGoal}
          unit="mg"
        />
        <Chart 
          title="당류"
          currentIntake={stats.sugar}
          dailyLimit={sugarGoal}
          unit="g"
        />
      </View>

      <View style={styles.drinkSection}>
        <View style={styles.drinkHeader}>
          <Text style={styles.title}>오늘 마신 음료</Text>
          <Text style={styles.countTitle}>{stats.count}잔</Text>
        </View>
        <View>
          {hasRecord ? (
            drinks.map((drink, index) => {
              return (
                <DrinkList 
                  key={`drink_${drink.id ?? index}`}
                  brandName={drink.brandName}
                  menuName={drink.menuName}
                  optionText={renderOptionText(drink)}
                  pills={[
                    { label: '카페인', value: drink.caffeineMg || 0, unit: 'mg' },
                    { label: '당류', value: drink.sugarG || 0, unit: 'g' },
                  ]}
                  onPress={() => openDetail(drink)}
                />
              );
            })
          ) : (
            <View style={{justifyContent: 'center', alignItems: 'center', flex: 1, marginTop: 20, gap: 8}}>
              <Coffee width={80} height={80}/>
              <Text style={{color: colors.grayscale[100], fontSize: 18, fontFamily: 'Pretendard-Medium'}}>
                {isSkipped ? '오늘은 카페에서 음료를 마시지 않았어요.' : '마신 음료가 있다면 기록을 추가해보세요.'}
              </Text>
              <SkipDrinkCheckbox value={isSkipped} onChange={onToggleSkip} disabled={false} />
            </View>
          )}
        </View>
      </View>

      <DrinkDetailSheet
        visible={detailOpen}
        drink={selectedDrink}
        onClose={closeDetail}
      />

      <DatePickerBottomSheet
        visible={dateSheetOpen}
        value={selectedDate}
        onChange={setSelectedDate}
        onClose={() => setDateSheetOpen(false)}
      />
    </ScrollView>
  );
} 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    gap: 20,
    paddingTop: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 26,
    
  },
  arrowButton: {
    padding: 8,
  },
  dateText: {
    fontSize: 16,
    color: colors.grayscale[100],
    fontFamily: 'Pretendard-Bold',
    textAlign: 'center',
  },
  chartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 20
  },
  drinkSection: {
    flex: 1,
  },
  drinkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    color: colors.grayscale[100],
    fontFamily: 'Pretendard-Semibold'
  },
  countTitle: {
    fontSize: 14,
    color: colors.primary[500],
    fontFamily: 'Pretendard-Semibold'
  },
  optionWrap: {
    flexDirection: 'row',
    gap: 16
  },
  optionBase: {
    color: colors.grayscale[600],
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
  },
  optionExtra: {
    color: colors.grayscale[200],
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
  },
});
