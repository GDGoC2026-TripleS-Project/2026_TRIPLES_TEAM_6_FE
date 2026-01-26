import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import GoalField from './src/components/common/GoalField';

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
      <GoalField
  brandName="브랜드이름"
  menuName="메뉴이름"
  rows={[
    { label: "카페인", valueText: "150mg", hintText: "에스프레소 약 2잔", emphasized: true },
    { label: "당류", valueText: "3g", hintText: "각설탕 약 1개", emphasized: true },
    { label: "칼로리", valueText: "0kcal" },
    { label: "나트륨", valueText: "60mg" },
    { label: "단백질", valueText: "0g" },
    { label: "지방", valueText: "0g" },
  ]}
  onEdit={() => console.log("edit")}
  onDelete={() => console.log("delete")}
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