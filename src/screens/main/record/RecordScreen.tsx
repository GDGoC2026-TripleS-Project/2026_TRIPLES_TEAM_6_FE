import { FlatList, StyleSheet, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SearchField from '../../../components/common/SearchField';
import List from '../../../components/common/List';
import { RootStackParamList } from '../../../types/navigation';
import { useEffect, useRef, useState } from 'react';
import { colors } from '../../../constants/colors';
import {
  addBrandFavorite,
  fetchBrands,
  removeBrandFavorite,
  type Brand,
} from '../../../api/record/brand.api';

type RecordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Record'>;

const sortBrands = (items: Brand[]) =>
  [...items].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) {
      return Number(b.isFavorite) - Number(a.isFavorite);
    }
    return a.name.localeCompare(b.name);
  });

const RecordScreen = () => {
  const navigation = useNavigation<RecordScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');

  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [favoritePendingIds, setFavoritePendingIds] = useState<Record<number, boolean>>({});
  const didFetch = useRef(false);

  const handleBrandPress = (brandId: number, brandName: string) => {
    navigation.navigate('RecordDetail', { brandId: String(brandId), brandName });
  };

  useEffect(() => {
    if (__DEV__ && didFetch.current) return;
    didFetch.current = true;
    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);
    fetchBrands()
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setBrands(sortBrands(res.data));
        } else {
          setLoadError(res.error?.message ?? '브랜드를 불러오지 못했어요.');
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setLoadError('브랜드를 불러오지 못했어요.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleFavorite = async (brandId: number, nextLiked: boolean) => {
    if (favoritePendingIds[brandId]) return;

    setFavoritePendingIds((prev) => ({ ...prev, [brandId]: true }));
    setBrands((prev) =>
      sortBrands(prev.map((b) => (b.id === brandId ? { ...b, isFavorite: nextLiked } : b)))
    );

    try {
      if (nextLiked) {
        const res = await addBrandFavorite(brandId);
        if (!res.success) throw new Error(res.error?.message);
      } else {
        const res = await removeBrandFavorite(brandId);
        if (!res.success) throw new Error(res.error?.message);
      }
    } catch {
      setBrands((prev) =>
        sortBrands(prev.map((b) => (b.id === brandId ? { ...b, isFavorite: !nextLiked } : b)))
      );
    } finally {
      setFavoritePendingIds((prev) => {
        const next = { ...prev };
        delete next[brandId];
        return next;
      });
    }
  };

  const filteredCafeList = brands.filter((cafe) =>
    cafe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <View style={styles.container}>
      <View style={{ paddingVertical: 16 }}>
        <SearchField 
          placeholder="브랜드 검색" 
          variant="default" 
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <View style={styles.listContainer}>
        <FlatList
          data={filteredCafeList}
          renderItem={({ item }) => (
            <List
              title={item.name}
              liked={item.isFavorite}
              onToggleLike={(next) => handleToggleFavorite(item.id, next)}
              toggleDisabled={Boolean(favoritePendingIds[item.id])}
              onPress={() => handleBrandPress(item.id, item.name)}
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'column',
  },
  listContainer: {
    flex: 1,
    width: '100%',
  },
  listContent: {},
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

export default RecordScreen;
