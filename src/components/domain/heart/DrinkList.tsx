import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import List from '../../common/List';
import SectionHeader from './SectionHeader';
import EmptyState from './EmptyState';
import { useFavoriteMenus } from '../../../hooks/useFavoriteMenus';

interface DrinkListProps {
  selectedBrands: Set<string>;
}

export default function DrinkList({ selectedBrands }: DrinkListProps) {
  const { favorites, isFavorite, toggleFavorite } = useFavoriteMenus();
  const isAllSelected = selectedBrands.size === 0 || selectedBrands.has('all');

  const filteredFavorites = useMemo(() => {
    if (isAllSelected) return favorites;
    return favorites.filter((menu) => selectedBrands.has(String(menu.brandId)));
  }, [favorites, isAllSelected, selectedBrands]);

  const sections = useMemo(() => {
    const map = new Map<number, { brandName: string; items: typeof filteredFavorites }>();
    filteredFavorites.forEach((menu) => {
      const existing = map.get(menu.brandId);
      if (existing) {
        existing.items.push(menu);
      } else {
        map.set(menu.brandId, { brandName: menu.brandName, items: [menu] });
      }
    });
    return [...map.entries()].map(([brandId, data]) => ({
      id: String(brandId),
      brandName: data.brandName,
      items: data.items,
    }));
  }, [filteredFavorites]);

  if (sections.length === 0) {
    return <EmptyState message="즐겨찾기한 음료가 없어요." />;
  }

  return (
    <ScrollView style={styles.listContainer}>
      {sections.map((section) => (
        <View key={section.id}>
          <SectionHeader title={section.brandName} />
          {section.items.map((item) => (
            <List
              key={`${section.id}-${item.id}`}
              title={item.name}
              liked={isFavorite(item.id)}
              onToggle={(nextLiked) => toggleFavorite(item, nextLiked)}
            />
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
