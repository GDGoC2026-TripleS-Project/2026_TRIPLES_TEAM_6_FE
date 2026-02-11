import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { colors } from '../../constants/colors';
import Coffee from '../../../assets/ComponentsImage/coffeeImg.svg';

import PeriodSelectBottomSheet from '../../components/common/PeriodSelectBottomSheet';
import Calendar from '../../components/common/Calendar';
import DrinkList from '../../components/common/MenuItem';
import OptionText from '../../components/common/OptionText';
import NutritionSummary from '../../components/calendar/NutritionSummary';
import SkipDrinkCheckbox from '../../components/calendar/SkipDrinkCheckbox';
import AddRecordButton from '../../components/common/AddRecordButton';
import DrinkDetailSheet, { DrinkLike } from '../../components/common/DrinkDetailSheet';
import { Ionicons } from '@expo/vector-icons';
import { useCalendarScreen } from '../../hooks/useCalendarScreen';

const toKoreanDate = (dateString: string) => {
  const [y, m, d] = dateString.split('-');
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
};

export default function CalendarScreen() {
  const {
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
    handleGoBrand,
    renderOptionText,
  } = useCalendarScreen();

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
            { label: '카페인', value: item.caffeineMg, unit: 'mg' },
            { label: '당류', value: item.sugarG, unit: 'g' },
          ]}
          onPress={() => openDetail(item)}
        />
      );
    },
    [openDetail, renderOptionText]
  );

  return (
    <>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={hasRecord && !isSkipped ? drinks : []}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        initialNumToRender={6}
        windowSize={5}
        removeClippedSubviews
        ListHeaderComponent={
          <View>
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

              <AddRecordButton title="기록 추가하기" onPress={onAddRecord} />
            </View>

            {(hasRecord || isSkipped) && (
              <NutritionSummary
                drinks={summaryDrinks}
                caffeineMax={caffeineGoal}
                sugarMax={sugarGoal}
              />
            )}

            {!hasRecord && !isSkipped && !isFutureDate && (
              <View style={styles.centerBox}>
                <Coffee style={{ marginTop: -10 }} />
                <Text style={styles.centerText}>
                  마신 음료가 있다면 기록을 추가해보세요.
                </Text>
              </View>
            )}

            {!hasRecord && !isFutureDate && (
              <View style={[styles.skipCheckboxWrap, isSkipped && styles.skipCheckboxWrapActive]}>
                <SkipDrinkCheckbox value={isSkipped} onChange={onToggleSkip} disabled={false} />
              </View>
            )}
          </View>
        }
        ListFooterComponent={<View style={styles.listFooterSpacing} />}
      />

      <DrinkDetailSheet
        visible={detailOpen}
        drink={selectedDrink}
        onClose={closeDetail}
        onDelete={(drink: DrinkLike) => handleDelete(drink.id)}
        onEdit={(drink: DrinkLike) => handleEdit(drink.id)}
        onTitlePress={(drink: DrinkLike) => handleGoBrand(drink.id)}
      />

      <PeriodSelectBottomSheet
        visible={periodSheetOpen}
        onClose={() => setPeriodSheetOpen(false)}
        onConfirm={handlePeriodConfirm}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
    paddingHorizontal: 3,
    paddingTop: 4,
  },
  content: {
    paddingBottom: 30,
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
    marginLeft: 8,
  },

  listFooterSpacing: {
    height: 20,
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
