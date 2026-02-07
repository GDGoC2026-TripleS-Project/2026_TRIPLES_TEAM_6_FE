import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RootNavigator from './src/navigation/RootStack';
import LoginScreen from './src/screens/main/sign/LoginScreen';
import OnBoardingScreen from './src/screens/main/onBoarding/OnBoardingScreen';
import SignUpScreen from './src/screens/main/sign/SignUpScreen';
import FindPasswordScreen from './src/screens/main/sign/FindPasswordScreen';
import TermsScreen from './src/screens/main/sign/TermsScreen';
import { useAuthStore } from './src/app/features/auth/auth.store';
import { storage } from './src/utils/storage';
import { storageKeys } from './src/constants/storageKeys';
import { colors } from './src/constants/colors';

const Stack = createNativeStackNavigator();
const FORCE_ONBOARDING_PREVIEW = false; 

export default function App() {
  const [isHydrating, setIsHydrating] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);
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
    (async () => {
      try {
        const [, done] = await Promise.all([
          hydrate(),
          storage.get(storageKeys.onboardingDone),
        ]);
        if (isMounted) setOnboardingDone(done === 'true');
      } finally {
        if (isMounted) setIsHydrating(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [hydrate]);

  if (!loaded || isHydrating) return null;
  const shouldBypassAuth = FORCE_ONBOARDING_PREVIEW;
  const showAppFlow = Boolean(accessToken) || shouldBypassAuth;
  const initialRouteName = showAppFlow
    ? (shouldBypassAuth ? 'OnBoardingScreen' : (onboardingDone ? 'Main' : 'OnBoardingScreen'))
    : 'Login';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          key={showAppFlow ? 'app' : 'auth'}
          initialRouteName={initialRouteName}
          screenOptions={{ headerShown: false }}
        >
          {showAppFlow ? (
            <>
              <Stack.Screen name="OnBoardingScreen" component={OnBoardingScreen} />
              <Stack.Screen name="Main" component={RootNavigator} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen
                name="SignUpScreen"
                component={SignUpScreen}
                options={{
                  headerShown: true,
                  title: '회원가입',
                  headerTitleAlign: 'center',
                  headerStyle: { backgroundColor: colors.grayscale[1000] },
                  headerShadowVisible: false,
                  headerTintColor: '#FFFFFF',
                  headerTitleStyle: {
                    fontSize: 16,
                    fontFamily: 'Pretendard-SemiBold',
                  },
                  headerBackButtonDisplayMode: 'minimal',
                }}
              />
              <Stack.Screen
                name="PasswordResetInputScreen"
                component={FindPasswordScreen}
                options={{
                  headerShown: true,
                  title: '비밀번호 찾기',
                  headerTitleAlign: 'center',
                  headerStyle: { backgroundColor: colors.grayscale[1000] },
                  headerShadowVisible: false,
                  headerTintColor: '#FFFFFF',
                  headerTitleStyle: {
                    fontSize: 16,
                    fontFamily: 'Pretendard-SemiBold',
                  },
                  headerBackButtonDisplayMode: 'minimal',
                }}
              />
              <Stack.Screen
                name="TermsScreen"
                component={TermsScreen}
                options={{
                  headerShown: true,
                  title: '개인정보 수집 및 이용 동의',
                  headerTitleAlign: 'center',
                  headerStyle: { backgroundColor: colors.grayscale[1000] },
                  headerShadowVisible: false,
                  headerTintColor: '#FFFFFF',
                  headerTitleStyle: {
                    fontSize: 16,
                    fontFamily: 'Pretendard-SemiBold',
                  },
                  headerBackButtonDisplayMode: 'minimal',
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
    paddingTop: 8,
  },
});
