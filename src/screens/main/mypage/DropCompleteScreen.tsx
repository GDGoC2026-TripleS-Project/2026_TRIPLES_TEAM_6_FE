import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../../constants/colors";
import Button from "../../../components/common/Button";
import Check from "../../../../assets/ComponentsImage/check.svg";

const DropCompleteScreen: React.FC = () => {
    const Complete = () => {
        console.log('로그인 화면으로 이동');
    };

    return (
        <View style={styles.container}>
            <View style={styles.center}>
            <View style={styles.iconWrap}>
            <Check width={44} height={44} />
            </View>

            <Text style={styles.title}>회원 탈퇴 완료</Text>
            <Text style={styles.desc}>
                지금까지의 기록과 설정이 모두 삭제되었어요.{"\n"}이용해 주셔서 감사합니다.
            </Text>
            </View>

            <View style={styles.bottom}>
            <Button title="로그인 화면으로 이동" onPress={Complete} />
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
    marginTop: 10,  
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
    fontFamily: "Pretendard-SemiBold",
    fontSize: 24,
    marginTop: 24,
    marginBottom: 20,
    textAlign: "center",
  },

  desc: {
    color: colors.grayscale[500],
    fontSize: 17,
    fontFamily: "Pretendard-Regular",
    textAlign: "center",
    lineHeight: 28,
  },

  bottom: {
    width: '100%', 
    marginBottom: '77%',
  },
});

export default DropCompleteScreen;