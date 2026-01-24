import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import Tab from './src/components/common/Tab';

export default function App() {
  const [tab, setTab] = useState<'drink' | 'brand'>('drink');

  const [loaded] = useFonts({
    'Pretendard-Regular': require('./assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('./assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('./assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('./assets/fonts/Pretendard-Bold.otf'),
  });

  if (!loaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ width: '100%' }}>
        <Tab
          tabs={[
            { key: 'drink', label: '음료' },
            { key: 'brand', label: '브랜드' },
          ]}
          value={tab}
          onChange={(next) => setTab(next as 'drink' | 'brand')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
    paddingTop: 20,
  },
});
