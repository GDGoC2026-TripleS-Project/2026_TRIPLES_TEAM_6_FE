import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { MainTabParamList } from '../../navigation/AppNavigaor';

export default function HeartScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList, 'Heart'>>();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>하트 화면</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    fontSize: 24,
    color: '#fff',
  },
});