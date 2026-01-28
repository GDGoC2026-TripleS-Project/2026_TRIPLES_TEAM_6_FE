import { View, StyleSheet } from "react-native";
import Slider from '@react-native-community/slider';
import { colors } from "../../constants/colors";

type BarProps = {
  min?: number;
  max?: number;
  step?: number;
  initialValue?: number;
  onValueChange?: (value: number) => void;
};

const Bar = ({
  min = 0,
  max = 100,
  step = 1,
  initialValue = 50,
  onValueChange,
}: BarProps) => {
  return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={initialValue}
        minimumTrackTintColor={colors.primary[500]} 
        maximumTrackTintColor={colors.grayscale[600]} 
        thumbTintColor={colors.grayscale[100]} 
        onValueChange={onValueChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  slider: {
    width: "100%",
    height: 40,
  },
});

export default Bar;