import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import List from '../../common/List';
import SectionHeader from './SectionHeader';
import EmptyState from './EmptyState';
import { BRANDS, MOCK_DRINKS } from '../../../constants/heartData';

interface DrinkListProps {
  selectedBrands: Set<string>;
}

export default function DrinkList({ selectedBrands }: DrinkListProps) {
  const isAllSelected = selectedBrands.size === 0 || selectedBrands.has('all');

  const filteredDrinks = isAllSelected
    ? MOCK_DRINKS
    : MOCK_DRINKS.filter((section) =>
        [...selectedBrands].some(
          (brandId) => section.brand === BRANDS.find((b) => b.id === brandId)?.label
        )
      );

  if (filteredDrinks.length === 0) {
    return <EmptyState message="즐겨찾기한 음료가 없어요." />;
  }

  return (
    <ScrollView style={styles.listContainer}>
      {filteredDrinks.map((section) => (
        <View key={section.id}>
          <SectionHeader title={section.brand} />
          {section.items.map((item, index) => (
            <List key={`${section.id}-${index}`} title={item} />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    width: '100%',
  },
});