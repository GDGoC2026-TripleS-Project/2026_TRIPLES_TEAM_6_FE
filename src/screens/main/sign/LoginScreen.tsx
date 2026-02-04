import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { colors } from "../../../constants/colors";
import { useNavigation } from "@react-navigation/native";
import TextField from "../../../components/common/TextField";
import Button from "../../../components/common/Button";
import GoogleLogin from "../../../../assets/ComponentsImage/GoogleLogin.svg";
import KakaoLogin from "../../../../assets/ComponentsImage/KakaoLogin.svg";
import AppleLogin from "../../../../assets/ComponentsImage/AppleLogin.svg";

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AppleAuthentication from "expo-apple-authentication";
import { login as kakaoSdkLogin } from "@react-native-seoul/kakao-login";

import { useAuthStore } from "../../../app/features/auth/auth.store";

WebBrowser.maybeCompleteAuthSession();

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [autoLogin, setAutoLogin] = useState<boolean>(false);

  const [userNameError, setUserNameError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();

  // zustand store
  const login = useAuthStore((s) => s.login);
  const socialLogin = useAuthStore((s) => s.socialLogin);
  const isLoading = useAuthStore((s) => s.isLoading);
  const errorMessage = useAuthStore((s) => s.errorMessage);

  const googleClientId =
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ??
    "1073477248905-t75dpkijvnlgdu7p3pgr81k7vtplii2u.apps.googleusercontent.com";

  // Google AuthSession (Expo)
  const [, response, promptAsync] = Google.useAuthRequest({
    clientId: googleClientId,
  });

  // Google 로그인 완료 후 서버로 토큰 전달
  useEffect(() => {
    const run = async () => {
      if (response?.type !== "success") return;

      const providerAccessToken = response.authentication?.accessToken;
      const identityToken = response.authentication?.idToken;

      if (!providerAccessToken && !identityToken) {
        Alert.alert("구글 로그인 실패", "토큰을 가져오지 못했어요.");
        return;
      }

      const ok = await socialLogin({
        provider: "GOOGLE",
        providerAccessToken,
        identityToken: identityToken ?? undefined,
        autoLogin: true,
      });

      if (!ok) {
        Alert.alert("로그인 실패", useAuthStore.getState().errorMessage ?? "다시 시도해 주세요.");
      }
    };

    run();
  }, [response]);

  // Google 버튼 클릭 → 구글 로그인 창 열기
  const onGooglePress = async () => {
    try {
      await promptAsync();
    } catch (e) {
      Alert.alert("구글 로그인 실패", "다시 시도해 주세요.");
    }
  };

  const onKakaoPress = async () => {
    try {
      const token = await kakaoSdkLogin();
      const providerAccessToken = token?.accessToken;

      if (!providerAccessToken) {
        Alert.alert("카카오 로그인 실패", "accessToken을 가져오지 못했어요.");
        return;
      }

      const ok = await socialLogin({
        provider: "KAKAO",
        providerAccessToken,
        autoLogin: true,
      });

      if (!ok) {
        Alert.alert("로그인 실패", useAuthStore.getState().errorMessage ?? "다시 시도해 주세요.");
      }
    } catch (e: any) {
      if (e?.code === "E_CANCELLED_OPERATION" || e?.message?.includes("cancel")) return;
      Alert.alert("카카오 로그인 실패", "다시 시도해 주세요.");
    }
  };

  const onApplePress = async () => {
    try {
      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) {
        Alert.alert("Apple 로그인 불가", "이 기기에서는 Apple 로그인을 사용할 수 없어요.");
        return;
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const identityToken = credential.identityToken ?? undefined;
      const authorizationCode = credential.authorizationCode ?? undefined;
      const nickname = credential.fullName?.givenName ?? undefined;

      if (!identityToken && !authorizationCode) {
        Alert.alert("Apple 로그인 실패", "인증 정보를 가져오지 못했어요.");
        return;
      }

      const ok = await socialLogin({
        provider: "APPLE",
        identityToken,
        authorizationCode,
        email: credential.email ?? undefined,
        nickname,
        autoLogin: true,
      });

      if (!ok) {
        Alert.alert("로그인 실패", useAuthStore.getState().errorMessage ?? "다시 시도해 주세요.");
      }
    } catch (e: any) {
      if (e?.code === "ERR_REQUEST_CANCELED") return;
      Alert.alert("Apple 로그인 실패", "다시 시도해 주세요.");
    }
  };

  // 로컬 로그인
  const handleLogin = async () => {
    let valid = true;

    if (!userName.trim()) {
      setUserNameError("아이디를 입력해 주세요.");
      valid = false;
    } else setUserNameError(undefined);

    if (!password.trim()) {
      setPasswordError("비밀번호를 입력해 주세요.");
      valid = false;
    } else setPasswordError(undefined);

    if (!valid) return;

    const ok = await login({
      loginId: userName.trim(),
      password: password.trim(),
      autoLogin,
    });

    if (!ok) {
      Alert.alert("로그인 실패", errorMessage ?? "다시 시도해 주세요.");
      return;
    }

    // TODO: 성공 시 이동
  };

  return (
    <View style={styles.container}>

      <View style={styles.logoWrap}>
        <Text style={styles.logoText}>라스트컵 로고</Text>
      </View>

      <View style={styles.form}>
        <TextField
  placeholder="아이디"
  value={userName}
  onChangeText={(text) => {
    setUserName(text);
    if (userNameError) setUserNameError(undefined);
  }}
  error={userNameError}
/>

<View style={{ height: 12 }} />

<TextField
  placeholder="비밀번호"
  value={password}
  onChangeText={(text) => {
    setPassword(text);
    if (passwordError) setPasswordError(undefined);
  }}
  secureTextEntry
  error={passwordError}
/>

      </View>

      <View style={styles.rowBetween}>
        <Pressable
          style={styles.autoRow}
          onPress={() => setAutoLogin((prev) => !prev)}
          hitSlop={8}
        >
          <View style={[styles.checkbox, autoLogin && styles.checkboxChecked]}>
            {autoLogin && <View style={styles.checkboxDot} />}
          </View>
          <Text style={styles.autoText}>자동 로그인</Text>
        </Pressable>

        <View style={styles.linkRow}>
          <Pressable hitSlop={8} onPress={() => navigation.navigate("SignUpScreen")}>
            <Text style={styles.linkText}>회원가입</Text>
          </Pressable>
          <Text style={styles.linkDivider}>|</Text>
          <Pressable
            hitSlop={8}
            onPress={() => navigation.navigate("PasswordResetInputScreen")}
          >
            <Text style={styles.linkText}>비밀번호 찾기</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.loginBtnWrap}>
        <Button 
        title={isLoading ? '로그인 중...' : '로그인'} 
        onPress={handleLogin}
        disabled={isLoading} 
        />
      </View>

      <View style={styles.simpleWrap}>
        <View style={styles.line} />
        <Text style={styles.simpleText}>간편 로그인</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.socialRow}>
        <Pressable
          style={styles.socialBtn}
          onPress={onKakaoPress}
          hitSlop={10}
        >
          <KakaoLogin width={44} height={44} />
        </Pressable>

        <View style={styles.socialGap} />

        <Pressable style={styles.socialBtn} onPress={onGooglePress} hitSlop={10}>
          <GoogleLogin width={44} height={44} />
        </Pressable>

        <View style={styles.socialGap} />

        <Pressable
          style={styles.socialBtn}
          onPress={onApplePress}
          hitSlop={10}
        >
          <AppleLogin width={44} height={44} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
    alignItems: "center",
    paddingTop: 64,
    paddingHorizontal: 16,
  },

  logoWrap: {
    width: '100%',
    alignItems: "center",
    marginBottom: 56,
  },

  logoText: {
    color: colors.grayscale[100],
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
    paddingVertical: 20,
  },

  form: {
    width: '100%',
    marginBottom: 30
  },

  gap12: {
    height: 12,
  },

  rowBetween: {
    width: '100%',
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  autoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.grayscale[600],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "transparent",
  },

  checkboxChecked: {
    borderColor: colors.primary[500],
  },

  checkboxDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: colors.primary[500],
  },

  autoText: {
    color: colors.grayscale[300],
    fontSize: 14,
    fontFamily: "Pretendard-Regular",
  },

  linkRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  linkText: {
    color: colors.grayscale[500],
    fontSize: 13,
    fontFamily: "Pretendard-Regular",
  },

  linkDivider: {
    color: colors.grayscale[700],
    marginHorizontal: 10,
    fontSize: 12,
  },

  loginBtnWrap: {
    width: '100%',
    marginTop: 18,
  },

  simpleWrap: {
    width: '100%',
    marginTop: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  simpleText: {
    color: colors.grayscale[500],
    fontSize: 12,
    fontFamily: "Pretendard-Regular",
    marginHorizontal: 14,
    marginTop: 30,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.grayscale[800],
    marginTop: 30,
  },

  socialRow: {
    width: '100%',
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  socialBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  socialGap: {
    width: 20,
  },
});

export default LoginScreen;
