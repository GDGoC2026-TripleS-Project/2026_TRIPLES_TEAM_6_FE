import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Chart from '../../components/common/Chart';
import { colors } from '../../constants/colors';
import DrinkList from '../../components/common/MenuItem';
import { useGoalStore } from '../../store/goalStore';
import { Svg, Path } from 'react-native-svg';
import Coffee from '../../../assets/ComponentsImage/coffeeImg.svg';
import SkipDrinkCheckbox from '../../components/calendar/SkipDrinkCheckbox';
import DrinkDetailSheet, { type DrinkLike } from '../../components/common/DrinkDetailSheet';
import DatePickerBottomSheet from '../../components/common/DatePickerBottomSheet';
import { fetchDailyIntake, type DailyIntake, type IntakeDrink } from '../../api/record/intake.api';

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


  const openDetail = (drink: DrinkLike) => {
    setSelectedDrink(drink);
    setDetailOpen(true);
  };

  const closeDetail = () => setDetailOpen(false);

  const onEditDrink = (drink: DrinkLike) => {
    closeDetail();
    console.log('edit', drink.id);
  };

  const onDeleteDrink = (drink: DrinkLike) => {
    closeDetail();
    console.log('delete', drink.id);
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
              const drinkForSheet: DrinkLike = {
                id: drink.id ?? `${dateKey}_${index}`,
                brandName: drink.brandName,
                menuName: drink.menuName,
                caffeineMg: drink.caffeineMg ?? 0,
                sugarG: drink.sugarG ?? 0,
                calorieKcal: drink.calorieKcal,
                sodiumMg: drink.sodiumMg,
                proteinG: drink.proteinG,
                fatG: drink.fatG,
              };

              return (
                <DrinkList 
                  key={`drink_${drink.id ?? index}`}
                  brandName={drink.brandName}
                  menuName={drink.menuName}
                  optionText={drink.optionText || '옵션 없음'}
                  pills={[
                    { label: '카페인', value: drink.caffeineMg || 0, unit: 'mg' },
                    { label: '당류', value: drink.sugarG || 0, unit: 'g' },
                  ]}
                  onPress={() => openDetail(drinkForSheet)}
                />
              );
            })
          ) : (
            <View style={{justifyContent: 'center', alignItems: 'center', flex: 1, marginTop: 20, gap: 8}}>
              <Coffee width={80} height={80}/>
              <Text style={{color: colors.grayscale[100], fontSize: 18, fontFamily: 'Pretendard-Medium'}}>마신 음료가 있다면 기록을 추가해보세요.</Text>
              <SkipDrinkCheckbox value={isSkipped} onChange={onToggleSkip} disabled={false} />
            </View>
          )}
        </View>
      </View>

      <DrinkDetailSheet
        visible={detailOpen}
        drink={selectedDrink}
        onClose={closeDetail}
        onEdit={onEditDrink}
        onDelete={onDeleteDrink}
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
    backgroundColor: '#000',
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
