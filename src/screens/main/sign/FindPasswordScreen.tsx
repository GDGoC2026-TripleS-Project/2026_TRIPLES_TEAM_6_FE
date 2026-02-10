import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { colors } from "../../../constants/colors";
import TextField from "../../../components/common/TextField";
import HeaderDetail from "../../../components/common/HeaderDetail";
import Button from "../../../components/common/Button";
import { authApiLayer } from "../../../app/features/auth/auth.api";

const FindPasswordScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const defaultLoginId = route?.params?.defaultLoginId as string | undefined;

  const [userName, setUserName] = useState(defaultLoginId ?? "");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userNameError, setUserNameError] = useState<string | undefined>();
  const [emailError, setEmailError] = useState<string | undefined>();

  const isValidUsername = (v: string) =>
    /^[a-zA-Z0-9]+$/.test(v) && /[a-zA-Z]/.test(v) && /[0-9]/.test(v);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const validateAll = () => {
    let ok = true;

    if (!userName.trim()) {
      setUserNameError("아이디를 입력해 주세요.");
      ok = false;
    } else if (!isValidUsername(userName.trim())) {
      setUserNameError("아이디 형식이 올바르지 않습니다.");
      ok = false;
    } else {
      setUserNameError(undefined);
    }

    if (!email.trim()) {
      setEmailError("이메일을 입력해 주세요.");
      ok = false;
    } else if (!isValidEmail(email.trim())) {
      setEmailError("이메일 형식이 올바르지 않습니다.");
      ok = false;
    } else {
      setEmailError(undefined);
    }

    return ok;
  };

  const canSubmit = useMemo(() => {
    return (
      userName.trim() &&
      email.trim() &&
      isValidUsername(userName.trim()) &&
      isValidEmail(email.trim())
    );
  }, [userName, email]);

  const onSubmit = async () => {
    const ok = validateAll();
    if (!ok) return;

    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await authApiLayer.requestPasswordReset({
        loginId: userName.trim(),
        email: email.trim(),
      });
      if (__DEV__) {
        console.log("[PW RESET REQUEST RES]", res?.data);
      }
      if (res?.data?.data?.requested === false) {
        Alert.alert("요청 실패", "비밀번호 재설정 요청에 실패했습니다.");
        return;
      }
      Alert.alert("요청 완료", "비밀번호 재설정 안내를 전송했습니다.", [
        {
          text: "확인",
          onPress: () =>
            navigation.navigate("PasswordResetInputScreen", {
              defaultLoginId: userName.trim(),
            }),
        },
      ]);
    } catch (e: any) {
      if (__DEV__) {
        console.log("[PW RESET REQUEST ERR] status:", e?.response?.status);
        console.log("[PW RESET REQUEST ERR] data:", e?.response?.data);
        console.log("[PW RESET REQUEST ERR] message:", e?.message);
      }
      Alert.alert(
        "요청 실패",
        e?.response?.data?.message ??
          e?.message ??
          "비밀번호 재설정 요청에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={styles.pageTitle}>비밀번호 찾기</Text>
        <Text style={styles.pageDesc}>
          가입 시 사용한 아이디와 이메일을 입력해 주세요.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>아이디</Text>
        <TextField
          placeholder="아이디 입력"
          value={userName}
          onChangeText={(t) => {
            setUserName(t);
            if (userNameError) setUserNameError(undefined);
          }}
          autoCapitalize="none"
          error={userNameError}
        />

        <Text style={styles.label}>이메일</Text>
        <TextField
          placeholder="이메일 주소 입력"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (emailError) setEmailError(undefined);
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          error={emailError}
        />
      </View>

      <View style={styles.submitWrap}>
        <Button
          title="재설정 링크 받기"
          disabled={!canSubmit || isSubmitting}
          onPress={onSubmit}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
    alignItems: "center",
    paddingTop: 0,
    paddingHorizontal: 16,
  },

  headerArea: {
    width: "100%",
    marginBottom: 22,
  },

  pageTitle: {
    color: colors.grayscale[100],
    fontSize: 22,
    fontFamily: "Pretendard-SemiBold",
    marginBottom: 6,
    marginTop: 12,
  },

  pageDesc: {
    color: colors.grayscale[500],
    fontSize: 15,
    lineHeight: 18,
    fontFamily: "Pretendard-Regular",
  },

  form: {
    width: "100%",
    gap: 10,
  },

  label: {
    marginTop: 14,
    marginBottom: 0,
    color: colors.grayscale[200],
    fontSize: 13,
    fontFamily: "Pretendard-Regular",
  },

  submitWrap: {
    width: "100%",
    marginTop: 60,
  },
});

export default FindPasswordScreen;
