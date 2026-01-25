import { StyleSheet, View, Text } from "react-native";
import { colors } from "../../constants/colors";
import Stteper from "./Stteper";

interface StteperItemProps {
  optionTitle: string;
}
const StteperItem = ({ optionTitle }: StteperItemProps) => {
  return(
    <View style={styles.container}>
      <Text style={styles.title}>{optionTitle}</Text>
      <Stteper />
    </View>
    )
  }

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: '100%',
    height: 47,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 14,
    color: colors.grayscale[100],
    fontFamily: 'Pretendard-Medium',
  },
});

export default StteperItem;