import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Chip from './src/components/Chip';

export default function App() {
  const [selected, setSelected] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Chip
        label="카테고리"
        variant={selected ? 'filled' : 'outlined'}
        onPress={() => setSelected((prev) => !prev)}
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
