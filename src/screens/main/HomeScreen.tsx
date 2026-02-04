import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { MainTabParamList } from '../../types/navigation';
import Chart from '../../components/common/Chart';
import { colors } from '../../constants/colors';
import DrinkList from '../../components/common/MenuItem';
import { useOptionStore } from '../../store/useOptionStore';
import { Svg, Path } from 'react-native-svg';
import Coffee from '../../../assets/ComponentsImage/coffeeImg.svg';
import SkipDrinkCheckbox from '../../components/calendar/SkipDrinkCheckbox';
import DrinkDetailSheet, { type DrinkLike } from '../../components/common/DrinkDetailSheet';
import DatePickerBottomSheet from '../../components/common/DatePickerBottomSheet';

const OPTION_NAMES: Record<string, string> = {
  shot: '샷 추가',
  syrup: '시럽 추가',
  decafaine: '샷 추가(디카페인)',
  sugar: '설탕 시럽',
  vanilla: '바닐라 시럽',
  hazelnut: '헤이즐럿 시럽',
  soy: '두유',
  almond: '아몬드 브리즈',
};

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
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList, 'Home'>>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [skippedByDate, setSkippedByDate] = useState<Record<string, boolean>>({});
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<DrinkLike | null>(null);
  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  
  const getGroupsByDate = useOptionStore(state => state.getGroupsByDate);
  const getDailyStats = useOptionStore(state => state.getDailyStats);
  
  const todayGroups = getGroupsByDate(selectedDate);
  const stats = getDailyStats(selectedDate);
  const dateKey = (() => {
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();
  const isSkipped = !!skippedByDate[dateKey];
  const hasRecord = todayGroups.length > 0;

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

  const formatOptions = (group: {
    stepperCounts?: Record<string, number>;
    chipSelected?: Set<string>;
    temperature?: string;
    size?: string;
  }) => {
    const parts: string[] = [];

    if (group.stepperCounts) {
      Object.entries(group.stepperCounts).forEach(([key, count]) => {
        if (count > 0) {
          const name = OPTION_NAMES[key] || key;
          parts.push(`${name} ${count}`);
        }
      });
    }

    if (group.chipSelected && group.chipSelected.size > 0) {
      group.chipSelected.forEach((id) => {
        const name = OPTION_NAMES[id] || id;
        parts.push(name);
      });
    }

    const temp = group.temperature === 'hot' ? 'Hot' : 'Ice';
    const size = group.size ?? '';
    const base = size ? `${temp} | ${size}` : temp;

    return { base, extra: parts };
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
          dailyLimit={400}
          unit="mg"
        />
        <Chart 
          title="당류"
          currentIntake={stats.sugar}
          dailyLimit={25}
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
            todayGroups.map((groupData, index) => {
              const optionInfo = formatOptions(groupData);
              const drinkForSheet: DrinkLike = {
                id: `${dateKey}_${index}`,
                brandName: groupData.brandName,
                menuName: groupData.menuName,
                caffeineMg: groupData.caffeine ?? 0,
                sugarG: groupData.sugar ?? 0,
              };

              return (
                <DrinkList 
                  key={`drink_${index}`}
                  brandName={groupData.brandName}
                  menuName={groupData.menuName}
                  optionText={
                    <View style={styles.optionWrap}>
                      <Text style={styles.optionBase}>{optionInfo.base}</Text>
                      {optionInfo.extra.length > 0 && (
                        <Text style={styles.optionExtra}>{optionInfo.extra.join(', ')}</Text>
                      )}
                    </View>
                  }
                  pills={[
                    { label: '카페인', value: groupData.caffeine || 0, unit: 'mg' },
                    { label: '당류', value: groupData.sugar || 0, unit: 'g' },
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
