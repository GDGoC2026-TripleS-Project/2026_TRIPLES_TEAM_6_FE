import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Chart from '../../components/common/Chart';
import { colors } from '../../constants/colors';
import DrinkList from '../../components/common/MenuItem';
import OptionText from '../../components/common/OptionText';
import DrinkDetailSheet from '../../components/common/DrinkDetailSheet';
import { Svg, Path } from 'react-native-svg';
import Coffee from '../../../assets/ComponentsImage/coffeeImg.svg';
import SkipDrinkCheckbox from '../../components/calendar/SkipDrinkCheckbox';
import DatePickerBottomSheet from '../../components/common/DatePickerBottomSheet';
import { useHomeScreen } from '../../hooks/useHomeScreen';

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
  const {
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
    formatDateHeader,
    handlePrevDay,
    handleNextDay,
    openDetail,
    closeDetail,
    handleDelete,
    handleEdit,
    handleGoBrand,
    renderOptionText,
  } = useHomeScreen();

  const renderItem = useCallback(
    ({ item }: { item: typeof drinks[number] }) => {
      const opt = renderOptionText(item);
      return (
        <DrinkList
          brandName={item.brandName}
          menuName={item.menuName}
          optionText={
            opt.base ? (
              <OptionText base={opt.base} extra={opt.extras} />
            ) : (
              <OptionText text={opt.extras[0] || '옵션 없음'} />
            )
          }
          pills={[
            { label: '카페인', value: item.caffeineMg || 0, unit: 'mg' },
            { label: '당류', value: item.sugarG || 0, unit: 'g' },
          ]}
          onPress={() => openDetail(item)}
        />
      );
    },
    [openDetail, renderOptionText]
  );

  const renderEmpty = () => {
    if (isFutureDate) return null;
    return (
      <View style={styles.emptyWrap}>
        <Coffee width={80} height={80} />
        <Text style={styles.emptyText}>
          {isSkipped
            ? '오늘은 카페에서 음료를 마시지 않았어요.'
            : '마신 음료가 있다면 기록을 추가해보세요.'}
        </Text>
        <SkipDrinkCheckbox value={isSkipped} onChange={onToggleSkip} disabled={false} />
      </View>
    );
  };

  return (
    <>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={hasRecord ? drinks : []}
        keyExtractor={(item, index) => String(item.id ?? index)}
        renderItem={renderItem}
        initialNumToRender={6}
        windowSize={5}
        removeClippedSubviews
        ListHeaderComponent={
          <View>
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
            </View>
          </View>
        }
        ListEmptyComponent={renderEmpty}
      />

      <DrinkDetailSheet
        visible={detailOpen}
        drink={selectedDrink}
        onClose={closeDetail}
        onDelete={(drink) => handleDelete(drink.id)}
        onEdit={(drink) => handleEdit(drink.id)}
        onTitlePress={(drink) => handleGoBrand(drink.id)}
      />

      <DatePickerBottomSheet
        visible={dateSheetOpen}
        value={selectedDate}
        onChange={setSelectedDate}
        onClose={() => setDateSheetOpen(false)}
      />
    </>
  );
} 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    gap: 20,
    paddingTop: 16,
  },
  content: {
    paddingBottom: 24,
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
  emptyWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  emptyText: {
    color: colors.grayscale[100],
    fontSize: 18,
    fontFamily: 'Pretendard-Medium',
    textAlign: 'center',
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
