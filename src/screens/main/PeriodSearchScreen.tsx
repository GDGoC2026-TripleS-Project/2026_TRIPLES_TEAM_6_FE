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
const Header = ({ onBack }: { onBack: () => void }) => (
  <View style={styles.header}>
    <Pressable onPress={onBack} hitSlop={10} style={styles.backBtn}>
      <Ionicons name="chevron-back" size={24} color={colors.grayscale[100]} />
    </Pressable>
    <Text style={styles.headerTitle}>기간 별 조회</Text>
    <View style={{ width: 24 }} />
  </View>
);

const PeriodSelector = ({
  startDate,
  endDate,
  onChangePress,
}: {
  startDate: string;
  endDate: string;
  onChangePress: () => void;
}) => (
  <View style={styles.periodRow}>
    <Text style={styles.periodText}>
      {toKoreanDate(startDate)} ~ {toKoreanDate(endDate)}
    </Text>
    <Pressable onPress={onChangePress} hitSlop={10}>
      <Text style={styles.changeText}>변경하기</Text>
    </Pressable>
  </View>
);

const SummaryRow = ({
  label,
  value,
  unit,
  note,
}: {
  label: string;
  value: number;
  unit: string;
  note?: string;
}) => (
  <View style={styles.summaryRow}>
    <Text style={styles.summaryRowLabel}>{label}</Text>
    <View style={styles.summaryValueCol}>
      <Text style={styles.summaryValue}>
        {value}
        {unit}
      </Text>
      {note && <Text style={styles.summaryNote}>{note}</Text>}
    </View>
  </View>
);

const SummarySection = ({
  caffeineTotal,
  espressoShotCount,
  sugarTotal,
  sugarCubeCount,
}: {
  caffeineTotal: number;
  espressoShotCount?: number;
  sugarTotal: number;
  sugarCubeCount?: number;
}) => (
  <View style={styles.summaryWrap}>
    <SummaryRow
      label="섭취한 카페인"
      value={caffeineTotal}
      unit="mg"
      note={
        typeof espressoShotCount === 'number'
          ? `에스프레소 약 ${espressoShotCount}잔`
          : undefined
      }
    />
    <View style={styles.summaryDivider} />
    <SummaryRow
      label="섭취한 당류"
      value={sugarTotal}
      unit="g"
      note={
        typeof sugarCubeCount === 'number'
          ? `각설탕 약 ${sugarCubeCount}개`
          : undefined
      }
    />
  </View>
);

const SectionHeader = ({
  title,
  caffeineGoal,
  sugarGoal,
}: {
  title: string;
  caffeineGoal?: number;
  sugarGoal?: number;
}) => {
  const showGoals = Boolean(caffeineGoal || sugarGoal);

  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {showGoals && (
        <Text style={styles.sectionGoal}>
          목표 {caffeineGoal ?? '-'}mg · {sugarGoal ?? '-'}g
        </Text>
      )}
    </View>
  );
};

const EmptyState = ({
  loading,
  error,
}: {
  loading: boolean;
  error?: string | null;
}) => (
  <View style={styles.empty}>
    <Text style={styles.emptyText}>
      {loading ? '불러오는 중...' : error ?? '조회된 음료가 없습니다.'}
    </Text>
  </View>
);

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

  // ==================== 렌더 함수 ====================
  const renderItem = ({ item }: ListRenderItemInfo<PeriodRow>) => {
    // 섹션 헤더 렌더링
    if (item.type === 'header') {
      const goals = goalByDate[item.date];
      const pickGoal = (...values: Array<number | undefined>) =>
        values.find((v) => typeof v === 'number' && v > 0);

      const caffeineGoal = pickGoal(
        item.goalCaffeine,
        goals?.caffeine,
        fallbackCaffeine
      );
      const sugarGoal = pickGoal(item.goalSugar, goals?.sugar, fallbackSugar);

      return (
        <SectionHeader
          title={item.title}
          caffeineGoal={caffeineGoal}
          sugarGoal={sugarGoal}
        />
      );
    }

    // 음료 아이템 렌더링
    const drink = item.drink;
    const option = renderOptionText(drink);

    return (
      <DrinkList
        brandName={drink.brandName}
        menuName={drink.menuName}
        optionText={
          option.base ? (
            <OptionText base={option.base} extra={option.extras} />
          ) : (
            <OptionText text={option.extras[0] || '옵션 없음'} />
          )
        }
        pills={[
          { label: '카페인', value: drink.caffeineMg, unit: 'mg' },
          { label: '당류', value: drink.sugarG, unit: 'g' },
        ]}
        rightText={drink.count ? `${drink.count}잔` : undefined}
        onPress={() => openDetail(drink, item.date)}
      />
    );
  };

  // ==================== 이벤트 핸들러 ====================
  const handleBack = () => navigation.goBack?.();
  const handleOpenPeriodSheet = () => setSheetVisible(true);
  const handleClosePeriodSheet = () => setSheetVisible(false);
  const handlePeriodConfirm = (start: string, end: string) => {
    handleConfirmPeriod(start, end);
    setSheetVisible(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header onBack={handleBack} />

      <PeriodSelector
        startDate={normalized.start}
        endDate={normalized.end}
        onChangePress={handleOpenPeriodSheet}
      />
      <SummarySection
        caffeineTotal={summary.caffeineTotal}
        espressoShotCount={summary.espressoShotCount}
        sugarTotal={summary.sugarTotal}
        sugarCubeCount={summary.sugarCubeCount}
      />

      <Text style={styles.drinkListLabel}>마신 음료</Text>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState loading={loading} error={loadError} />}
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
        onClose={handleClosePeriodSheet}
        onConfirm={handlePeriodConfirm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
  },

  // Header
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

  // Period Selector
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
    paddingTop: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayscale[900],
  },
  summaryRow: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.grayscale[800],
    opacity: 0.6,
  },
  summaryRowLabel: {
    color: colors.grayscale[200],
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
  },
  summaryValueCol: {
    alignItems: 'flex-end',
  },
  summaryValue: {
    color: colors.primary[500],
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
  },
  summaryNote: {
    color: colors.grayscale[500],
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    marginTop: 4,
  },

  // Drink List
  drinkListLabel: {
    color: colors.grayscale[200],
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    paddingLeft: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listContent: {
    paddingBottom: 24,
  },

  // Section Header
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

  // Empty State
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