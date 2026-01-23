import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ToggleSwitch from './src/components/ToggleSwitch';

export default function App() {
  const [isOn, setIsOn] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ToggleSwitch value={isOn} onValueChange={setIsOn} />
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
