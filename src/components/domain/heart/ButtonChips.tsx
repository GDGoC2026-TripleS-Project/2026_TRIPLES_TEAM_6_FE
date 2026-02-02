import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Chip from '../../common/Chip';
import { colors } from '../../../constants/colors';
import { BRANDS } from '../../../constants/heartData';

export default function BrandChips() {
  return (
    <View style={styles.chipContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {BRANDS.map((brand) => (
          <Chip
            key={brand.id}
            groupId="brand"
            id={brand.id}
            label={brand.label}
          />
        ))}
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
});