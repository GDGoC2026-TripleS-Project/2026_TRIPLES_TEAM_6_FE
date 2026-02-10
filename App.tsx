import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';

import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
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
import { useUserStore } from './src/app/features/user/user.store';
import { useGoalStore } from './src/store/goalStore';

import { storage } from './src/utils/storage';
import { storageKeys } from './src/constants/storageKeys';
import { colors } from './src/constants/colors';
import { AppStackParamList } from './src/types/navigation';

import { syncNotifications } from './src/notifications/syncNotifications';
import { cancelNotification } from './src/notifications/notificationScheduler';
import { NOTIFICATION_IDS } from './src/notifications/notificationIds';

const Stack = createNativeStackNavigator();
const FORCE_ONBOARDING_PREVIEW = false;

Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const linking: LinkingOptions<AppStackParamList> = {
  prefixes: [Linking.createURL('/'), 'lastcup://'],
  config: {
    screens: {
      PasswordResetInputScreen: {
        path: 'auth/password-reset',
        parse: {
          token: (t: string) => decodeURIComponent(t),
          loginId: (v: string) => decodeURIComponent(v),
        },
      },
      Main: {
        screens: {
          AlarmSettingScreen: 'alarm-setting',
        },
      },
    },
  },
};


export default function App() {
  const [isHydrating, setIsHydrating] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrateGoals = useGoalStore((s) => s.hydrate);

  const accessToken = useAuthStore((s) => s.accessToken);
  const notificationSettings = useUserStore((s) => s.notificationSettings);

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
        const [,, completed] = await Promise.all([
          hydrate(),
          hydrateGoals(),
          storage.get(storageKeys.onboardingDone),
        ]);

        if (isMounted) {
          setOnboardingCompleted(completed === 'true');
        }
      } finally {
        if (isMounted) setIsHydrating(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [hydrate, hydrateGoals]);

  useEffect(() => {
    (async () => {
      const settings = await Notifications.getPermissionsAsync();
      if (settings.status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    })();
  }, []);

  useEffect(() => {
    if (!accessToken || !notificationSettings) return;

    syncNotifications({
      recordEnabled: notificationSettings.recordEnabled,
      recordTime: new Date(`1970-01-01T${notificationSettings.recordTime}:00`),
      dailyEnabled: notificationSettings.dailyEnabled,
      dailyTime: new Date(`1970-01-01T${notificationSettings.dailyTime}:00`),
    });
  }, [accessToken, notificationSettings]);

  useEffect(() => {
    if (accessToken) return;

    cancelNotification(NOTIFICATION_IDS.RECORD_REMIND);
    cancelNotification(NOTIFICATION_IDS.DAILY_CLOSE);
  }, [accessToken]);

  if (!loaded || isHydrating) return null;

  const shouldBypassAuth = FORCE_ONBOARDING_PREVIEW;
  const showAppFlow = Boolean(accessToken) || shouldBypassAuth;
  const shouldShowOnboarding =
    shouldBypassAuth || (showAppFlow && !onboardingCompleted);

  const initialRouteName = showAppFlow
    ? shouldShowOnboarding
      ? 'OnBoardingScreen'
      : 'Main'
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
              <Stack.Screen
                name="OnBoardingScreen"
                component={OnBoardingScreen}
              />
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
                name="FindPasswordScreen"
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
                name="PasswordResetInputScreen"
                component={PasswordResetInputScreen}
                options={{
                  headerShown: true,
                  title: '비밀번호 변경',
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
