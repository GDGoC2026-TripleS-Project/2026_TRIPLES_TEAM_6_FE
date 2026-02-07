import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import List from '../../common/List';
import EmptyState from './EmptyState';
import { colors } from '../../../constants/colors';
import type { Brand } from '../../../api/record/brand.api';

export default function BrandList({
  brands,
  isLoading,
  error,
  onToggle,
}: {
  brands: Brand[];
  isLoading: boolean;
  error: string | null;
  onToggle: (brandId: number, nextLiked: boolean) => void;
}) {

  if (brands.length === 0 && !isLoading && !error) {
    return <EmptyState message="즐겨찾기한 브랜드가 없어요." />;
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.listContainer}>
      {brands.map((brand) => (
        <List
          key={brand.id}
          title={brand.name}
          liked={brand.isFavorite}
          onToggle={(nextLiked) => onToggle(brand.id, nextLiked)}
        />
      ))}
      {isLoading && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>불러오는 중...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    width: '100%',
  },
  emptyContainer: {
    paddingTop: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.grayscale[500],
    fontFamily: 'Pretendard-SemiBold',
  },
});
