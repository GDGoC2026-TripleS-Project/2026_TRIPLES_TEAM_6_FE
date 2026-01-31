import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import type { Drink } from '../../data/drinksData';

type Props = {
  drinks: Drink[];
};

export default function NutritionSummary({ drinks }: Props) {
  const { caffeineMg, sugarG } = useMemo(() => {
    const caffeine = drinks.reduce((sum, d) => sum + d.caffeineMg, 0);
    const sugar = drinks.reduce((sum, d) => sum + d.sugarG, 0);
    return { caffeineMg: caffeine, sugarG: sugar };
  }, [drinks]);

  return (
    <View style={styles.row}>
      <Chip label="카페인" value={`${caffeineMg}mg`} />
      <Chip label="당류" value={`${sugarG}g`} />
    </View>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    marginBottom: 10,
  },

  chip: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: colors.grayscale[900],
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  label: {
    color: colors.grayscale[600],
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
  },
  
  value: {
    color: colors.primary[500],
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
  },
});
