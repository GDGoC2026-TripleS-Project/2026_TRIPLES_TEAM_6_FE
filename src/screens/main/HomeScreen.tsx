import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { MainTabParamList } from '../../types/navigation';
import Chart from '../../components/common/Chart';
import { colors } from '../../constants/colors';
import MenuItemRow from '../../components/common/MenuItem';
import { useOptionStore } from '../../store/useOptionStore';
import { Svg, Path } from 'react-native-svg';

const ChevronLeft = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={'#6B7277'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ChevronRight = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M9 18L15 12L9 6" stroke={'#6B7277'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export default function HomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList, 'Home'>>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const getGroupsByDate = useOptionStore(state => state.getGroupsByDate);
  const getDailyStats = useOptionStore(state => state.getDailyStats);
  
  const todayGroups = getGroupsByDate(selectedDate);
  const stats = getDailyStats(selectedDate);

  const formatDateHeader = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.dateHeader}>
        <TouchableOpacity onPress={handlePrevDay} style={styles.arrowButton}>
          <ChevronLeft />
        </TouchableOpacity>
        <Text style={styles.dateText}>{formatDateHeader(selectedDate)}</Text>
        <TouchableOpacity onPress={handleNextDay} style={styles.arrowButton}>
          <ChevronRight />
        </TouchableOpacity>
      </View>

      <View style={styles.chartContainer}>
        <Chart 
          title="카페인"
          currentIntake={stats.caffeine}
          dailyLimit={400}
          unit="mg"
        />
        <Chart 
          title="당류"
          currentIntake={stats.sugar}
          dailyLimit={25}
          unit="g"
        />
      </View>

      <View style={styles.drinkSection}>
        <View style={styles.drinkHeader}>
          <Text style={styles.title}>오늘 마신 음료</Text>
          <Text style={styles.countTitle}>{stats.count}잔</Text>
        </View>
        <View>
          {todayGroups.map((groupData, index) => {
            const optionText = `${groupData.temperature === 'hot' ? 'Hot' : 'Ice'} | ${groupData.size}`;

            return (
              <MenuItemRow 
                key={`drink_${index}`}
                brandName={groupData.brandName}
                menuName={groupData.menuName}
                optionText={optionText}
                pills={[
                  { label: '카페인', value: groupData.caffeine || 0, unit: 'mg' },
                  { label: '당류', value: groupData.sugar || 0, unit: 'g' },
                ]}
              />
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
} 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    gap: 20,
    paddingTop: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 26,
    
  },
  arrowButton: {
    padding: 8,
  },
  dateText: {
    fontSize: 16,
    color: colors.grayscale[100],
    fontFamily: 'Pretendard-Bold',
    textAlign: 'center',
  },
  chartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 20
  },
  drinkSection: {
    flex: 1,
  },
  drinkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    color: colors.grayscale[100],
    fontFamily: 'Pretendard-Semibold'
  },
  countTitle: {
    fontSize: 14,
    color: colors.primary[500],
    fontFamily: 'Pretendard-Semibold'
  }
});