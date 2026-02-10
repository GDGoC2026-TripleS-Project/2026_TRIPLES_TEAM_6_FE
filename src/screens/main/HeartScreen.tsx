import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { MainTabParamList } from '../../types/navigation';
import Tab from '../../components/common/Tab';
import { colors } from '../../constants/colors';
import { useOptionGroup } from '../../hooks/useOptionGroup';
import { TabType } from '../../types/heart';
import { TABS } from '../../constants/heartData';
import DrinkList from '../../components/domain/heart/DrinkList';
import BrandList from '../../components/domain/heart/BrandsList';
import BrandChips from '../../components/domain/heart/ButtonChips';
import {
  addBrandFavorite,
  deleteBrandFavorite,
} from '../../api/record/brand.api';
import { useBrands } from '../../hooks/useBrands';

export default function HeartScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList, 'Heart'>>();
  const [activeTab, setActiveTab] = useState<TabType>('drink');
  const { chipSelected } = useOptionGroup('brand');
  const {
    brands: allBrands,
    setBrands: setAllBrands,
    isLoading: isBrandsLoading,
    error: brandsError,
  } = useBrands({ favoritesOnly: false, focusRefresh: true });

  const favoriteBrands = useMemo(
    () => allBrands.filter((brand) => brand.isFavorite),
    [allBrands]
  );

  const handleFavoriteToggle = useCallback(
    async (brandId: number, nextLiked: boolean) => {
      setAllBrands((prev) =>
        prev.map((brand) =>
          brand.id === brandId ? { ...brand, isFavorite: nextLiked } : brand
        )
      );

      try {
        const res = nextLiked
          ? await addBrandFavorite(brandId)
          : await deleteBrandFavorite(brandId);

        if (!res.success) {
          throw new Error(res.error?.message ?? '즐겨찾기 처리에 실패했어요.');
        }

      } catch (err) {
        if (__DEV__) console.log('[API ERR] /brands/:id/favorites', err);
        setAllBrands((prev) =>
          prev.map((brand) =>
            brand.id === brandId ? { ...brand, isFavorite: !nextLiked } : brand
          )
        );
      }
    },
    [setAllBrands]
  );

  return (
    <View style={styles.container}>
      <Tab
        tabs={TABS}
        value={activeTab}
        onChange={(k) => setActiveTab(k as TabType)}
      />

      {activeTab === 'drink' && (
        <BrandChips
          brands={allBrands}
          isLoading={isBrandsLoading}
          error={brandsError}
        />
      )}

      <View style={styles.content}>
        {activeTab === 'drink' ? (
          <DrinkList selectedBrands={chipSelected} />
        ) : (
          <BrandList
            brands={favoriteBrands}
            isLoading={isBrandsLoading}
            error={brandsError}
            onToggle={handleFavoriteToggle}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
  },
  content: {
    flex: 1,
  },
});
