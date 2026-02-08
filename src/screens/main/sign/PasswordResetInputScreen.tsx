import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { colors } from "../../../constants/colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import TextField from "../../../components/common/TextField";
import Button from "../../../components/common/Button";
import { authApiLayer } from "../../../app/features/auth/auth.api";

const PasswordResetInputScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [loginId, setLoginId] = useState(route.params?.defaultLoginId || "");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordCheck, setNewPasswordCheck] = useState("");

  const [loginIdError, setLoginIdError] = useState<string | undefined>();
  const [tokenError, setTokenError] = useState<string | undefined>();
  const [newPasswordError, setNewPasswordError] = useState<string | undefined>();
  const [newPasswordCheckError, setNewPasswordCheckError] =
    useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidLoginId = (v: string) =>
    /^[a-zA-Z0-9]+$/.test(v) && /[a-zA-Z]/.test(v) && /[0-9]/.test(v);

  const isValidPassword = (v: string) =>
    v.length >= 8 && /[a-zA-Z]/.test(v) && /[0-9]/.test(v);

  const validateAll = () => {
    let ok = true;

    if (!loginId.trim()) {
      setLoginIdError("로그인 ID를 입력해 주세요.");
      ok = false;
    } else if (!isValidLoginId(loginId.trim())) {
      setLoginIdError("로그인 ID 형식이 올바르지 않습니다.");
      ok = false;
    } else {
      setLoginIdError(undefined);
    }

    if (!token.trim()) {
      setTokenError("인증 코드를 입력해 주세요.");
      ok = false;
    } else {
      setTokenError(undefined);
    }

    if (!newPassword) {
      setNewPasswordError("새 비밀번호를 입력해 주세요.");
      ok = false;
    } else if (!isValidPassword(newPassword)) {
      setNewPasswordError("비밀번호 형식이 올바르지 않습니다.");
      ok = false;
    } else {
      setNewPasswordError(undefined);
    }

    if (!newPasswordCheck) {
      setNewPasswordCheckError("새 비밀번호 확인을 입력해 주세요.");
      ok = false;
    } else if (newPassword !== newPasswordCheck) {
      setNewPasswordCheckError("비밀번호가 일치하지 않습니다.");
      ok = false;
    } else {
      setNewPasswordCheckError(undefined);
    }

    return ok;
  };

  const canSubmit = useMemo(() => {
    return (
      loginId.trim() &&
      token.trim() &&
      newPassword &&
      newPasswordCheck &&
      isValidLoginId(loginId.trim()) &&
      isValidPassword(newPassword) &&
      newPassword === newPasswordCheck
    );
  }, [loginId, token, newPassword, newPasswordCheck]);

  const onSubmit = async () => {
    const ok = validateAll();
    if (!ok) return;

    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await authApiLayer.confirmPasswordReset({
        loginId: loginId.trim(),
        token: token.trim(),
        newPassword,
      });
      if (res?.data?.data?.reset === false) {
        Alert.alert("재설정 실패", "비밀번호 재설정에 실패했습니다.");
        return;
      }
      navigation.navigate("PasswordResetScreen");
    } catch (e: any) {
      if (__DEV__) {
        console.log("[PW RESET CONFIRM ERR] status:", e?.response?.status);
        console.log("[PW RESET CONFIRM ERR] data:", e?.response?.data);
        console.log(
          "[PW RESET CONFIRM ERR] fieldErrors:",
          JSON.stringify(e?.response?.data?.error?.fieldErrors)
        );
        console.log("[PW RESET CONFIRM ERR] message:", e?.message);
      }
      Alert.alert(
        "재설정 실패",
        e?.response?.data?.message ??
          e?.message ??
          "비밀번호 재설정에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={styles.pageTitle}>비밀번호 재설정</Text>
        <Text style={styles.pageDesc}>새로운 비밀번호를 입력해 주세요.</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>로그인 ID</Text>
        <TextField
          placeholder="로그인 ID 입력"
          value={loginId}
          onChangeText={(t) => {
            setLoginId(t);
            if (!t.trim()) {
              setLoginIdError("로그인 ID를 입력해 주세요.");
            } else if (!isValidLoginId(t.trim())) {
              setLoginIdError("로그인 ID 형식이 올바르지 않습니다.");
            } else {
              setLoginIdError(undefined);
            }
          }}
          autoCapitalize="none"
          error={loginIdError}
        />

        <Text style={styles.label}>인증 코드</Text>
        <TextField
          placeholder="메일로 받은 코드 입력"
          value={token}
          onChangeText={(t) => {
            setToken(t);
            if (tokenError) setTokenError(undefined);
          }}
          autoCapitalize="none"
          keyboardType="number-pad"
          error={tokenError}
        />

        <Text style={styles.label}>새 비밀번호</Text>
        <TextField
          placeholder="영문, 숫자 포함 8자 이상"
          value={newPassword}
          onChangeText={(t) => {
            setNewPassword(t);
            if (!t) {
              setNewPasswordError("비밀번호 형식이 올바르지 않습니다.");
            } else if (!isValidPassword(t)) {
              setNewPasswordError("비밀번호 형식이 올바르지 않습니다.");
            } else {
              setNewPasswordError(undefined);
            }
          }}
          secureTextEntry
          error={newPasswordError}
        />

        <Text style={styles.label}>새 비밀번호 확인</Text>
        <TextField
          placeholder="비밀번호 확인"
          value={newPasswordCheck}
          onChangeText={(t) => {
            setNewPasswordCheck(t);
            if (!t) {
              setNewPasswordCheckError("비밀번호가 일치하지 않습니다.");
            } else if (newPassword !== t) {
              setNewPasswordCheckError("비밀번호가 일치하지 않습니다.");
            } else {
              setNewPasswordCheckError(undefined);
            }
          }}
          secureTextEntry
          error={newPasswordCheckError}
        />
      </View>

      <View style={styles.submitWrap}>
        <Button
          title="재설정하기"
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
    paddingTop: 10,
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
    marginTop: 30,
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

export default PasswordResetInputScreen;
