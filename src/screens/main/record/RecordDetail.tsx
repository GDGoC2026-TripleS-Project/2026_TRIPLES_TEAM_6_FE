import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, Text, ScrollView } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SearchField from '../../../components/common/SearchField';
import List from '../../../components/common/List';
import { colors } from '../../../constants/colors';
import Chip from '../../../components/common/Chip';
import { RootStackParamList } from '../../../types/navigation';
import { useBrandMenus } from '../../../hooks/useBrandMenus';
import { useFavoriteMenus } from '../../../hooks/useFavoriteMenus';

type RecordDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RecordDetail'>;
type RecordDetailRouteProp = RouteProp<RootStackParamList, 'RecordDetail'>;

const CATEGORIES = [
  { id: 'all', label: 'ALL' },
  { id: 'espresso', label: '에스프레소' },
  { id: 'frappuccino', label: '프라푸치노' },
  { id: 'refresher', label: '리프레셔' },
  { id: 'tea', label: '티' },
];

const CATEGORY_TO_API: Record<string, string> = {
  espresso: 'COFFEE',
  frappuccino: 'FRAPPUCCINO',
  refresher: 'REFRESHER',
  tea: 'TEA',
};

const RecordDetailScreen = () => {
  const navigation = useNavigation<RecordDetailNavigationProp>();
  const route = useRoute<RecordDetailRouteProp>();
  const { brandId, brandName } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { isFavorite, toggleFavorite } = useFavoriteMenus();
  const apiCategory = useMemo(() => {
    if (selectedCategory === 'all') return undefined;
    return CATEGORY_TO_API[selectedCategory] ?? selectedCategory;
  }, [selectedCategory]);

  const { menus, isLoading, error: loadError } = useBrandMenus({
    brandId,
    category: apiCategory,
    keyword: searchQuery,
    page: 0,
    size: 50,
    debounceMs: 250,
  });

  const handleDrinkPress = (drinkId: number, drinkName: string) => {
    navigation.navigate('RecordDrinkDetail', { drinkId: String(drinkId), drinkName });
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
          {CATEGORIES.map((category) => (
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
