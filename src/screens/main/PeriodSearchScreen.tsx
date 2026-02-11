import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

import PeriodSelectBottomSheet from '../../components/common/PeriodSelectBottomSheet';
import DrinkList from '../../components/common/MenuItem';
import OptionText from '../../components/common/OptionText';
import DrinkDetailSheet from '../../components/common/DrinkDetailSheet';
import { usePeriodSearchScreen, type PeriodRow } from '../../hooks/usePeriodSearchScreen';

type Props = {
  navigation: any;
  route: any;
};

const toKoreanDate = (dateString: string) => {
  if (!dateString) return 'YYYY.MM.DD';
  const [y, m, d] = dateString.split('-');
  return `${y}.${String(Number(m)).padStart(2, '0')}.${String(Number(d)).padStart(2, '0')}`;
};

export default function PeriodSearchScreen({ navigation, route }: Props) {
  const initialStart = route?.params?.startDate ?? '2026-01-07';
  const initialEnd = route?.params?.endDate ?? '2026-01-21';

  const {
    sheetVisible,
    setSheetVisible,
    normalized,
    summary,
    rows,
    loading,
    loadError,
    detailOpen,
    selectedDrink,
    handleConfirmPeriod,
    openDetail,
    closeDetail,
    handleDelete,
    handleEdit,
    handleGoBrand,
    renderOptionText,
    goalByDate,
    fallbackCaffeine,
    fallbackSugar,
  } = usePeriodSearchScreen(initialStart, initialEnd);

  const renderItem = ({ item }: ListRenderItemInfo<PeriodRow>) => {
    if (item.type === 'header') {
      const goals = goalByDate[item.date];
      const caffeineGoal = goals?.caffeine ?? fallbackCaffeine;
      const sugarGoal = goals?.sugar ?? fallbackSugar;
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{item.title}</Text>
          <Text style={styles.sectionGoal}>
            목표 {caffeineGoal}mg · {sugarGoal}g
          </Text>
        </View>
      );
    }

    const d = item.drink;
    const opt = renderOptionText(d);

    return (
      <DrinkList
        brandName={d.brandName}
        menuName={d.menuName}
        optionText={
          opt.base ? (
            <OptionText base={opt.base} extra={opt.extras} />
          ) : (
            <OptionText text={opt.extras[0] || '옵션 없음'} />
          )
        }
        pills={[
          { label: '카페인', value: d.caffeineMg, unit: 'mg' },
          { label: '당류', value: d.sugarG, unit: 'g' },
        ]}
        rightText={d.count ? `${d.count}잔` : undefined}
        onPress={() => openDetail(d, item.date)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack?.()}
          hitSlop={10}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color={colors.grayscale[100]} />
        </Pressable>
        <Text style={styles.headerTitle}>기간 별 조회</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.periodRow}>
        <Text style={styles.periodText}>
          {toKoreanDate(normalized.start)} - {toKoreanDate(normalized.end)}
        </Text>
        <Pressable onPress={() => setSheetVisible(true)} hitSlop={10}>
          <Text style={styles.changeText}>변경하기</Text>
        </Pressable>
      </View>

      <View style={styles.summaryWrap}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>섭취한 카페인</Text>
          <Text style={styles.summaryValue}>{summary.caffeineTotal}mg</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>섭취한 당류</Text>
          <Text style={styles.summaryValue}>{summary.sugarTotal}g</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>마신 음료</Text>
          <Text style={styles.summaryValue}>{summary.drinkCount}잔</Text>
        </View>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {loading ? '불러오는 중...' : loadError ?? '조회된 음료가 없습니다.'}
            </Text>
          </View>
        }
      />

      <DrinkDetailSheet
        visible={detailOpen}
        drink={selectedDrink}
        onClose={closeDetail}
        onDelete={(drink) => handleDelete(drink.id)}
        onEdit={(drink) => handleEdit(drink.id)}
        onTitlePress={(drink) => handleGoBrand(drink.id)}
      />

      <PeriodSelectBottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onConfirm={(s, e) => {
          handleConfirmPeriod(s, e);
          setSheetVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
  },

  header: {
    height: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.grayscale[100],
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },

  periodRow: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  periodText: {
    color: colors.grayscale[100],
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
  },
  changeText: {
    color: colors.grayscale[500],
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
  },

  summaryWrap: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayscale[900],
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.grayscale[800],
    opacity: 0.6,
    marginVertical: 5,
  },
  summaryLabel: {
    color: colors.grayscale[200],
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
  },
  summaryValue: {
    color: colors.primary[500],
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
  },

  listContent: {
    paddingBottom: 24,
  },

  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  sectionTitle: {
    color: colors.grayscale[600],
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
  },
  sectionGoal: {
    marginTop: 4,
    color: colors.grayscale[500],
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
  },

  empty: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.grayscale[600],
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    marginTop: -50,
  },
});
