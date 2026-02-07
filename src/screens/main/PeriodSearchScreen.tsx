import React, { useMemo, useState } from 'react';
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

import { findDrinksByRange, type Drink, MOCK_DAY_DRINKS } from '../../data/drinksData';

type Props = {
  navigation: any;
  route: any;
};

const toKoreanDate = (dateString: string) => {
  if (!dateString) return 'YYYY.MM.DD';
  const [y, m, d] = dateString.split('-');
  return `${y}.${String(Number(m)).padStart(2, '0')}.${String(Number(d)).padStart(2, '0')}`;
};

const toSectionTitle = (dateString: string) => {
  return toKoreanDate(dateString);
};

type SectionRow =
  | { type: 'header'; id: string; title: string }
  | { type: 'drink'; id: string; date: string; drink: Drink };

export default function PeriodSearchScreen({ navigation, route }: Props) {
  const initialStart = route?.params?.startDate ?? '2026-01-07';
  const initialEnd = route?.params?.endDate ?? '2026-01-21';

  const [sheetVisible, setSheetVisible] = useState(false);
  const [startDate, setStartDate] = useState<string>(initialStart);
  const [endDate, setEndDate] = useState<string>(initialEnd);

  const normalized = useMemo(() => {
    if (!startDate || !endDate) return { start: startDate, end: endDate };
    return startDate <= endDate ? { start: startDate, end: endDate } : { start: endDate, end: startDate };
  }, [startDate, endDate]);

  const rangeDrinks = useMemo(() => {
    if (!normalized.start || !normalized.end) return [];
    return findDrinksByRange(normalized.start, normalized.end);
  }, [normalized.start, normalized.end]);

  const dayGroups = useMemo(() => {
    const daysInRange = MOCK_DAY_DRINKS
      .filter((d) => d.date >= normalized.start && d.date <= normalized.end)
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    return daysInRange;
  }, [normalized.start, normalized.end]);

  const rows: SectionRow[] = useMemo(() => {
    const out: SectionRow[] = [];

    for (const day of dayGroups) {
      out.push({
        type: 'header',
        id: `h_${day.date}`,
        title: toSectionTitle(day.date),
      });

      for (const drink of day.drinks) {
        out.push({
          type: 'drink',
          id: `d_${day.date}_${drink.id}`,
          date: day.date,
          drink,
        });
      }
    }

    return out;
  }, [dayGroups]);

  const summary = useMemo(() => {
    const caffeineTotal = rangeDrinks.reduce((acc, cur) => acc + (cur.caffeineMg ?? 0), 0);
    const sugarTotal = rangeDrinks.reduce((acc, cur) => acc + (cur.sugarG ?? 0), 0);

    const drinkCount = rangeDrinks.reduce((acc, cur) => acc + (cur.count ?? 1), 0);

    return { caffeineTotal, sugarTotal, drinkCount };
  }, [rangeDrinks]);

  const handleConfirmPeriod = (s: string, e: string) => {
    setStartDate(s);
    setEndDate(e);
  };

  const renderItem = ({ item }: ListRenderItemInfo<SectionRow>) => {
    if (item.type === 'header') {
      return <Text style={styles.sectionTitle}>{item.title}</Text>;
    }

    const d = item.drink;

    return (
      <DrinkList
        brandName={d.brandName}
        menuName={d.menuName}
        optionText={d.optionText}
        pills={[
          { label: '카페인', value: d.caffeineMg, unit: 'mg' },
          { label: '당류', value: d.sugarG, unit: 'g' },
        ]}
        rightText={d.count ? `${d.count}잔` : undefined}
        onPress={() => {
          // TODO: 상세 화면 이동 필요 시 여기서 navigate
        }}
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
            <Text style={styles.emptyText}>조회된 음료가 없습니다.</Text>
          </View>
        }
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

  sectionTitle: {
    color: colors.grayscale[600],
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    marginTop: 6,
    marginBottom: 6,
    paddingHorizontal: 16,
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
