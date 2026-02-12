import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import Chip from '../../common/Chip';
import { colors } from '../../../constants/colors';
import type { Brand } from '../../../api/record/brand.api';
import { useOptionGroup } from '../../../hooks/useOptionGroup';

export default function BrandChips({
  brands,
  isLoading,
  error,
}: {
  brands: Brand[];
  isLoading: boolean;
  error: string | null;
}) {
  const { chipSelected, selectSingleChip } = useOptionGroup('brand');

  if (error) {
    return (
      <View style={styles.chipContainer}>
        <Text style={styles.infoText}>{error}</Text>
      </View>
    );
  }

  if (brands.length === 0 && !isLoading) {
    return null;
  }

  return (
    <View style={styles.chipContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {brands.map((brand) => (
          <Chip
            key={brand.id}
            id={String(brand.id)}
            label={brand.name}
            selected={chipSelected.has(String(brand.id))}
            onPress={() => selectSingleChip(String(brand.id))}
          />
        ))}
        {isLoading && (
          <Text style={styles.infoText}>불러오는 중...</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chipContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayscale[800],
  },
  scrollContent: {
    gap: 12,
    paddingHorizontal: 16,
  },
  infoText: {
    color: colors.grayscale[500],
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    alignSelf: 'center',
  },
});
