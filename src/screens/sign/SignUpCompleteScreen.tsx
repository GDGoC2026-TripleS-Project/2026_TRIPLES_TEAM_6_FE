import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../constants/colors";
import Button from "../../components/common/Button";
import Check from "../../../assets/ComponentsImage/check.svg";

const SignUpCompleteScreen: React.FC = () => {
    const Complete = () => {
        console.log('로그인 화면으로 이동');
    };

    return (
        <View style={styles.container}>
            <Check width={44} height={44} style={styles.checkButton} />
            <Text style={styles.signupComplete}>회원가입 완료</Text>
            <Text style={styles.explain}>
                오늘 마신 음료를 기록하고,{"\n"}나만의 기준으로 카페인과 당류를 관리해 보세요.
            </Text>

            <View style={styles.submit}>
            <Button title="로그인 화면으로 이동" onPress={Complete} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10,
        paddingBottom: 50,
    },

    checkButton: {
        justifyContent: 'center',
        marginBottom: 12,
        alignItems: 'center',
    },

    signupComplete: {
        color: colors.grayscale[100],
        fontFamily: 'Pretendard-SemiBold',
        fontSize: 24,
        justifyContent: 'center',
        marginTop: 24,
        marginBottom: 16,
    },

    explain: {
        color: colors.grayscale[500],
        fontSize: 16,
        fontFamily: 'Pretendard-Regular',
        textAlign: 'center',
        gap: 24,
        lineHeight: 24,
        marginBottom: 90,
    },

    submit: {
        width: '100%',
        marginTop: 20,
        fontFamily: 'Pretendard-SemiBold',
        fontSize: 22,
    },
});

export default SignUpCompleteScreen;