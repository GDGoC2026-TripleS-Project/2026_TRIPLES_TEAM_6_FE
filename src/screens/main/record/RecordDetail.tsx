import { useState } from 'react';
import { FlatList, StyleSheet, View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SearchField from '../../../components/common/SearchField';
import List from '../../../components/common/List';
import { colors } from '../../../constants/colors';
import Chip from '../../../components/common/Chip';
import { RootStackParamList } from '../../../types/navigation';

type RecordDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RecordDetail'>;

const CATEGORIES = [
  { id: 'all', label: 'ALL' },
  { id: 'espresso', label: '에스프레소' },
  { id: 'frappuccino', label: '프라푸치노' },
  { id: 'refresher', label: '리프레셔' },
  { id: 'tea', label: '티' },
];

const DRINK_LIST = [
  { id: '1', name: '에스프레소콘파냐', category: 'espresso' },
  { id: '2', name: '아메리카노', category: 'espresso' },
  { id: '3', name: '카페라떼', category: 'espresso' },
  { id: '4', name: '카푸치노', category: 'espresso' },
  { id: '5', name: '카라멜마끼아또', category: 'espresso' },
  { id: '6', name: '바닐라라떼', category: 'espresso' },
  { id: '7', name: '돌체라떼', category: 'espresso' },
  { id: '8', name: '카페모카', category: 'espresso' },
  { id: '9', name: '화이트모카', category: 'espresso' },
];

const RecordDetailScreen = () => {
  const navigation = useNavigation<RecordDetailNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredCafeList = DRINK_LIST.filter((cafe) =>
    cafe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDrinkPress = (drinkId: string, drinkName: string) => {
    navigation.navigate('RecordDrinkDetail', { drinkId, drinkName });
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
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={filteredCafeList}
          renderItem={({ item }) => (
            <List 
              title={item.name}
              onPress={() => handleDrinkPress(item.id, item.name)}
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
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.grayscale[500],
    fontFamily: 'Pretendard-SemiBold',
  },
});

export default RecordDetailScreen;