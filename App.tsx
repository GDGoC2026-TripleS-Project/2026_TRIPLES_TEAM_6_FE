import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Alert } from 'react-native';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';

import RootNavigator from './src/navigation/RootStack';
import LoginScreen from './src/screens/main/sign/LoginScreen';
import OnBoardingScreen from './src/screens/main/onBoarding/OnBoardingScreen';
import SignUpScreen from './src/screens/main/sign/SignUpScreen';
import FindPasswordScreen from './src/screens/main/sign/FindPasswordScreen';
import PasswordResetInputScreen from './src/screens/main/sign/PasswordResetInputScreen';
import TermsScreen from './src/screens/main/sign/TermsScreen';

import { useAuthStore } from './src/app/features/auth/auth.store';
import { storage } from './src/utils/storage';
import { storageKeys } from './src/constants/storageKeys';
import { colors } from './src/constants/colors';
import { useGoalStore } from './src/store/goalStore';
import { userApiLayer } from './src/app/features/user/user.api';

// import messaging from '@react-native-firebase/messaging';

const Stack = createNativeStackNavigator();
const FORCE_ONBOARDING_PREVIEW = false;
const prefix = Linking.createURL('/');

const linking = {
  prefixes: [prefix, 'lastcup://'],
  config: {
    screens: {
      Login: 'login',
      SignUpScreen: 'signup',
      FindPasswordScreen: 'auth/find-password',
      PasswordResetInputScreen: 'auth/reset-input',
      TermsScreen: 'terms',
      OnBoardingScreen: 'onboarding',
      Main: {
        screens: {
          MainTabs: {
            screens: {
              Home: 'home',
              Calendar: 'calendar',
              Heart: 'heart',
              Profile: 'profile',
              Plus: 'record',
            },
          },
          AlarmSettingScreen: 'settings/alarm',
        },
      },
    },
  },
};

/* =======================
   FCM 등록 함수
======================= */
// const registerFcm = async () => {
//   const authStatus = await messaging().requestPermission();
//   const enabled =
//     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//     authStatus === messaging.AuthorizationStatus.PROVISIONAL;
//
//   if (!enabled) {
//     console.log('푸시 권한 거부됨');
//     return;
//   }
//
//   const token = await messaging().getToken();
//   if (!token) return;
//
//   console.log('📱 FCM TOKEN:', token);
//
//   await userApiLayer.registerDeviceToken({
//     fcmToken: token,
//     platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
//   });
// };

export default function App() {
  const [isHydrating, setIsHydrating] = useState(true);
  const [onboardingPending, setOnboardingPending] = useState(false);

  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrateGoals = useGoalStore((s) => s.hydrate);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [loaded] = useFonts({
    'Pretendard-Regular': require('./assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('./assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('./assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('./assets/fonts/Pretendard-Bold.otf'),
  });

  /* =======================
     앱 시작 시 FCM 등록
  ======================= */
  useEffect(() => {
    // registerFcm().catch(console.error);

    // 포그라운드 알림 처리 (iOS 필수)
        // const unsubscribe = messaging().onMessage(async remoteMessage => {
    // Alert.alert(
    // remoteMessage.notification?.title ?? '알림',
    // remoteMessage.notification?.body ?? ''
    // );
    // });
    //
    // return unsubscribe;
  }, []);

  /* =======================
     인증/스토리지 hydrate
  ======================= */
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [,, pending] = await Promise.all([
          hydrate(),
          hydrateGoals(),
          storage.get(storageKeys.onboardingPending),
        ]);

        if (isMounted) {
          setOnboardingPending(pending === 'true');
        }
      } finally {
        if (isMounted) setIsHydrating(false);
      }
    })();
    return () => { isMounted = false; };
  }, [hydrate, hydrateGoals]);

  if (!loaded || isHydrating) return null;

  const shouldBypassAuth = FORCE_ONBOARDING_PREVIEW;
  const showAppFlow = Boolean(accessToken) || shouldBypassAuth;
  const shouldShowOnboarding = shouldBypassAuth || onboardingPending;

  const initialRouteName = showAppFlow
    ? (shouldShowOnboarding ? 'OnBoardingScreen' : 'Main')
    : 'Login';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <NavigationContainer linking={linking}>
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
              <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
              <Stack.Screen name="FindPasswordScreen" component={FindPasswordScreen} />
              <Stack.Screen name="PasswordResetInputScreen" component={PasswordResetInputScreen} />
              <Stack.Screen name="TermsScreen" component={TermsScreen} />
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
