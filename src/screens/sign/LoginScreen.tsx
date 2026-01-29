import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "../../constants/colors";
import TextField from "../../components/common/TextField";
import Button from "../../components/common/Button";
import GoogleLogin from "../../../assets/ComponentsImage/GoogleLogin.svg"
import KakaoLogin from "../../../assets/ComponentsImage/KakaoLogin.svg";
import AppleLogin from "../../../assets/ComponentsImage/AppleLogin.svg";

const LoginScreen: React.FC = () => {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [autoLogin, setAutoLogin] = useState<boolean>(false);
  
  const [userNameError, setUserNameError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();

  const handleLogin = () => {
  let valid = true;

  if (!userName.trim()) {
    setUserNameError("아이디를 입력해 주세요.");
    valid = false;
  } else {
    setUserNameError(undefined);
  }

  if (!password.trim()) {
    setPasswordError("비밀번호를 입력해 주세요.");
    valid = false;
  } else {
    setPasswordError(undefined);
  }

  if (!valid) return;

  console.log("로그인 시도");
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
          <Pressable hitSlop={8} onPress={() => {}}>
            <Text style={styles.linkText}>회원가입</Text>
          </Pressable>
          <Text style={styles.linkDivider}>|</Text>
          <Pressable hitSlop={8} onPress={() => {}}>
            <Text style={styles.linkText}>비밀번호 찾기</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.loginBtnWrap}>
        <Button title="로그인" onPress={() => console.log("clicked")} />
      </View>

      <View style={styles.simpleWrap}>
        <View style={styles.line} />
        <Text style={styles.simpleText}>간편 로그인</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.socialRow}>
        <Pressable style={styles.socialBtn} onPress={() => {}} hitSlop={10}>
          <KakaoLogin width={44} height={44} />
        </Pressable>

        <View style={styles.socialGap} />

        <Pressable style={styles.socialBtn} onPress={() => {}} hitSlop={10}>
          <GoogleLogin width={44} height={44} />
        </Pressable>

        <View style={styles.socialGap} />

        <Pressable style={styles.socialBtn} onPress={() => {}} hitSlop={10}>
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
    alignItems: "center",
    justifyContent: "center",
  },

  socialGap: {
    width: 16,
  },
});

export default LoginScreen;
