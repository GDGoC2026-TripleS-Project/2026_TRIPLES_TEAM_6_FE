import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  ScrollView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../../constants/colors";
import TextField from "../../../components/common/TextField";
import Button from "../../../components/common/Button";
import { useAuthStore } from "../../../app/features/auth/auth.store";
import CheckboxOut from "../../../../assets/ComponentsImage/checkboxOut.svg";
import CheckboxIn from "../../../../assets/ComponentsImage/checkboxIn.svg";

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const scrollRef = useRef<ScrollView>(null);
  const fieldYRef = useRef<Record<string, number>>({});
  const [touched, setTouched] = useState({
    loginId: false,
    password: false,
    passwordCheck: false,
    nickname: false,
    email: false,
  });

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");

  const [loginIdError, setLoginIdError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [passwordCheckError, setPasswordCheckError] =
    useState<string | undefined>();
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
      loginId: true,
      password: true,
      passwordCheck: true,
      nickname: true,
      email: true,
    });

    let ok = true;

    const uErr = validateUsername(loginId);
    setLoginIdError(uErr);
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
    return ok;
  };

  const validateLoginIdDuplicate = async () => {
    const value = loginId.trim();
    const err = validateUsername(value);
    if (err) {
      setLoginIdError(err);
      setLoginIdChecked(false);
      return false;
    }

    setIsCheckingLoginId(true);
    const result = await checkLoginIdAvailable(value);
    setIsCheckingLoginId(false);

    setLoginIdChecked(result.ok);
    if (!result.ok) {
      setLoginIdError(result.message);
      return false;
    }

    setLoginIdError(undefined);
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
      loginId.trim() &&
        password &&
        passwordCheck &&
        nickname.trim() &&
        email.trim() &&
        isValidUsername(loginId.trim()) &&
        isValidPassword(password) &&
        password === passwordCheck &&
        isValidNickname(nickname.trim()) &&
        isValidEmail(email.trim()) &&
        !isCheckingLoginId &&
        !isCheckingNickname &&
        agree &&
        loginIdChecked &&
        nicknameChecked
    );
  }, [
    loginId,
    password,
    passwordCheck,
    nickname,
    email,
    isCheckingLoginId,
    isCheckingNickname,
    agree,
    loginIdChecked,
    nicknameChecked,
  ]);

  const onSubmit = async () => {
    const ok = validateAll();
    if (!ok) return;
    const loginIdOk = await validateLoginIdDuplicate();
    if (!loginIdOk) return;
    const nicknameOk = await validateNicknameDuplicate();
    if (!nicknameOk) return;

    const success = await signup({
      loginId: loginId.trim(),
      password,
      nickname: nickname.trim(),
      email: email.trim(),
      autoLogin: true,
    });

    if (!success) {
      if (errorMessage?.includes("이메일")) {
        setTouched((p) => ({ ...p, email: true }));
        setEmailError(errorMessage);
        return;
      }
      Alert.alert("회원가입 실패", errorMessage ?? "다시 시도해 주세요.");
      return;
    }

    Alert.alert("가입 완료", "회원가입이 완료되었습니다.");
  };

  const scrollToField = (key: string) => {
    const y = fieldYRef.current[key];
    if (typeof y !== "number") return;
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            ref={scrollRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.form}>
              <View
                onLayout={(e) => {
                  fieldYRef.current.loginId = e.nativeEvent.layout.y;
                }}
              >
                <Text style={styles.label}>아이디</Text>
                <TextField
                  placeholder="영문, 숫자 조합"
                  value={loginId}
                  onChangeText={(t) => {
                    setLoginId(t);
                    setLoginIdChecked(false);
                    if (loginIdError) setLoginIdError(undefined);
                  }}
                  onFocus={() => scrollToField("loginId")}
                  onBlur={async () => {
                    setTouched((p) => ({ ...p, loginId: true }));
                    await validateLoginIdDuplicate();
                  }}
                  autoCapitalize="none"
                  error={touched.loginId ? loginIdError : undefined}
                  returnKeyType="next"
                />
              </View>

              <View
                onLayout={(e) => {
                  fieldYRef.current.password = e.nativeEvent.layout.y;
                }}
              >
                <Text style={styles.label}>비밀번호</Text>
                <TextField
                  placeholder="영문, 숫자 조합 8자 이상"
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (passwordError) setPasswordError(undefined);
                  }}
                  onFocus={() => scrollToField("password")}
                  onBlur={() => {
                    setTouched((p) => ({ ...p, password: true }));
                    setPasswordError(validatePassword(password));
                  }}
                  secureTextEntry
                  error={touched.password ? passwordError : undefined}
                  returnKeyType="next"
                />
              </View>

              <View
                onLayout={(e) => {
                  fieldYRef.current.passwordCheck = e.nativeEvent.layout.y;
                }}
              >
                <Text style={styles.label}>비밀번호 확인</Text>
                <TextField
                  placeholder="비밀번호를 다시 입력해 주세요"
                  value={passwordCheck}
                  onChangeText={(t) => {
                    setPasswordCheck(t);
                    if (passwordCheckError) setPasswordCheckError(undefined);
                  }}
                  onFocus={() => scrollToField("passwordCheck")}
                  onBlur={() => {
                    setTouched((p) => ({ ...p, passwordCheck: true }));
                    setPasswordCheckError(validatePasswordCheck(passwordCheck));
                  }}
                  secureTextEntry
                  error={touched.passwordCheck ? passwordCheckError : undefined}
                  returnKeyType="next"
                />
              </View>

              <View
                onLayout={(e) => {
                  fieldYRef.current.nickname = e.nativeEvent.layout.y;
                }}
              >
                <Text style={styles.label}>닉네임</Text>
                <TextField
                  placeholder="2-10자"
                  value={nickname}
                  onChangeText={(t) => {
                    setNickname(t);
                    setNicknameChecked(false);
                    if (nicknameError) setNicknameError(undefined);
                  }}
                  onFocus={() => scrollToField("nickname")}
                  onBlur={async () => {
                    setTouched((p) => ({ ...p, nickname: true }));
                    await validateNicknameDuplicate();
                  }}
                  error={touched.nickname ? nicknameError : undefined}
                  returnKeyType="next"
                />
              </View>

              <View
                onLayout={(e) => {
                  fieldYRef.current.email = e.nativeEvent.layout.y;
                }}
              >
                <Text style={styles.label}>이메일</Text>
                <TextField
                  placeholder="example@email.com"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (emailError) setEmailError(undefined);
                  }}
                  onFocus={() => scrollToField("email")}
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
              <Pressable
                style={styles.agreeRow}
                onPress={() => setAgree((p) => !p)}
                hitSlop={10}
              >
                <View style={styles.agreeLeft}>
                  {agree ? (
                    <CheckboxOut width={20} height={20} />
                  ) : (
                    <CheckboxIn width={20} height={20} />
                  )}
                  <Text style={styles.agreeText}>
                    개인정보 수집 및 이용 동의 (필수)
                  </Text>
                </View>
                <Pressable onPress={() => navigation.navigate("TermsScreen")}>
                  <Text style={styles.detailText}>자세히 보기</Text>
                </Pressable>
              </Pressable>

              <View style={styles.submitWrap}>
                <Button
                  title="가입하기"
                  onPress={onSubmit}
                  disabled={!canSubmit || isLoading}
                />
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  form: {
    width: "100%",
    gap: 10,
  },

  label: {
    marginTop: 10,
    marginBottom: 6,
    color: colors.grayscale[200],
    fontSize: 14,
    fontFamily: "Pretendard-SemiBold",
  },

  bottomSection: {
    backgroundColor: colors.grayscale[1000],
    paddingHorizontal: 0,
    paddingTop: 16,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: colors.grayscale[900],
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
