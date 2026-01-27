import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../constants/colors";
import Button from "../../components/common/Button";
import Check from "../../../assets/ComponentsImage/check.svg";

const PasswordResetScreen: React.FC = () => {
  const Complete = () => {
    console.log("로그인 화면으로 이동");
  };

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <Check width={44} height={44} />
        </View>

        <Text style={styles.title}>비밀번호 재설정 완료</Text>
        <Text style={styles.desc}>새로운 비밀번호로 로그인해 주세요.</Text>
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
    marginBottom: 16,
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
    marginBottom: '60%',
  },
});

export default PasswordResetScreen;
