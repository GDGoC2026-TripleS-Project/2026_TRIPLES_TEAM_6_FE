import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import List from '../../common/List';
import EmptyState from './EmptyState';
import { MOCK_BRANDS } from '../../../constants/heartData';

export default function BrandList() {
  if (MOCK_BRANDS.length === 0) {
    return <EmptyState message="즐겨찾기한 브랜드가 없어요." />;
  }

  return (
    <ScrollView style={styles.listContainer}>
      {MOCK_BRANDS.map((brand) => (
        <List key={brand.id} title={brand.name} />
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