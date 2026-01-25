import { Text, View, StyleSheet } from 'react-native';
import Chip from './Chip';
import { colors } from '../../constants/colors';

type ChipOption = {
  id: string;
  label: string;
};

type ChipOptionsProps = {
  options: ChipOption[];
};

const ChipOptions = ({ options }: ChipOptionsProps) => (
  <>
    <Text style={styles.optionText}>(기본 or 추가 옵션 텍스트)</Text>
    <View style={styles.chipContainer}>
      {options.map(option => (
        <Chip key={option.id} label={option.label} />
      ))}
    </View>
  </>
);

const styles = StyleSheet.create({
  optionText: {
    color: colors.grayscale[500],
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});

export default ChipOptions;
