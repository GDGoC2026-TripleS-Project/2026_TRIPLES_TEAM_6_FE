import { Text, StyleSheet } from 'react-native';
import StepperItem from './StteperItem';
import { colors } from '../../constants/colors';

type StepperOption = {
  id: string;
  title: string;
};

type StepperOptionsProps = {
  options: StepperOption[];
};

const StepperOptions = ({ options }: StepperOptionsProps) => (
  <>
    <Text style={styles.optionText}>추가 옵션</Text>
    {options.map(option => (
      <StepperItem key={option.id} optionTitle={option.title} />
    ))}
  </>
);

const styles = StyleSheet.create({
  optionText: {
    color: colors.grayscale[500],
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    marginBottom: 12,
  },
});

export default StepperOptions;
