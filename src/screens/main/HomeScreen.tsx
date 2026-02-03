import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { MainTabParamList } from '../../types/navigation';
import Chart from '../../components/common/Chart';

export default function HomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList, 'Home'>>();

  return (
    <View style={styles.container}>
      <Chart />
      <Chart title='당류'/>
    </View>
  );
} 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#000',
    padding: 16
  },
  text: {
    fontSize: 24,
    color: '#fff',
  },
});