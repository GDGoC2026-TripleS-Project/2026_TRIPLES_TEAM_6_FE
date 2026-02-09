import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, Text, ScrollView } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SearchField from '../../../components/common/SearchField';
import List from '../../../components/common/List';
import { colors } from '../../../constants/colors';
import Chip from '../../../components/common/Chip';
import { RootStackParamList } from '../../../types/navigation';
import { useBrandMenus } from '../../../hooks/useBrandMenus';
import { fetchBrandMenus } from '../../../api/record/menu.api';
import { useFavoriteMenus } from '../../../hooks/useFavoriteMenus';

type RecordDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RecordDetail'>;
type RecordDetailRouteProp = RouteProp<RootStackParamList, 'RecordDetail'>;

const API_CATEGORY_LABELS: Record<string, string> = {
  COFFEE: '커피',
  NON_COFFEE: '논커피',
  ADE: '에이드',
  SMOOTHIE: '스무디',
  TEA: '티',
};

const CATEGORY_ORDER = ['COFFEE', 'NON_COFFEE', 'ADE', 'SMOOTHIE', 'TEA'];

const RecordDetailScreen = () => {
  const navigation = useNavigation<RecordDetailNavigationProp>();
  const route = useRoute<RecordDetailRouteProp>();
  const { brandId, brandName, selectedDate } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { isFavorite, toggleFavorite } = useFavoriteMenus();
  const [categories, setCategories] = useState<string[]>([]);

  const apiCategory = useMemo(() => {
    if (selectedCategory === 'all') return undefined;
    return selectedCategory;
  }, [selectedCategory]);
  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const res = await fetchBrandMenus(brandId, { page: 0, size: 200 });
        if (!isMounted) return;
        if (res.success && res.data) {
          const uniq = new Set<string>();
          res.data.content.forEach((menu) => {
            if (menu.category) uniq.add(menu.category);
          });
          setCategories(Array.from(uniq));
        } else {
          setCategories([]);
        }
      } catch {
        if (!isMounted) return;
        setCategories([]);
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, [brandId]);

  const categoryOptions = useMemo(() => {
    const ordered = [...categories].sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      const aRank = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
      const bRank = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
      if (aRank !== bRank) return aRank - bRank;
      return (API_CATEGORY_LABELS[a] ?? a).localeCompare(API_CATEGORY_LABELS[b] ?? b);
    });

    return [
      { id: 'all', label: 'ALL' },
      ...ordered.map((cat) => ({
        id: cat,
        label: API_CATEGORY_LABELS[cat] ?? cat,
      })),
    ];
  }, [categories]);

  const { menus, isLoading, error: loadError } = useBrandMenus({
    brandId,
    category: apiCategory,
    keyword: searchQuery,
    page: 0,
    size: 50,
    debounceMs: 250,
  });

  const handleDrinkPress = (drinkId: number, drinkName: string) => {
    navigation.navigate('RecordDrinkDetail', {
      drinkId: String(drinkId),
      drinkName,
      selectedDate,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <SearchField 
            placeholder="음료 검색" 
            variant="animated"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {categoryOptions.map((category) => (
            <Chip
              key={category.id}
              groupId="category"
              id={category.id}
              label={category.label}
              selected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={menus}
          renderItem={({ item }) => (
            <List 
              title={item.name}
              liked={isFavorite(item.id)}
              onToggle={(nextLiked) =>
                toggleFavorite(
                  {
                    id: item.id,
                    name: item.name,
                    brandId: Number(brandId),
                    brandName,
                    imageUrl: item.imageUrl,
                    category: item.category,
                  },
                  nextLiked
                )
              }
              onPress={() => handleDrinkPress(item.id, item.name)}
            />
          )}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isLoading
                  ? '불러오는 중...'
                  : loadError
                  ? loadError
                  : '검색 결과가 없습니다.'}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterSection: {
    paddingVertical: 16,
  },
  scrollContent: {
    gap: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
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

export default RecordDetailScreen;
