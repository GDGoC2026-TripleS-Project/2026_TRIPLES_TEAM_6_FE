import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import { useFonts } from 'expo-font';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RootNavigator from './src/navigation/RootStack';
import LoginScreen from './src/screens/main/sign/LoginScreen';
import OnBoardingScreen from './src/screens/main/onBoarding/OnBoardingScreen';
import SignUpScreen from './src/screens/main/sign/SignUpScreen';
import FindPasswordScreen from './src/screens/main/sign/FindPasswordScreen';
import TermsScreen from './src/screens/main/sign/TermsScreen';
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
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator
          key={accessToken ? 'app' : 'auth'}
          initialRouteName={accessToken ? 'Main' : 'Login'}
          screenOptions={{ headerShown: false }}
        >
          {accessToken ? (
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
                  headerStyle: { backgroundColor: '#0B0B0B' },
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
                  headerStyle: { backgroundColor: '#0B0B0B' },
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
                  headerStyle: { backgroundColor: '#0B0B0B' },
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
    backgroundColor: '#0B0B0B',
    paddingTop: 8,
  },
});
