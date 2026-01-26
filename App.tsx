import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import MenuItemRow from './src/components/common/DrinkList';

export default function App() {

  const [loaded] = useFonts({
    'Pretendard-Regular': require('./assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('./assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('./assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('./assets/fonts/Pretendard-Bold.otf'),
  });

  if (!loaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <MenuItemRow
      brandName='스타벅스'
      menuName='자몽허니블랙티'
      optionText='Ice/Grande'
      pills={[
        { label: '카페인', value: 120, unit: 'mg' },
        { label: '당류', value: 18, unit: 'g' },
      ]}
      rightText='10잔'
      onPress={() => {
        console.log('Pressed');
      }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
});