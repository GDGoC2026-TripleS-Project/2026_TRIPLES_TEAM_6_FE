import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';

import CalendarScreen from './src/screens/main/CalendarScreen';
import PeriodSearchScreen from './src/screens/main/PeriodSearchScreen';

export type RootStackParamList = {
  Calendar: undefined;
  PeriodSearch: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [loaded] = useFonts({
    'Pretendard-Regular': require('./assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('./assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('./assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('./assets/fonts/Pretendard-Bold.otf'),
  });

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={DarkTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0B0B0B' },
          }}
        >
          <Stack.Screen name="Calendar" component={CalendarScreen} />
          <Stack.Screen name="PeriodSearch" component={PeriodSearchScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
