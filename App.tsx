import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RootNavigator from './src/navigation/RootStack';
import LoginScreen from './src/screens/main/sign/LoginScreen';
import OnBoardingScreen from './src/screens/main/onBoarding/OnBoardingScreen';
import { useAuthStore } from './src/app/features/auth/auth.store';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isHydrating, setIsHydrating] = useState(true);
  const hydrate = useAuthStore((s) => s.hydrate);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [loaded] = useFonts({
    'Pretendard-Regular': require('./assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('./assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('./assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('./assets/fonts/Pretendard-Bold.otf'),
  });

  useEffect(() => {
    let isMounted = true;
    hydrate().finally(() => {
      if (isMounted) setIsHydrating(false);
    });
    return () => {
      isMounted = false;
    };
  }, [hydrate]);

  if (!loaded || isHydrating) return null;

  return (
    <SafeAreaView style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator
          key={accessToken ? 'app' : 'auth'}
          screenOptions={{ headerShown: false }}
        >
          {accessToken ? (
            <>
              <Stack.Screen name="Onboarding" component={OnBoardingScreen} />
              <Stack.Screen name="Main" component={RootNavigator} />
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
    paddingTop: 0,
  },
});
