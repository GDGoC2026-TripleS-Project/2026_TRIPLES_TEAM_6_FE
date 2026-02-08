import React, { useEffect, useMemo, useState } from 'react';
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
import DrinkDetailSheet, { type DrinkLike } from '../../components/common/DrinkDetailSheet';

import {
  fetchDailyIntake,
  fetchIntakeDetail,
  fetchPeriodIntake,
  type DailyIntake,
  type IntakeDrink,
} from '../../api/record/intake.api';
import { buildOptionBase } from '../../utils/recordOptions';

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

const parseDate = (dateString: string) => {
  const [y, m, d] = dateString.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const toDateList = (start: string, end: string) => {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  if (!startDate || !endDate) return [];

  const dates: string[] = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    const yyyy = cursor.getFullYear();
    const mm = String(cursor.getMonth() + 1).padStart(2, '0');
    const dd = String(cursor.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

type SectionRow =
  | { type: 'header'; id: string; title: string }
  | { type: 'drink'; id: string; date: string; drink: IntakeDrink };

export default function PeriodSearchScreen({ navigation, route }: Props) {
  const initialStart = route?.params?.startDate ?? '2026-01-07';
  const initialEnd = route?.params?.endDate ?? '2026-01-21';

  const [sheetVisible, setSheetVisible] = useState(false);
  const [startDate, setStartDate] = useState<string>(initialStart);
  const [endDate, setEndDate] = useState<string>(initialEnd);
  const [days, setDays] = useState<DailyIntake[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<DrinkLike | null>(null);
  const [summary, setSummary] = useState({
    caffeineTotal: 0,
    sugarTotal: 0,
    drinkCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const normalized = useMemo(() => {
    if (!startDate || !endDate) return { start: startDate, end: endDate };
    return startDate <= endDate ? { start: startDate, end: endDate } : { start: endDate, end: startDate };
  }, [startDate, endDate]);

  useEffect(() => {
    let isMounted = true;
    const loadPeriod = async () => {
      if (!normalized.start || !normalized.end) {
        setDays([]);
        setSummary({ caffeineTotal: 0, sugarTotal: 0, drinkCount: 0 });
        return;
      }
      setLoading(true);
      setLoadError(null);
      try {
        const periodRes = await fetchPeriodIntake(normalized.start, normalized.end);
        if (isMounted && periodRes.success && periodRes.data) {
          setSummary({
            caffeineTotal: periodRes.data.totalCaffeineMg ?? 0,
            sugarTotal: periodRes.data.totalSugarG ?? 0,
            drinkCount: periodRes.data.drinkCount ?? 0,
          });
        } else if (isMounted) {
          setSummary({ caffeineTotal: 0, sugarTotal: 0, drinkCount: 0 });
        }

        const dates = toDateList(normalized.start, normalized.end);
        const dailyResults = await Promise.all(
          dates.map(async (date) => {
            try {
              return await fetchDailyIntake(date);
            } catch {
              return null;
            }
          })
        );
        if (!isMounted) return;

        const nextDays = dailyResults
          .filter((res): res is { success: true; data: DailyIntake } =>
            Boolean(res && (res as any).success && (res as any).data)
          )
          .map((res) => res.data)
          .filter((day) => day.drinks.length > 0)
          .sort((a, b) => (a.date < b.date ? 1 : -1));

        setDays(nextDays);
      } catch {
        if (!isMounted) return;
        setDays([]);
        setSummary({ caffeineTotal: 0, sugarTotal: 0, drinkCount: 0 });
        setLoadError('기간 기록을 불러오지 못했습니다.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadPeriod();
    return () => {
      isMounted = false;
    };
  }, [normalized.start, normalized.end]);

  const rows: SectionRow[] = useMemo(() => {
    const out: SectionRow[] = [];

    for (const day of days) {
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
  }, [days]);

  const handleConfirmPeriod = (s: string, e: string) => {
    setStartDate(s);
    setEndDate(e);
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

  const renderItem = ({ item }: ListRenderItemInfo<SectionRow>) => {
    if (item.type === 'header') {
      return <Text style={styles.sectionTitle}>{item.title}</Text>;
    }

    const d = item.drink;
    const temp = d.temperature === 'HOT' ? 'hot' : d.temperature === 'ICED' ? 'ice' : undefined;
    const base = buildOptionBase(temp, d.sizeName);
    const extraText = d.optionText?.trim();
    const extras =
      extraText && extraText !== '옵션 없음'
        ? extraText.split(' | ').map((s) => s.trim()).filter(Boolean)
        : [];

    return (
      <DrinkList
        brandName={d.brandName}
        menuName={d.menuName}
        optionText={
          base ? (
            <OptionText base={base} extra={extras} />
          ) : (
            <OptionText text={extraText || '옵션 없음'} />
          )
        }
        pills={[
          { label: '카페인', value: d.caffeineMg, unit: 'mg' },
          { label: '당류', value: d.sugarG, unit: 'g' },
        ]}
        rightText={d.count ? `${d.count}잔` : undefined}
        onPress={() => openDetail(d)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* 헤더 */}
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

      {/* 기간 + 변경하기 */}
      <View style={styles.periodRow}>
        <Text style={styles.periodText}>
          {toKoreanDate(normalized.start)} - {toKoreanDate(normalized.end)}
        </Text>
        <Pressable onPress={() => setSheetVisible(true)} hitSlop={10}>
          <Text style={styles.changeText}>변경하기</Text>
        </Pressable>
      </View>

      {/* 요약 */}
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

      {/* 리스트 */}
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
      />

      {/* 기간 선택 바텀시트 */}
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
