import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "../../../constants/colors";
import { useNavigation } from "@react-navigation/native";
import TextField from "../../../components/common/TextField";
import Button from "../../../components/common/Button";
import GoogleLogin from "../../../../assets/ComponentsImage/GoogleLogin.svg";
import KakaoLogin from "../../../../assets/ComponentsImage/KakaoLogin.svg";
import AppleLogin from "../../../../assets/ComponentsImage/AppleLogin.svg";

import CheckboxOut from '../../../../assets/ComponentsImage/checkboxOut.svg';
import CheckboxIn from '../../../../assets/ComponentsImage/checkboxIn.svg';
import { useLoginScreen } from "../../../hooks/useLoginScreen";

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
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
  } = useLoginScreen();

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
          onPress={() => setAutoLogin((prev) => !prev)}
          hitSlop={8}
          style={styles.autoRow}
        >
          {autoLogin ? <CheckboxIn width={20} height={20} /> : <CheckboxOut width={20} height={20} />}
          <Text style={styles.autoText}>자동 로그인</Text>
        </Pressable>

        <View style={styles.linkRow}>
          <Pressable hitSlop={8} onPress={() => navigation.navigate("SignUpScreen")}>
            <Text style={styles.linkText}>회원가입</Text>
          </Pressable>
          <Text style={styles.linkDivider}>|</Text>
          <Pressable
            hitSlop={8}
            onPress={() => navigation.navigate("FindPasswordScreen")}
          >
            <Text style={styles.linkText}>비밀번호 찾기</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.loginBtnWrap}>
        <Button 
          title={isLoading ? '로그인' : '로그인'} 
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

  autoText: {
    color: colors.grayscale[300],
    fontSize: 14,
    fontFamily: "Pretendard-Regular",
    paddingLeft: 7,
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
