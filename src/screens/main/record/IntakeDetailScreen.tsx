import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../../types/navigation';
import { colors } from '../../../constants/colors';
import HeaderDetail from '../../../components/common/HeaderDetail';
import { fetchIntakeDetail, type IntakeDetail } from '../../../api/record/intake.api';

type IntakeDetailRouteProp = RouteProp<RootStackParamList, 'IntakeDetail'>;
type IntakeDetailNavProp = NativeStackNavigationProp<RootStackParamList, 'IntakeDetail'>;

const formatDate = (raw?: string) => {
  if (!raw) return '';
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
  }
  const [y, m, day] = raw.split('T')[0].split('-');
  if (y && m && day) return `${y}.${m}.${day}`;
  return raw;
};

const formatTemperature = (t?: string) => {
  if (t === 'HOT') return 'HOT';
  if (t === 'ICED') return 'ICE';
  return '';
};

export default function IntakeDetailScreen() {
  const route = useRoute<IntakeDetailRouteProp>();
  const navigation = useNavigation<IntakeDetailNavProp>();
  const { intakeId } = route.params;

  const [detail, setDetail] = useState<IntakeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchIntakeDetail(intakeId);
        if (!isMounted) return;
        if (res.success && res.data) {
          setDetail(res.data);
        } else {
          setError(res.error?.message ?? '상세 정보를 불러오지 못했습니다.');
        }
      } catch {
        if (!isMounted) return;
        setError('상세 정보를 불러오지 못했습니다.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [intakeId]);

  const optionText = useMemo(() => {
    if (!detail?.options || detail.options.length === 0) return '옵션 없음';
    return detail.options
      .map((opt) => {
        const name = opt.optionName ?? `옵션 ${opt.optionId}`;
        const count = opt.count ?? 1;
        return count > 1 ? `${name} ${count}` : name;
      })
      .join(' | ');
  }, [detail?.options]);

  const rows = useMemo(
    () => [
      { label: '카페인', value: detail?.caffeineMg ?? 0, unit: 'mg' },
      { label: '당류', value: detail?.sugarG ?? 0, unit: 'g' },
      { label: '칼로리', value: detail?.calorieKcal ?? 0, unit: 'kcal' },
      { label: '나트륨', value: detail?.sodiumMg ?? 0, unit: 'mg' },
      { label: '단백질', value: detail?.proteinG ?? 0, unit: 'g' },
      { label: '지방', value: detail?.fatG ?? 0, unit: 'g' },
    ],
    [detail]
  );

  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.grayscale[1000] }}>
        <HeaderDetail title="섭취 기록 상세" onBack={() => navigation.goBack()} initialRightType="none" />
      </SafeAreaView>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {loading && <Text style={styles.infoText}>불러오는 중...</Text>}
        {!loading && error && <Text style={styles.infoText}>{error}</Text>}

        {!loading && !error && detail && (
          <>
            <View style={styles.header}>
              <Text style={styles.brand}>{detail.brandName}</Text>
              <Text style={styles.menu}>{detail.menuName}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{formatDate(detail.recordedAt)}</Text>
              <Text style={styles.metaText}>
                {[
                  detail.sizeName,
                  formatTemperature(detail.temperature),
                  detail.count ? `${detail.count}잔` : undefined,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>옵션</Text>
              <Text style={styles.sectionBody}>{optionText}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>영양 정보</Text>
              <View style={styles.table}>
                {rows.map((r) => (
                  <View key={r.label} style={styles.row}>
                    <Text style={styles.rowLabel}>{r.label}</Text>
                    <Text style={styles.rowValue}>
                      {r.value}
                      <Text style={styles.rowUnit}>{r.unit}</Text>
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  infoText: {
    color: colors.grayscale[500],
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    paddingTop: 20,
  },
  header: {
    paddingTop: 16,
    gap: 6,
  },
  brand: {
    color: colors.grayscale[500],
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
  },
  menu: {
    color: colors.grayscale[100],
    fontSize: 20,
    fontFamily: 'Pretendard-SemiBold',
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    color: colors.grayscale[600],
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
  },
  section: {
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.grayscale[900],
  },
  sectionTitle: {
    color: colors.grayscale[300],
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 8,
  },
  sectionBody: {
    color: colors.grayscale[100],
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    lineHeight: 22,
  },
  table: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: colors.grayscale[200],
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
  },
  rowValue: {
    color: colors.grayscale[100],
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
  },
  rowUnit: {
    color: colors.grayscale[300],
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
  },
});
