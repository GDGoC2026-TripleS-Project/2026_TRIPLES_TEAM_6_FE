import { StyleSheet, View, Text, Pressable } from "react-native";
import { useState } from "react";

import PlusOn from "../../../assets/plusOn.svg";
import PlusOff from "../../../assets/plusOff.svg";
import MinusOn from "../../../assets/minusOn.svg";
import MinusOff from "../../../assets/minusOff.svg";

import { colors } from "../../constants/colors";

interface StepperProps {
  min?: number;
  max?: number;
  initialValue?: number;
}

const Stepper: React.FC<StepperProps> = ({
  min = 0,
  max = 99,
  initialValue = 0,
}) => {
  const [count, setCount] = useState<number>(initialValue);

  const isMinusDisabled = count <= min;
  const isPlusDisabled = count >= max;

  const handleMinus = () => {
    if (!isMinusDisabled) {
      setCount(prev => prev - 1);
    }
  };

  const handlePlus = () => {
    if (!isPlusDisabled) {
      setCount(prev => prev + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleMinus} disabled={isMinusDisabled}>
        {isMinusDisabled ? <MinusOff /> : <MinusOn />}
      </Pressable>

      <Text style={styles.count}>{count}</Text>

      <Pressable onPress={handlePlus} disabled={isPlusDisabled}>
        {isPlusDisabled ? <PlusOff /> : <PlusOn />}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 100,
  },
  count: {
    fontSize: 18,
    color: colors.grayscale[100],
    fontFamily: "Pretendard-Medium",
  },
});

export default Stepper;
