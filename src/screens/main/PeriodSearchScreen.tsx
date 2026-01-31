import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

import Calendar from '../../components/common/Calendar';
import Button from '../../components/common/Button';

import { findDrinksByRange, type Drink } from '../../data/drinksData';

type Step = 'form' | 'pickStart' | 'pickEnd' | 'result';

const todayString = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const toKoreanDate = (dateString: string) => {
  if (!dateString) return '';
  const [y, m, d] = dateString.split('-');
  return `${y}.${String(Number(m)).padStart(2, '0')}.${String(Number(d)).padStart(2, '0')}`;
};

const clampRange = (start: string, end: string) => {
  if (!start || !end) return { start, end };
  return start <= end ? { start, end } : { start: end, end: start };
};

export default function PeriodSearchScreen() {
  const [step, setStep] = useState<Step>('form');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const { start, end } = useMemo(() => clampRange(startDate, endDate), [startDate, endDate]);

  const canSearch = !!start && !!end;

  // 결과
  const resultDrinks: Drink[] = useMemo(() => {
    if (step !== 'result' || !canSearch) return [];
    return findDrinksByRange(start, end);
  }, [step, canSearch, start, end]);

  const summary = useMemo(() => {
    const caffeine = resultDrinks.reduce((sum, d) => sum + d.caffeineMg, 0);
    const sugar = resultDrinks.reduce((sum, d) => sum + d.sugarG, 0);
    return {
      caffeineMg: caffeine,
      sugarG: sugar,
      count: resultDrinks.length,
    };
  }, [resultDrinks]);

  const onPickStart = () => setStep('pickStart');
  const onPickEnd = () => setStep('pickEnd');

  const onSelectStart = (date: string) => {
    // 미래 날짜 선택 막고 싶으면 여기서 필터 가능
    // if (date > todayString()) return;
    setStartDate(date);
    setStep('form');
  };

  const onSelectEnd = (date: string) => {
    // if (date > todayString()) return;
    setEndDate(date);
    setStep('form');
  };

  const onSearch = () => {
    if (!canSearch) return;
    setStep('result');
  };

  const onReset = () => {
    setStartDate('');
    setEndDate('');
    setStep('form');
  };

  return (
    <View style={styles.container}>
      {/* ---------- FORM ---------- */}
      {step === 'form' && (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>기간별 조회</Text>
          </View>

          {/* 디자인처럼 “시작/끝 날짜 입력칸” */}
          <View style={styles.inputRow}>
            <Button
              title={startDate ? toKoreanDate(startDate) : 'YYYY.MM.DD'}
              variant="dark"
              onPress={onPickStart}
            />
            <View style={{ width: 10 }} />
            <Button
              title={endDate ? toKoreanDate(endDate) : 'YYYY.MM.DD'}
              variant="dark"
              onPress={onPickEnd}
            />
          </View>

          <View style={styles.searchBtnWrap}>
            <Button title="조회하기" onPress={onSearch} disabled={!canSearch} />
          </View>

          {!!(startDate || endDate) && (
            <View style={styles.resetWrap}>
              <Button title="초기화" variant="dark" onPress={onReset} />
            </View>
          )}
        </>
      )}

      {/* ---------- PICK START ---------- */}
      {step === 'pickStart' && (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>시작 날짜 선택</Text>
            <Text style={styles.subTitle}>원하는 시작 날짜를 선택하세요.</Text>
          </View>

          <Calendar events={[]} onSelectDate={onSelectStart} />

          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>
              선택: {startDate ? toKoreanDate(startDate) : '-'}
            </Text>
          </View>
        </>
      )}

      {/* ---------- PICK END ---------- */}
      {step === 'pickEnd' && (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>끝 날짜 선택</Text>
            <Text style={styles.subTitle}>원하는 끝 날짜를 선택하세요.</Text>
          </View>

          <Calendar events={[]} onSelectDate={onSelectEnd} />

          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>
              선택: {endDate ? toKoreanDate(endDate) : '-'}
            </Text>
          </View>
        </>
      )}

      {/* ---------- RESULT ---------- */}
      {step === 'result' && (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>기간별 조회</Text>
            <Text style={styles.subTitle}>
              {toKoreanDate(start)} - {toKoreanDate(end)}
            </Text>
          </View>

          <View style={styles.summaryBox}>
            <Row label="섭취한 카페인" value={`${summary.caffeineMg}mg`} />
            <Row label="섭취한 당류" value={`${summary.sugarG}g`} />
            <Row label="마신 음료" value={`${summary.count}잔`} />
          </View>

          {resultDrinks.length > 0 ? (
            <View style={styles.listBox}>
              {resultDrinks.map((d) => (
                <View key={d.id} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{d.menuName}</Text>
                    <Text style={styles.itemSub}>{d.optionText}</Text>
                    <View style={styles.pillRow}>
                      <Pill label="카페인" value={`${d.caffeineMg}mg`} />
                      <Pill label="당류" value={`${d.sugarG}g`} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>조회된 음료가 없습니다.</Text>
              <Text style={styles.emptySub}>해당 기간에는 기록이 없어요.</Text>
            </View>
          )}

          <View style={styles.searchBtnWrap}>
            <Button title="다시 조회하기" variant="dark" onPress={onReset} />
          </View>
        </>
      )}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>
        {label} {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  header: {
    marginBottom: 10,
  },

  title: {
    color: colors.grayscale[100],
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
  },

  subTitle: {
    marginTop: 8,
    color: colors.grayscale[600],
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
  },

  inputRow: {
    flexDirection: 'row',
    marginTop: 14,
  },

  searchBtnWrap: {
    marginTop: 14,
  },

  resetWrap: {
    marginTop: 10,
  },

  footerInfo: {
    marginTop: 12,
    alignItems: 'center',
  },

  footerText: {
    color: colors.grayscale[600],
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
  },

  summaryBox: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: colors.grayscale[900],
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  rowLabel: {
    color: colors.grayscale[600],
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
  },

  rowValue: {
    color: colors.primary[500],
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
  },

  listBox: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: colors.grayscale[900],
    overflow: 'hidden',
  },

  itemRow: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayscale[900],
  },

  itemTitle: {
    color: colors.grayscale[100],
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },

  itemSub: {
    marginTop: 6,
    color: colors.grayscale[600],
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
  },

  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },

  pill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: colors.grayscale[900],
  },

  pillText: {
    color: colors.grayscale[100],
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
  },

  emptyBox: {
    marginTop: 24,
    alignItems: 'center',
  },

  emptyText: {
    color: colors.grayscale[100],
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    textAlign: 'center',
  },

  emptySub: {
    marginTop: 10,
    color: colors.grayscale[600],
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    textAlign: 'center',
  },
});
