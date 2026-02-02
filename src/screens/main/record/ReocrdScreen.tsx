import { FlatList, StyleSheet, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SearchField from '../../../components/common/SearchField';
import List from '../../../components/common/List';
import { RootStackParamList } from '../../../types/navigation';
import { useState } from 'react';
import { colors } from '../../../constants/colors';

type RecordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Record'>;

const RecordScreen = () => {
  const navigation = useNavigation<RecordScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');

  // 카페 목록 데이터(추후에 삭제 예정임다)
  const cafeList = [
    { id: '1', name: '스타벅스' },
    { id: '2', name: '메가커피' },
    { id: '3', name: '투썸플레이스' },
    { id: '4', name: '이디야' },
    { id: '5', name: '컴포즈커피' },
    { id: '6', name: '빽다방' },
    { id: '7', name: '파스쿠찌' },
    { id: '8', name: '할리스' },
    { id: '9', name: '메머드커피' },
  ];

  const handleBrandPress = (brandId: string, brandName: string) => {
    navigation.navigate('RecordDetail', { brandId, brandName });
  };


  const filteredCafeList = cafeList.filter((cafe) =>
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
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
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