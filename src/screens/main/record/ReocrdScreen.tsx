import { FlatList, StyleSheet, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SearchField from '../../../components/common/SearchField';
import List from '../../../components/common/List';
import { RootStackParamList } from '../../../types/navigation';
import { useEffect, useRef, useState } from 'react';
import { colors } from '../../../constants/colors';
import { fetchBrands, type Brand } from '../../../api/record/brand.api';

type RecordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Record'>;

const RecordScreen = () => {
  const navigation = useNavigation<RecordScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');

  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
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
          setBrands(res.data);
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
