import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { login as kakaoSdkLogin } from '@react-native-seoul/kakao-login';
import { useAuthStore } from '../app/features/auth/auth.store';

WebBrowser.maybeCompleteAuthSession();

export const useLoginScreen = () => {
  const [userName, setUserName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [autoLogin, setAutoLogin] = useState<boolean>(false);
  const [userNameError, setUserNameError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();

  const login = useAuthStore((s) => s.login);
  const socialLogin = useAuthStore((s) => s.socialLogin);
  const isLoading = useAuthStore((s) => s.isLoading);
  const errorMessage = useAuthStore((s) => s.errorMessage);

  const googleClientId =
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ??
    '1073477248905-mei7dih847gegd2vh3ovf78m0oib4eds.apps.googleusercontent.com';

  const [, response, promptAsync] = Google.useAuthRequest({
    iosClientId: googleClientId,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    const run = async () => {
      if (response?.type !== 'success') return;

      const providerToken = response.authentication?.idToken;

      if (!providerToken) {
        Alert.alert('구글 로그인 실패', '토큰을 가져오지 못했어요.');
        return;
      }

      const ok = await socialLogin({
        provider: 'GOOGLE',
        providerToken,
        autoLogin: true,
      });

      if (!ok) {
        Alert.alert('로그인 실패', useAuthStore.getState().errorMessage ?? '다시 시도해 주세요.');
      }
    };

    run();
  }, [response, socialLogin]);

  const onGooglePress = async () => {
    try {
      await promptAsync();
    } catch {
      Alert.alert('구글 로그인 실패', '다시 시도해 주세요.');
    }
  };

  const onKakaoPress = async () => {
    try {
      const token = await kakaoSdkLogin();
      const providerToken = token?.accessToken;

      if (!providerToken) {
        Alert.alert('카카오 로그인 실패', 'accessToken을 가져오지 못했어요.');
        return;
      }

      const ok = await socialLogin({
        provider: 'KAKAO',
        providerToken,
        autoLogin: true,
      });

      if (!ok) {
        Alert.alert('로그인 실패', useAuthStore.getState().errorMessage ?? '다시 시도해 주세요.');
      }
    } catch (e: any) {
      if (e?.code === 'E_CANCELLED_OPERATION' || e?.message?.includes('cancel')) return;
      Alert.alert('카카오 로그인 실패', '다시 시도해 주세요.');
    }
  };

  const onApplePress = async () => {
    try {
      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) {
        Alert.alert('Apple 로그인 불가', '이 기기에서는 Apple 로그인을 사용할 수 없어요.');
        return;
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      const providerToken = credential.identityToken;

      if (!providerToken) {
        Alert.alert('Apple 로그인 실패', 'ID Token을 가져오지 못했어요.');
        return;
      }

      const ok = await socialLogin({
        provider: 'APPLE',
        providerToken,
        email: credential.email ?? undefined,
        autoLogin: true,
      });

      if (!ok) {
        Alert.alert(useAuthStore.getState().errorMessage ?? '다시 시도해 주세요.');
      }
    } catch (e: any) {
      if (e?.code === 'ERR_REQUEST_CANCELED') return;
      Alert.alert('Apple 로그인 실패', '다시 시도해 주세요.');
    }
  };

  const handleLogin = async () => {
    let valid = true;

    if (!userName.trim()) {
      setUserNameError('아이디를 입력해 주세요.');
      valid = false;
    } else setUserNameError(undefined);

    if (!password.trim()) {
      setPasswordError('비밀번호를 입력해 주세요.');
      valid = false;
    } else setPasswordError(undefined);

    if (!valid) return;

    const ok = await login({
      loginId: userName.trim(),
      password: password.trim(),
      autoLogin,
    });

    if (!ok) {
      Alert.alert('로그인 실패', errorMessage ?? '다시 시도해 주세요.');
    }
  };

  return {
    userName,
    setUserName,
    password,
    setPassword,
    autoLogin,
    setAutoLogin,
    userNameError,
    passwordError,
    isLoading,
    onGooglePress,
    onKakaoPress,
    onApplePress,
    handleLogin,
    setUserNameError,
    setPasswordError,
  };
};
