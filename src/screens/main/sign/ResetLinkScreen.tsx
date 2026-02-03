import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../../constants/colors";
import Button from "../../../components/common/Button";
import Check from "../../../../assets/ComponentsImage/check.svg";

const ResetLinkScreen: React.FC = () => {
  const onResend = () => {
    console.log("재설정 링크 다시 받기");
  };

  const onNext = () => {
    console.log("다음으로");
  };

  return (
    <View style={styles.container}>

      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <Check width={44} height={44} style={styles.checkButton} />
        </View>

        <Text style={styles.title}>재설정 링크 발송 완료</Text>

        <Text style={styles.desc}>
          입력하신 이메일 주소로{"\n"}
          비밀번호 재설정 링크를 보냈습니다.
        </Text>
      </View>

      <View style={styles.bottom}>
        <Button
          title="재설정 링크 다시 받기"
          variant="dark"
          onPress={onResend}
        />
        <View style={{ height: 12 }} />
        <Button title="다음으로" onPress={onNext} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 140,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },

  center: {
    alignItems: "center",
    marginTop: 40,
  },

  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  title: {
    color: colors.grayscale[100],
        fontFamily: 'Pretendard-SemiBold',
        fontSize: 24,
        justifyContent: 'center',
        marginTop: 24,
        marginBottom: 16,
  },

  desc: {
        color: colors.grayscale[500],
        fontSize: 17,
        fontFamily: 'Pretendard-Regular',
        textAlign: 'center',
        lineHeight: 28,
        marginBottom: 100,
  },

  bottom: {
    width: '100%',
    marginBottom: '60%',
  },

  checkButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ResetLinkScreen;