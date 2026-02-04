import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../../constants/colors";
import TextField from "../../../components/common/TextField";
import Button from "../../../components/common/Button";
import { useAuthStore } from "../../../app/features/auth/auth.store";
import CheckboxOut from "../../../../assets/ComponentsImage/checkboxOut.svg";
import CheckboxIn from "../../../../assets/ComponentsImage/checkboxIn.svg";

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [touched, setTouched] = useState({
    userName: false,
    password: false,
    passwordCheck: false,
    nickname: false,
    email: false,
  });

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");

  const [userNameError, setUserNameError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [passwordCheckError, setPasswordCheckError] = useState<string | undefined>();
  const [nicknameError, setNicknameError] = useState<string | undefined>();
  const [emailError, setEmailError] = useState<string | undefined>();

  const [agree, setAgree] = useState(false);

  const signup = useAuthStore((s) => s.signup);
  const checkLoginIdAvailable = useAuthStore((s) => s.checkLoginIdAvailable);
  const checkNicknameAvailable = useAuthStore((s) => s.checkNicknameAvailable);
  const isLoading = useAuthStore((s) => s.isLoading);
  const errorMessage = useAuthStore((s) => s.errorMessage);
  const [loginIdChecked, setLoginIdChecked] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [isCheckingLoginId, setIsCheckingLoginId] = useState(false);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);

  const isValidUsername = (v: string) =>
    /^[a-zA-Z0-9]+$/.test(v) && /[a-zA-Z]/.test(v) && /[0-9]/.test(v);

  const isValidPassword = (v: string) =>
    v.length >= 8 && /[a-zA-Z]/.test(v) && /[0-9]/.test(v);

  const isValidNickname = (v: string) => v.trim().length >= 2 && v.trim().length <= 10;

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const validateUsername = (v: string) => {
    if (!v.trim()) return "아이디를 입력해 주세요.";
    if (!isValidUsername(v.trim())) return "아이디 형식이 올바르지 않습니다.";
    return undefined;
  };

  const validatePassword = (v: string) => {
    if (!v) return "비밀번호를 입력해 주세요.";
    if (!isValidPassword(v)) return "비밀번호 형식이 올바르지 않습니다.";
    return undefined;
  };

  const validatePasswordCheck = (v: string) => {
    if (!v) return "비밀번호 확인을 입력해 주세요.";
    if (password !== v) return "비밀번호가 일치하지 않습니다.";
    return undefined;
  };

  const validateNickname = (v: string) => {
    if (!v.trim()) return "닉네임을 입력해 주세요.";
    if (!isValidNickname(v.trim())) return "닉네임 형식이 올바르지 않습니다.";
    return undefined;
  };

  const validateEmail = (v: string) => {
    if (!v.trim()) return "이메일을 입력해 주세요.";
    if (!isValidEmail(v.trim())) return "이메일 형식이 올바르지 않습니다.";
    return undefined;
  };

  const validateAll = () => {
    setTouched({
      userName: true,
      password: true,
      passwordCheck: true,
      nickname: true,
      email: true,
    });

    let ok = true;

    const uErr = validateUsername(userName);
    setUserNameError(uErr);
    if (uErr) ok = false;

    const pErr = validatePassword(password);
    setPasswordError(pErr);
    if (pErr) ok = false;

    const pcErr = validatePasswordCheck(passwordCheck);
    setPasswordCheckError(pcErr);
    if (pcErr) ok = false;

    const nErr = validateNickname(nickname);
    setNicknameError(nErr);
    if (nErr) ok = false;

    const eErr = validateEmail(email);
    setEmailError(eErr);
    if (eErr) ok = false;

    if (!agree) ok = false;
    if (!loginIdChecked) ok = false;
    if (!nicknameChecked) ok = false;

    return ok;
  };

  const validateLoginIdDuplicate = async () => {
    const value = userName.trim();
    const err = validateUsername(value);
    if (err) {
      setUserNameError(err);
      setLoginIdChecked(false);
      return false;
    }

    setIsCheckingLoginId(true);
    const result = await checkLoginIdAvailable(value);
    setIsCheckingLoginId(false);

    setLoginIdChecked(result.ok);
    if (!result.ok) {
      setUserNameError(result.message);
      return false;
    }

    setUserNameError(undefined);
    return true;
  };

  const validateNicknameDuplicate = async () => {
    const value = nickname.trim();
    const err = validateNickname(value);
    if (err) {
      setNicknameError(err);
      setNicknameChecked(false);
      return false;
    }

    setIsCheckingNickname(true);
    const result = await checkNicknameAvailable(value);
    setIsCheckingNickname(false);

    setNicknameChecked(result.ok);
    if (!result.ok) {
      setNicknameError(result.message);
      return false;
    }

    setNicknameError(undefined);
    return true;
  };

  const canSubmit = useMemo(() => {
    return Boolean(
      userName.trim() &&
        password &&
        passwordCheck &&
        nickname.trim() &&
        email.trim() &&
        isValidUsername(userName.trim()) &&
        isValidPassword(password) &&
        password === passwordCheck &&
        isValidNickname(nickname.trim()) &&
        isValidEmail(email.trim()) &&
        loginIdChecked &&
        nicknameChecked &&
        !isCheckingLoginId &&
        !isCheckingNickname &&
        agree
    );
  }, [
    userName,
    password,
    passwordCheck,
    nickname,
    email,
    loginIdChecked,
    nicknameChecked,
    isCheckingLoginId,
    isCheckingNickname,
    agree,
  ]);

  const onSubmit = async () => {
    const ok = validateAll();
    if (!ok) return;
    const loginIdOk = await validateLoginIdDuplicate();
    if (!loginIdOk) return;
    const nicknameOk = await validateNicknameDuplicate();
    if (!nicknameOk) return;

    const success = await signup({
      loginId: userName.trim(),
      password,
      nickname: nickname.trim(),
      autoLogin: true,
    });

    if (!success) {
      Alert.alert("회원가입 실패", errorMessage ?? "다시 시도해 주세요.");
      return;
    }

    Alert.alert("가입 완료", "회원가입이 완료되었어요!");
  };

  return (
    <View 
      style={styles.container}
    >
      <View 
        style={styles.scrollView}
      >
        <View style={styles.form}>
          <Text style={styles.label}>아이디</Text>
          <TextField
            placeholder="영문, 숫자 조합"
            value={userName}
            hideBorder
            onChangeText={(t) => {
              setUserName(t);
              setLoginIdChecked(false);
              if (userNameError) setUserNameError(undefined);
            }}
            onBlur={async () => {
              setTouched((p) => ({ ...p, userName: true }));
              await validateLoginIdDuplicate();
            }}
            autoCapitalize="none"
            error={touched.userName ? userNameError : undefined}
            returnKeyType="next"
          />

          <Text style={styles.label}>비밀번호</Text>
          <TextField
            placeholder="영문, 숫자 포함 8자 이상"
            value={password}
            hideBorder
            onChangeText={(t) => {
              setPassword(t);
              if (passwordError) setPasswordError(undefined);
            }}
            onBlur={() => {
              setTouched((p) => ({ ...p, password: true }));
              setPasswordError(validatePassword(password));
            }}
            secureTextEntry
            error={touched.password ? passwordError : undefined}
            returnKeyType="next"
          />

          <Text style={styles.label}>비밀번호 확인</Text>
          <TextField
            placeholder="비밀번호 확인"
            value={passwordCheck}
            hideBorder
            onChangeText={(t) => {
              setPasswordCheck(t);
              if (passwordCheckError) setPasswordCheckError(undefined);
            }}
            onBlur={() => {
              setTouched((p) => ({ ...p, passwordCheck: true }));
              setPasswordCheckError(validatePasswordCheck(passwordCheck));
            }}
            secureTextEntry
            error={touched.passwordCheck ? passwordCheckError : undefined}
            returnKeyType="next"
          />

          <Text style={styles.label}>닉네임</Text>
          <TextField
            placeholder="2~10자 이내"
            value={nickname}
            hideBorder
            onChangeText={(t) => {
              setNickname(t);
              setNicknameChecked(false);
              if (nicknameError) setNicknameError(undefined);
            }}
            onBlur={async () => {
              setTouched((p) => ({ ...p, nickname: true }));
              await validateNicknameDuplicate();
            }}
            error={touched.nickname ? nicknameError : undefined}
            returnKeyType="next"
          />

          <Text style={styles.label}>이메일</Text>
          <TextField
            placeholder="이메일 주소 입력"
            value={email}
            hideBorder
            onChangeText={(t) => {
              setEmail(t);
              if (emailError) setEmailError(undefined);
            }}
            onBlur={() => {
              setTouched((p) => ({ ...p, email: true }));
              setEmailError(validateEmail(email));
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            error={touched.email ? emailError : undefined}
            returnKeyType="done"
          />
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.agreeRow}>
          <Pressable style={styles.agreeLeft} onPress={() => setAgree((p) => !p)} hitSlop={10}>
            {agree ? <CheckboxIn width={20} height={20} /> : <CheckboxOut width={20} height={20} />}
            <Text style={styles.agreeText}>개인정보 수집 및 이용 동의 (필수)</Text>
          </Pressable>

          <Pressable hitSlop={10} onPress={() => navigation.navigate("TermsScreen")}>
            <Text style={styles.detailText}>자세히 보기</Text>
          </Pressable>
        </View>

        <View style={styles.submitWrap}>
          <Button
            title={isLoading ? "가입하기" : "가입하기"}
            disabled={!canSubmit || isLoading || isCheckingLoginId || isCheckingNickname}
            onPress={onSubmit}
            variant="primary"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
  },

  scrollView: {
    flex: 1,
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  back: {
    color: colors.grayscale[100],
    fontSize: 18,
    fontFamily: "Pretendard-Medium",
    width: 24,
  },

  title: {
    color: colors.grayscale[100],
    fontSize: 16,
    fontFamily: "Pretendard-SemiBold",
  },

  form: {
    width: "100%",
    gap: 10,
  },

  label: {
    marginTop: 10,
    color: colors.grayscale[200],
    fontSize: 14,
    fontFamily: "Pretendard-SemiBold",
  },

  bottomSection: {
    backgroundColor: colors.grayscale[1000],
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  agreeRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  agreeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  agreeText: {
    color: colors.grayscale[400],
    fontSize: 14,
    fontFamily: "Pretendard-Regular",
  },

  detailText: {
    color: colors.grayscale[500],
    fontSize: 12,
    fontFamily: "Pretendard-Regular",
  },

  submitWrap: {
    width: "100%",
  },
});

export default SignUpScreen;