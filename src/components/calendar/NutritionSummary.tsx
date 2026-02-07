import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
interface NutritionSummaryProps {
  drinks: Array<{ caffeineMg: number; sugarG: number }>;
  caffeineMax?: number;
  sugarMax?: number;
}

export default function NutritionSummary({ 
  drinks,
  caffeineMax = 400,
  sugarMax = 25,
}: NutritionSummaryProps) {
  const totalCaffeine = drinks.reduce((sum, d) => sum + d.caffeineMg, 0);
  const totalSugar = drinks.reduce((sum, d) => sum + d.sugarG, 0);

  const caffeinePercent = Math.min((totalCaffeine / caffeineMax) * 100, 100);
  const sugarPercent = Math.min((totalSugar / sugarMax) * 100, 100);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>
          카페인{' '}
          <Text style={styles.amountText}>{totalCaffeine}mg</Text>
        </Text>
        <Text style={styles.maxText}>0/{caffeineMax}mg</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${caffeinePercent}%` }
            ]}
          />
        </View>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.label}>
          당류{' '}
          <Text style={styles.amountText}>{totalSugar}g</Text>
        </Text>
        <Text style={styles.maxText}>0/{sugarMax}g</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${sugarPercent}%` }
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
  label: {
    color: colors.grayscale[100],
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    marginBottom: 6,
  },
  amountText: {
    color: colors.primary[500],
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
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
    backgroundColor: colors.primary[500],
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
