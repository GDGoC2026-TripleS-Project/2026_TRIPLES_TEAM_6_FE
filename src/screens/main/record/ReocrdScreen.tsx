import { FlatList, StyleSheet, View, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import SearchField from '../../../components/common/SearchField';
import List from '../../../components/common/List';
import { RootStackParamList } from '../../../types/navigation';
import { useState } from 'react';
import { colors } from '../../../constants/colors';
import {
  addBrandFavorite,
  deleteBrandFavorite,
  type Brand,
} from '../../../api/record/brand.api';
import { useBrands } from '../../../hooks/useBrands';

type RecordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Record'>;
type RecordScreenRouteProp = RouteProp<RootStackParamList, 'Record'>;

const RecordScreen = () => {
  const navigation = useNavigation<RecordScreenNavigationProp>();
  const route = useRoute<RecordScreenRouteProp>();
  const selectedDate = route.params?.selectedDate;
  const edit = route.params?.edit;
  const [searchQuery, setSearchQuery] = useState('');

  const { brands, setBrands, isLoading, error: loadError } = useBrands({ focusRefresh: true });

  const handleBrandPress = (brandId: number, brandName: string) => {
    navigation.navigate('RecordDetail', {
      brandId: String(brandId),
      brandName,
      isFavorite: brands.find((b) => b.id === brandId)?.isFavorite,
      selectedDate,
      edit,
    });
  };

  const handleFavoriteToggle = async (brandId: number, nextLiked: boolean) => {
    setBrands((prev) =>
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
      setBrands((prev) =>
        prev.map((brand) =>
          brand.id === brandId ? { ...brand, isFavorite: !nextLiked } : brand
        )
      );
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
              onPress={() => handleBrandPress(item.id, item.name)}
              onToggle={(nextLiked) => handleFavoriteToggle(item.id, nextLiked)}
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
