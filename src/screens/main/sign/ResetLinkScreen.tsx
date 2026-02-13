import React, { useMemo, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { colors } from "../../../constants/colors";
import Button from "../../../components/common/Button";
import TextField from "../../../components/common/TextField";
import { authApiLayer } from "../../../app/features/auth/auth.api";
import Check from "../../../../assets/ComponentsImage/check.svg";

const ResetLinkScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const defaultLoginId = route?.params?.defaultLoginId as string | undefined;
  const defaultEmail = route?.params?.defaultEmail as string | undefined;
  const redirectTo = route?.params?.redirectTo as "MyPage" | "Login" | undefined;

  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const canSubmit = useMemo(() => {
    return verificationCode.trim().length > 0;
  }, [verificationCode]);

  const onResend = async () => {
    if (!defaultLoginId || !defaultEmail) {
      Alert.alert("재전송 실패", "아이디 또는 이메일 정보가 누락되었습니다.");
      return;
    }
    if (isResending) return;
    setIsResending(true);
    try {
      await authApiLayer.requestPasswordReset({
        loginId: defaultLoginId,
        email: defaultEmail,
      });
      Alert.alert("재전송 완료", "인증 코드를 다시 전송했습니다.");
    } catch (e: any) {
      if (__DEV__) {
        console.log("[PW RESET RESEND ERR] status:", e?.response?.status);
        console.log("[PW RESET RESEND ERR] data:", e?.response?.data);
        console.log("[PW RESET RESEND ERR] message:", e?.message);
      }
      Alert.alert(
        "재전송 실패",
        e?.response?.data?.message ??
          e?.message ??
          "인증 코드 재전송에 실패했습니다."
      );
    } finally {
      setIsResending(false);
    }
  };

  const onVerify = async () => {
    if (!defaultLoginId || !defaultEmail) {
      Alert.alert("인증 실패", "아이디 또는 이메일 정보가 누락되었습니다.");
      return;
    }
    if (!verificationCode.trim()) {
      setVerificationError("인증 코드를 입력해 주세요.");
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await authApiLayer.verifyPasswordResetCode({
        loginId: defaultLoginId,
        email: defaultEmail,
        verificationCode: verificationCode.trim(),
      });
      if (__DEV__) {
        console.log("[PW RESET VERIFY RES]", res?.data);
      }
      const ok = res?.data?.data === true;
      if (!ok) {
        Alert.alert("인증 실패", "인증 코드가 유효하지 않습니다.");
        return;
      }
      navigation.navigate("PasswordResetInputScreen", {
        loginId: defaultLoginId,
        email: defaultEmail,
        verificationCode: verificationCode.trim(),
        redirectTo,
      });
    } catch (e: any) {
      if (__DEV__) {
        console.log("[PW RESET VERIFY ERR] status:", e?.response?.status);
        console.log("[PW RESET VERIFY ERR] data:", e?.response?.data);
        console.log("[PW RESET VERIFY ERR] message:", e?.message);
      }
      Alert.alert(
        "인증 실패",
        e?.response?.data?.message ??
          e?.message ??
          "인증 코드 확인에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 헤더 영역 */}
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Check width={44} height={44} />
          </View>

          <Text style={styles.title}>인증 코드 발송 완료</Text>

          <Text style={styles.desc}>
            입력하신 이메일 주소로{'\n'}인증 코드를 보냈습니다.
          </Text>
        </View>

        {/* 폼 영역 */}
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.label}>인증 코드</Text>
            <TouchableOpacity 
              onPress={onResend} 
              disabled={isResending}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.resendText,
                isResending && styles.resendTextDisabled
              ]}>
                {isResending ? "전송 중..." : "재전송"}
              </Text>
            </TouchableOpacity>
          </View>

          <TextField
            placeholder="인증 코드 입력"
            value={verificationCode}
            onChangeText={(t) => {
              setVerificationCode(t);
              if (verificationError) setVerificationError(undefined);
            }}
            autoCapitalize="characters"
            autoFocus={true}
            keyboardType="default"
            returnKeyType="done"
            onSubmitEditing={onVerify}
            error={verificationError}
          />

          {defaultEmail && (
            <Text style={styles.emailHint}>
              {defaultEmail}로 전송되었습니다
            </Text>
          )}
        </View>

        {/* 버튼 영역 */}
        <View style={styles.buttonContainer}>
          <Button
            title="인증 코드 확인"
            disabled={!canSubmit || isSubmitting}
            onPress={onVerify}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  header: {
    alignItems: "center",
    marginBottom: 48,
  },

  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  title: {
    color: colors.grayscale[100],
    fontFamily: "Pretendard-SemiBold",
    fontSize: 26,
    marginBottom: 12,
    textAlign: "center",
  },

  desc: {
    color: colors.grayscale[500],
    fontSize: 16,
    fontFamily: "Pretendard-Regular",
    textAlign: "center",
    lineHeight: 24,
  },

  formContainer: {
    width: "100%",
  },

  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  label: {
    color: colors.grayscale[200],
    fontSize: 14,
    fontFamily: "Pretendard-Medium",
  },

  resendText: {
    color: colors.primary[500],
    fontSize: 14,
    fontFamily: "Pretendard-Medium",
  },

  resendTextDisabled: {
    color: colors.grayscale[600],
  },

  emailHint: {
    color: colors.grayscale[600],
    fontSize: 13,
    fontFamily: "Pretendard-Regular",
    marginTop: 8,
  },

  buttonContainer: {
    width: "100%",
    marginTop: 32,
  },
});

export default ResetLinkScreen;