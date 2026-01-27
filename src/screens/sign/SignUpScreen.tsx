import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "../../constants/colors";
import TextField from "../../components/common/TextField";
import Button from "../../components/common/Button";

const SignUpScreen: React.FC = () => {
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

    const isValidUsername = (v: string) => /^[a-zA-Z0-9]+$/.test(v) && /[a-zA-Z]/.test(v) && /[0-9]/.test(v);
    const isValidPassword = (v: string) => v.length >= 8 && /[a-zA-Z]/.test(v) && /[0-9]/.test(v);
    const isValidNickname = (v: string) => v.trim().length >= 2 && v.trim().length <= 10;
    const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const validateAll = () => {
        let ok = true;

        if (!userName.trim()) {
            setUserNameError('아이디를 입력해 주세요.');
            ok = false;
        } else if (!isValidUsername(userName.trim())) {
            setUserNameError('아이디 형식이 올바르지 않습니다.');
            ok = false;
        } else {
            setUserNameError(undefined);
        }

        if (!password) {
            setPasswordError('비밀번호를 입력해 주세요.');
            ok = false;
        } else if (!isValidPassword(password)) {
            setPasswordError('비밀번호 형식이 올바르지 않습니다.');
            ok = false;
        } else {
            setPasswordError(undefined);
        }

        if (!passwordCheck) {
            setPasswordCheckError('비밀번호 확인을 입력해 주세요.');
            ok = false;
        } else if (password !== passwordCheck) {
            setPasswordCheckError('비밀번호가 일치하지 않습니다.');
            ok = false;
        } else {
            setPasswordCheckError(undefined);
        }

        if (!nickname.trim()) {
            setNicknameError('닉네임을 입력해 주세요.');
            ok = false;
        } else if (!isValidNickname(nickname)) {
            setNicknameError('닉네임 형식이 올바르지 않습니다.');
            ok = false;
        } else {
            setNicknameError(undefined);
        }

        if (!email.trim()) {
            setEmailError('이메일을 입력해 주세요.');
            ok = false;
        } else if (!isValidEmail(email.trim())) {
            setEmailError('이메일 형식이 올바르지 않습니다.');
            ok = false;
        } else {
            setEmailError(undefined);
        }

        if (!agree) ok = false;

        return ok;
    };

    const canSubmit = useMemo(() => {
        return (
            userName.trim() &&
            password &&
            passwordCheck &&
            nickname.trim() &&
            email.trim() &&
            isValidUsername(userName.trim()) &&
            isValidPassword(password) &&
            password === passwordCheck &&
            isValidNickname(nickname) &&
            isValidEmail(email.trim()) &&
            agree
        );
    }, [userName, password, passwordCheck, nickname, email, agree]);

    const onSubmit = () => {
        const ok = validateAll();
        if (!ok) return;

        console.log('회원가입 시도');
    };

    return (
        <View style={styles.container}>

            <View style={styles.form}>
                <Text style={styles.label}>아이디</Text>
                <TextField
                placeholder="영문, 숫자 조합"
                value={userName}
                onChangeText={(t) => {
                    setUserName(t);
                    if (userNameError) setUserNameError(undefined);
                }}
                autoCapitalize="none"
                error={userNameError}
                />

                <Text style={styles.label}>비밀번호</Text>
                <TextField
                placeholder="영문, 숫자 포함 8자 이상"
                value={password}
                onChangeText={(t) => {
                    setPassword(t);
                    if (passwordError) setPasswordError(undefined);
                }}
                secureTextEntry
                error={passwordError}
                />

                <Text style={styles.label}>비밀번호 확인</Text>
                <TextField
                placeholder="비밀번호 확인"
                value={passwordCheck}
                onChangeText={(t) => {
                    setPasswordCheck(t);
                    if (passwordCheckError) setPasswordCheckError(undefined);
                }}
                secureTextEntry
                error={passwordCheckError}
                />

                <Text style={styles.label}>닉네임</Text>
                <TextField
                placeholder="2~10자 이내"
                value={nickname}
                onChangeText={(t) => {
                    setNickname(t);
                    if (nicknameError) setNicknameError(undefined);
                }}
                error={nicknameError}
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

                <View style={styles.agreeRow}>
                    <Pressable
                    style={styles.agreeLeft}
                    onPress={() => setAgree((p) => !p)}
                    hitSlop={10}
                    >
                        <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
                            {agree && <View style={styles.checkboxDot} />}
                        </View>
                        <Text style={styles.agreeText}>개인정보 수집 및 이용 동의 (필수)</Text>
                    </Pressable>

                    <Pressable hitSlop={10} onPress={() => {}}>
                        <Text style={styles.detailText}>자세히 보기</Text>
                    </Pressable>
                </View>

                <View style={styles.submitWrap}>
                    <Button title="가입하기" disabled={!canSubmit} onPress={onSubmit} />
                </View>
            </View>
        </View>
    );
};

const WIDTH = 370;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
    alignItems: "center",
    paddingTop: 52,
    paddingHorizontal: 16,
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
    width: WIDTH,
    gap: 10,
  },

  label: {
    marginTop: 10,
    color: colors.grayscale[200],
    fontSize: 12,
    fontFamily: "Pretendard-Regular",
  },

  agreeRow: {
    width: WIDTH,
    marginTop: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  agreeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.grayscale[600],
    alignItems: "center",
    justifyContent: "center",
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
    width: WIDTH,
    marginTop: 16,
  },
});

export default SignUpScreen;