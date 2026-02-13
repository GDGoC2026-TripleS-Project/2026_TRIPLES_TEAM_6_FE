import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface NutritionSummaryProps {
  drinks: Array<{ caffeineMg: number; sugarG: number }>;
  totalCaffeineMg?: number;
  totalSugarG?: number;
  totalEspressoShotCount?: number;
  totalSugarCubeCount?: number;
  caffeineMax?: number;
  sugarMax?: number;
}

const ESPRESSO_MG = 75;
const SUGAR_CUBE_G = 3;

const formatUnits = (value: number) => String(Math.round(value));

export default function NutritionSummary({
  drinks,
  totalCaffeineMg,
  totalSugarG,
  totalEspressoShotCount,
  totalSugarCubeCount,
  caffeineMax,
  sugarMax,
}: NutritionSummaryProps) {
  const totalCaffeine =
    typeof totalCaffeineMg === 'number'
      ? totalCaffeineMg
      : drinks.reduce((sum, d) => sum + d.caffeineMg, 0);
  const totalSugar =
    typeof totalSugarG === 'number'
      ? totalSugarG
      : drinks.reduce((sum, d) => sum + d.sugarG, 0);

  const hasCaffeineMax = typeof caffeineMax === 'number' && caffeineMax > 0;
  const hasSugarMax = typeof sugarMax === 'number' && sugarMax > 0;

  const caffeinePercent = hasCaffeineMax
    ? Math.min((totalCaffeine / caffeineMax) * 100, 100)
    : 0;
  const sugarPercent = hasSugarMax
    ? Math.min((totalSugar / sugarMax) * 100, 100)
    : 0;

  const isCaffeineOver = hasCaffeineMax && totalCaffeine > caffeineMax;
  const isSugarOver = hasSugarMax && totalSugar > sugarMax;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.label}>
            카페인{' '}
            <Text style={styles.amountText}>{totalCaffeine}mg</Text>
          </Text>
          {isCaffeineOver && (
            <View style={styles.warningBadge}>
              <Text style={styles.warningIcon}>!</Text>
            </View>
          )}
        </View>
        {hasCaffeineMax && typeof totalEspressoShotCount === 'number' &&(
          <Text style={styles.maxText}>
            에스프레소 {formatUnits(totalEspressoShotCount)}/
            {formatUnits(caffeineMax / ESPRESSO_MG)}잔
          </Text>
        )}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { 
                width: `${caffeinePercent}%`,
                backgroundColor: isCaffeineOver ? '#EF4444' : colors.primary[500]
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
          {isSugarOver && (
            <View style={styles.warningBadge}>
              <Text style={styles.warningIcon}>!</Text>
            </View>
          )}
        </View>
        {hasSugarMax && typeof totalSugarCubeCount === 'number' && (
          <Text style={styles.maxText}>
            각설탕 {formatUnits(totalSugarCubeCount)}/
            {formatUnits(sugarMax / SUGAR_CUBE_G)}개
          </Text>
        )}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { 
                width: `${sugarPercent}%`,
                backgroundColor: isSugarOver ? '#EF4444' : colors.primary[500]
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
    marginBottom: 6,
  },
  label: {
    color: colors.grayscale[100],
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
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
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningIcon: {
    color: colors.grayscale[1000],
    fontSize: 13,
    fontFamily: 'Pretendard-Bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.grayscale[800],
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  maxText: {
    color: colors.grayscale[600],
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    marginBottom: 8,
    marginTop: 3,
  },
});
