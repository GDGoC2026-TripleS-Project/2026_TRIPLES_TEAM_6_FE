import { StyleSheet, View, Text, Pressable } from 'react-native';

import PlusOn from '../../../assets/plusOn.svg';
import PlusOff from '../../../assets/plusOff.svg';
import MinusOn from '../../../assets/minusOn.svg';
import MinusOff from '../../../assets/minusOff.svg';

import { colors } from '../../constants/colors';

interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

const Stepper = ({
  value,
  min = 0,
  max = 99,
  onChange,
}: StepperProps) => {
  const isMinusDisabled = value <= min;
  const isPlusDisabled = value >= max;

  const handleMinus = () => {
    if (!isMinusDisabled) {
      onChange(value - 1);
    }
  };

  const handlePlus = () => {
    if (!isPlusDisabled) {
      onChange(value + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleMinus} disabled={isMinusDisabled}>
        {isMinusDisabled ? <MinusOff /> : <MinusOn />}
      </Pressable>

      <Text style={styles.count}>{value}</Text>

      <Pressable onPress={handlePlus} disabled={isPlusDisabled}>
        {isPlusDisabled ? <PlusOff /> : <PlusOn />}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 100,
  },
  count: {
    fontSize: 18,
    color: colors.grayscale[100],
    fontFamily: 'Pretendard-Medium',
  },
});

export default Stepper;
