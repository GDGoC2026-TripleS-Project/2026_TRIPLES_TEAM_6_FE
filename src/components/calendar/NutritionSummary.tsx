import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface NutritionSummaryProps {
  drinks: Array<{ caffeineMg: number; sugarG: number }>;
  caffeineMax?: number;
  sugarMax?: number;
}

const ESPRESSO_MG = 75;
const SUGAR_CUBE_G = 3;

const formatUnits = (value: number) => String(Math.round(value));

export default function NutritionSummary({
  drinks,
  caffeineMax = 400,
  sugarMax = 25,
}: NutritionSummaryProps) {
  const totalCaffeine = drinks.reduce((sum, d) => sum + d.caffeineMg, 0);
  const totalSugar = drinks.reduce((sum, d) => sum + d.sugarG, 0);

  const caffeinePercent = Math.min((totalCaffeine / caffeineMax) * 100, 100);
  const sugarPercent = Math.min((totalSugar / sugarMax) * 100, 100);

  const isCaffeineOver = totalCaffeine > caffeineMax;
  const isSugarOver = totalSugar > sugarMax;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.label}>
            카페인{' '}
            <Text style={styles.amountText}>{totalCaffeine}mg</Text>
          </Text>
          <View style={[styles.warningBadge, !isCaffeineOver && styles.hidden]}>
            <Text style={styles.warningIcon}>!</Text>
          </View>
        </View>
        <Text style={styles.maxText}>
          에스프레소 {formatUnits(totalCaffeine / ESPRESSO_MG)}/
          {formatUnits(caffeineMax / ESPRESSO_MG)}잔
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${caffeinePercent}%`,
                backgroundColor: isCaffeineOver ? '#FF0000' : colors.grayscale[100],
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.label}>
            당류{' '}
            <Text style={styles.amountText}>{totalSugar}g</Text>
          </Text>
          <View style={[styles.warningBadge, !isSugarOver && styles.hidden]}>
            <Text style={styles.warningIcon}>!</Text>
          </View>
        </View>
        <Text style={styles.maxText}>
          각설탕 {formatUnits(totalSugar / SUGAR_CUBE_G)}/
          {formatUnits(sugarMax / SUGAR_CUBE_G)}개
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${sugarPercent}%`,
                backgroundColor: isSugarOver ? '#FF0000' : colors.primary[500],
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginHorizontal: 4,
  },
  card: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
    borderRadius: 9,
    borderColor: colors.grayscale[700],
    borderWidth: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 22, 
    marginBottom: 3,
  },
  label: {
    color: colors.grayscale[100],
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    lineHeight: 22, 
  },
  amountText: {
    color: colors.primary[500],
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
  },
  warningBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#222527',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  hidden: {
    opacity: 0,
  },
  warningIcon: {
    color: '#FF0000',
    fontSize: 13,
    fontFamily: 'Pretendard-Bold',
  },
  maxText: {
    color: colors.grayscale[600],
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    lineHeight: 16, 
    marginBottom: 8,
    marginTop: 3,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.grayscale[800],
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});