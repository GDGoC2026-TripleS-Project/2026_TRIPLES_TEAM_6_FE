import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

interface DrinkCardProps {
  brandName: string;
  menuName: string;
  optionText?: string;
  caffeineMg: number;
  caffeineMax: number;
  sugarG: number;
  sugarMax: number;
  onPress?: () => void;
  onDelete?: () => void;
}

export default function DrinkCard({
  brandName,
  menuName,
  optionText,
  caffeineMg,
  caffeineMax,
  sugarG,
  sugarMax,
  onPress,
  onDelete,
}: DrinkCardProps) {
  const caffeinePercent = Math.min((caffeineMg / caffeineMax) * 100, 100);
  const sugarPercent = Math.min((sugarG / sugarMax) * 100, 100);

  const isOverCaffeine = caffeineMg > caffeineMax;
  const isOverSugar = sugarG > sugarMax;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.brandName}>{brandName}</Text>
          <Text style={styles.menuName}>{menuName}</Text>
          {optionText && <Text style={styles.optionText}>{optionText}</Text>}
        </View>
        {onDelete && (
          <Pressable
            onPress={onDelete}
            hitSlop={8}
            style={styles.deleteButton}
          >
            <Ionicons name="close-circle" size={24} color={colors.grayscale[500]} />
          </Pressable>
        )}
      </View>

      <View style={styles.nutritionRow}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>카페인</Text>
          <Text style={[styles.value, isOverCaffeine && styles.valueOver]}>
            {caffeineMg}mg
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${caffeinePercent}%` },
              isOverCaffeine && styles.progressFillOver,
            ]}
          />
        </View>
        <Text style={styles.maxText}>설정 0/{caffeineMax}잔</Text>
      </View>

      <View style={styles.nutritionRow}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>당류</Text>
          <Text style={[styles.value, isOverSugar && styles.valueOver]}>
            {sugarG}g
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${sugarPercent}%` },
              isOverSugar && styles.progressFillOver,
            ]}
          />
        </View>
        <Text style={styles.maxText}>설정 0/{sugarMax}잔</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.grayscale[900],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  containerPressed: {
    backgroundColor: colors.grayscale[800],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
  },
  brandName: {
    color: colors.grayscale[400],
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    marginBottom: 4,
  },
  menuName: {
    color: colors.grayscale[100],
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 4,
  },
  optionText: {
    color: colors.grayscale[500],
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
  },
  deleteButton: {
    padding: 4,
  },
  nutritionRow: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    color: colors.grayscale[100],
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
  },
  value: {
    color: colors.primary[500],
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
  },
  valueOver: {
    color: colors.grayscale[500],
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
    backgroundColor: colors.primary[500],
    borderRadius: 3,
  },
  progressFillOver: {
    backgroundColor: colors.grayscale[500],
  },
  maxText: {
    color: colors.grayscale[600],
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
  },
});