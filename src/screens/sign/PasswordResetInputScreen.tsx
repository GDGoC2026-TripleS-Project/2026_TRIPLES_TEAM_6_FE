import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../constants/colors";
import TextField from "../../components/common/TextField";
import Button from "../../components/common/Button";

const PasswordResetInputScreen: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordCheck, setNewPasswordCheck] = useState("");

  const [newPasswordError, setNewPasswordError] = useState<string | undefined>();
  const [newPasswordCheckError, setNewPasswordCheckError] = useState<string | undefined>();

  const isValidPassword = (v: string) =>
    v.length >= 8 && /[a-zA-Z]/.test(v) && /[0-9]/.test(v);

  const validateAll = () => {
    let ok = true;

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
      newPassword &&
      newPasswordCheck &&
      isValidPassword(newPassword) &&
      newPassword === newPasswordCheck
    );
  }, [newPassword, newPasswordCheck]);

  const onSubmit = () => {
    const ok = validateAll();
    if (!ok) return;

    console.log("비밀번호 재설정하기");
    // api
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={styles.pageTitle}>비밀번호 재설정</Text>
        <Text style={styles.pageDesc}>새로운 비밀번호를 입력해 주세요.</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>새 비밀번호</Text>
        <TextField
          placeholder="영문, 숫자 포함 8자 이상"
          value={newPassword}
          onChangeText={(t) => {
            setNewPassword(t);
            if (newPasswordError) setNewPasswordError(undefined);
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
            if (newPasswordCheckError) setNewPasswordCheckError(undefined);
          }}
          secureTextEntry
          error={newPasswordCheckError}
        />
      </View>

      <View style={styles.submitWrap}>
        <Button title="재설정하기" disabled={!canSubmit} onPress={onSubmit} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
    alignItems: "center",
    paddingTop: 52,
    paddingHorizontal: 16,
  },

  headerArea: {
    width: '100%',
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
    width: '100%',
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
    width: '100%',
    marginTop: 60,
  },
});

export default PasswordResetInputScreen;