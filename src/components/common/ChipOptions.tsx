import { Text, View, StyleSheet } from 'react-native';
import Chip from './Chip';
import { colors } from '../../constants/colors';

type ChipOption = {
  id: string;
  label: string;
};

type ChipOptionsProps = {
  groupId: string;  
  options: ChipOption[];
  optionText?: string;
};

const ChipOptions = ({
  groupId,
  options,
  optionText = '(기본 or 추가 옵션 텍스트)',
}: ChipOptionsProps) => {
  return (
    <>
      <Text style={styles.optionText}>{optionText}</Text>
      <View style={styles.chipContainer}>
        {options.map(option => (
          <Chip
            key={option.id}
            groupId={groupId}
            id={option.id}
            label={option.label}
          />
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  optionText: {
    color: colors.grayscale[500],
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    marginBottom: 20,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8
  },
});

export default ChipOptions;
