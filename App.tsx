import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
<<<<<<< HEAD

import ProfileSettingScreen from './src/screens/mypage/ProfileSettingScreen';
=======
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import RootNavigator from './src/navigation/RootStack';
import { StatusBar } from 'expo-status-bar';
>>>>>>> origin/develop

export default function App() {
  const [loaded] = useFonts({
    'Pretendard-Regular': require('./assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('./assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('./assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('./assets/fonts/Pretendard-Bold.otf'),
  });

  if (!loaded) return null;

  return (
<<<<<<< HEAD
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <ProfileSettingScreen />
    </SafeAreaView>
=======
      <NavigationContainer>
        <StatusBar style='light'/>
        <RootNavigator />
      </NavigationContainer>
>>>>>>> origin/develop
  );
}
